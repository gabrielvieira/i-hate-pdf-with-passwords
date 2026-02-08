package pdf

import (
	"fmt"
	"sync"

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
	mu           sync.RWMutex // Add this
}

func NewPDFManager(logger *zap.Logger) *Manager {
	return &Manager{
		fileStatuses: make(map[string]string),
		processChan:  make(chan string, 5), // limit 10 simultaneous process
		logger:       logger,
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
	status, ok := m.fileStatuses[filename]
	if !ok {
		return "", fmt.Errorf("status not found for file: %s", filename)
	}
	return status, nil
}

func (m *Manager) process() {
	for filename := range m.processChan {
		password, err := CrackPassword(filename)
		if err != nil {
			m.setStatus(filename, StatusFailed)
			m.logger.Error("Failed to crack password", zap.String("filename", filename), zap.Error(err))
			continue
		}
		err = DecryptPDF(filename, password)
		if err != nil {
			m.setStatus(filename, StatusFailed)
			m.logger.Error("Failed to decrypt PDF", zap.String("filename", filename), zap.Error(err))
			continue
		}
		m.setStatus(filename, StatusCracked)
	}
}
