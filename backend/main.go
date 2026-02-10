package main

import (
	"i-hate-pdf-with-passwords/internal/api"
	config "i-hate-pdf-with-passwords/internal/config"
	"i-hate-pdf-with-passwords/internal/pdf"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func main() {
	// TODO: Add more logger config if needed
	r := gin.Default()

	// CORS middleware for development
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	logger, err := zap.NewProduction()
	if err != nil {
		panic(err)
	}
	cfg := config.NewConfig()
	pdfManager := pdf.NewPDFManager(logger, cfg)
	// start processing queue
	pdfManager.Start()
	pdfAPI := api.NewAPI(cfg, pdfManager, logger)
	pdfAPI.RegisterRoutes(r)

	// Serve static frontend files
	r.Static("/assets", "../FE/dist/assets")
	r.StaticFile("/vite.svg", "../FE/dist/vite.svg")
	r.NoRoute(func(c *gin.Context) {
		c.File("../FE/dist/index.html")
	})

	// TODO: graceful shutdown
	r.Run(":8080")
}
