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

func CrackPassword(sourceDir, filename string) (string, error) {
	sourcePath := filepath.Join(sourceDir, filename)

	// Generate hash
	hashFile := sourcePath + ".hash"
	pdf2johnCmd := exec.Command("pdf2john", sourcePath)
	hashData, err := pdf2johnCmd.Output()
	if err != nil {
		return "", fmt.Errorf("pdf2john failed: %w", err)
	}
	if err := os.WriteFile(hashFile, hashData, 0644); err != nil {
		return "", fmt.Errorf("failed to write hash: %w", err)
	}
	defer os.Remove(hashFile)

	// Try different lengths from 1 to 12
	for length := 1; length <= 12; length++ {
		mask := strings.Repeat("?d", length)

		hashcatCmd := exec.Command("hashcat", "-m", "10500", "-a", "3", hashFile, mask)
		hashcatCmd.Run() // Ignore errors, check with --show

		// Check if password was found
		showCmd := exec.Command("hashcat", "-m", "10500", hashFile, "--show")
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

	cmd := exec.Command("qpdf", sourcePath, "--password="+password, "--decrypt", outputPath)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("qpdf failed: %s: %w", stderr.String(), err)
	}

	return nil
}
