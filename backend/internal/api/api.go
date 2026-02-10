package api

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"i-hate-pdf-with-passwords/internal/config"
	"i-hate-pdf-with-passwords/internal/pdf"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type API struct {
	config     *config.Config
	pdfManager *pdf.Manager
	logger     *zap.Logger
}

func NewAPI(config *config.Config, pdfManager *pdf.Manager, logger *zap.Logger) *API {
	return &API{
		config:     config,
		pdfManager: pdfManager,
		logger:     logger,
	}
}

func (a *API) RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api/pdf")
	{
		api.POST("/upload", a.uploadPDF)
		api.GET("/status/:filename", a.status)
		api.GET("/results/:filename", a.servePDF)
	}
}

func (a *API) uploadPDF(c *gin.Context) {

	uploadedFile, err := c.FormFile("pdf")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	ext := filepath.Ext(uploadedFile.Filename)
	if ext != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only PDF files are allowed"})
		return
	}

	if uploadedFile.Size > 10<<20 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File too large (max 10MB)"})
		return
	}

	src, err := uploadedFile.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
		return
	}
	defer src.Close()

	fileContent, err := io.ReadAll(src)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file"})
		return
	}

	hash := sha256.Sum256(fileContent)
	hashString := hex.EncodeToString(hash[:])

	if err := os.MkdirAll(a.config.UploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}
	filename := fmt.Sprintf("%s.pdf", hashString)
	path := filepath.Join(a.config.UploadDir, filename)

	if err := c.SaveUploadedFile(uploadedFile, path); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	status := a.pdfManager.AddToCrackQueue(filename)
	c.JSON(http.StatusOK, gin.H{
		"filename": filename,
		"status":   status,
	})
}

func (a *API) servePDF(c *gin.Context) {
	filename := c.Param("filename")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.File(filepath.Join(a.config.ResultDir, filename))
}

func (a *API) status(c *gin.Context) {
	filename := c.Param("filename")
	status, err := a.pdfManager.GetStatus(filename)
	if err != nil {
		c.Status(http.StatusNotFound)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"status": status,
	})
}
