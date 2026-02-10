package main

import (
	"i-hate-pdf-with-passwords/internal/api"
	config "i-hate-pdf-with-passwords/internal/config"
	"i-hate-pdf-with-passwords/internal/pdf"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func main() {
	// TODO: Add more logger config if needed
	r := gin.Default()
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
	// TODO: graceful shutdown
	r.Run(":8080")
}
