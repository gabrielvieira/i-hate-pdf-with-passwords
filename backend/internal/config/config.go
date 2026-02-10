package config

type Config struct {
	UploadDir string
	ResultDir string
}

func NewConfig() *Config {
	return &Config{
		UploadDir: "./upload",
		ResultDir: "./result",
	}
}
