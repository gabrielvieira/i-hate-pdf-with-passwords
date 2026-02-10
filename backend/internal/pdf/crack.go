package pdf

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// TODO: implement crack timeout (maybe we don't need it)

func detectHashMode(hash string) string {
	if strings.HasPrefix(hash, "$pdf$1*") {
		return "10400" // PDF 1.1-1.3
	} else if strings.HasPrefix(hash, "$pdf$2*") {
		return "10500" // PDF 1.4-1.6
	} else if strings.HasPrefix(hash, "$pdf$4*") {
		return "10600" // PDF 1.7 Level 3
	} else if strings.HasPrefix(hash, "$pdf$5*") {
		return "10700" // PDF 1.7 Level 8
	}
	return "10500" // Default fallback
}

func getPDFHash(sourceDir, filename string) (string, error) {
	sourcePath := filepath.Join(sourceDir, filename)
	pdf2johnCmd := exec.Command("pdf2john", sourcePath)
	hashData, err := pdf2johnCmd.Output()
	if err != nil {
		return "", fmt.Errorf("pdf2john failed: %w", err)
	}
	lines := strings.Split(string(hashData), "\n")
	hashStr := ""
	for _, line := range lines {
		if strings.HasPrefix(line, "$pdf$") {
			hashStr = strings.TrimSpace(line)
			break
		}
	}
	if hashStr == "" {
		return "", fmt.Errorf("no valid hash found")
	}
	return hashStr, nil
}

func CrackPassword(sourceDir, filename string) (string, error) {
	hashStr, err := getPDFHash(sourceDir, filename)
	if err != nil {
		return "", fmt.Errorf("pdf2john failed: %w", err)
	}
	hashMode := detectHashMode(hashStr)
	// Try different lengths from 1 to 12
	for length := 1; length <= 12; length++ {
		mask := strings.Repeat("?d", length)
		hashcatCmd := exec.Command("hashcat", "-m", hashMode, "-a", "3", hashStr, mask)
		hashcatCmd.Run() // Ignore errors, check with --show
		// Check if password was found
		showCmd := exec.Command("hashcat", "-m", hashMode, hashStr, "--show")
		output, err := showCmd.Output()
		if err == nil && len(output) > 0 {
			// Parse output: format is "hash:password"
			parts := strings.Split(strings.TrimSpace(string(output)), ":")
			if len(parts) >= 2 {
				return parts[len(parts)-1], nil
			}
		}
	}
	return "", fmt.Errorf("password not found (tried lengths 1-12)")
}

func DecryptPDF(sourceDir, destDir, filename, password string) error {
	sourcePath := filepath.Join(sourceDir, filename)
	outputPath := filepath.Join(destDir, filename)

	// Ensure destination directory exists
	if err := os.MkdirAll(destDir, 0755); err != nil {
		return fmt.Errorf("failed to create destination directory: %w", err)
	}

	cmd := exec.Command("qpdf", sourcePath, "--password="+password, "--decrypt", outputPath)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	err := cmd.Run()

	// Ignore error if output contains "operation succeeded with warnings"
	if err != nil {
		stderrStr := stderr.String()
		if strings.Contains(stderrStr, "operation succeeded with warnings") {
			return nil
		}
		return fmt.Errorf("qpdf failed: %s: %w", stderrStr, err)
	}

	return nil
}
