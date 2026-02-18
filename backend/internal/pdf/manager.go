package pdf

import (
	"context"
	"fmt"
	"i-hate-pdf-with-passwords/internal/config"
	"sync"
	"time"

	"go.uber.org/zap"
)

const (
	StatusPending = "pending"
	StatusCracked = "cracked"
	StatusFailed  = "failed"
)

type Manager struct {
	fileStatuses map[string]string
	processChan  chan string
	logger       *zap.Logger
	mu           sync.RWMutex
	config       *config.Config
}

func NewPDFManager(logger *zap.Logger, config *config.Config) *Manager {
	return &Manager{
		fileStatuses: make(map[string]string),
		processChan:  make(chan string),
		logger:       logger,
		config:       config,
	}
}

func (m *Manager) Start() {
	go m.process()
}

func (m *Manager) Stop() {
	close(m.processChan)
}

func (m *Manager) setStatus(filename, status string) {
	m.mu.Lock()
	m.fileStatuses[filename] = status
	defer m.mu.Unlock()
}

func (m *Manager) AddToCrackQueue(filename string) string {
	m.setStatus(filename, StatusPending)
	m.processChan <- filename
	return StatusPending
}

func (m *Manager) GetStatus(filename string) (string, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	status, ok := m.fileStatuses[filename]
	if !ok {
		return "", fmt.Errorf("status not found for file: %s", filename)
	}
	return status, nil
}

func (m *Manager) process() {
	for filename := range m.processChan {
		go func() {
			// cancel long crack operations
			ctx, cancel := context.WithTimeout(context.Background(), time.Minute*5)
			defer cancel()
			password, err := CrackPassword(ctx, m.config.UploadDir, filename)
			if err != nil {
				m.setStatus(filename, StatusFailed)
				m.logger.Error("Failed to crack password", zap.String("filename", filename), zap.Error(err))
				return
			}
			err = DecryptPDF(m.config.UploadDir, m.config.ResultDir, filename, password)
			if err != nil {
				m.setStatus(filename, StatusFailed)
				m.logger.Error("Failed to decrypt PDF", zap.String("filename", filename), zap.Error(err))
				return
			}
			m.logger.Info("PDF decrypted successfully", zap.String("filename", filename))
			m.setStatus(filename, StatusCracked)
		}()
	}
}
