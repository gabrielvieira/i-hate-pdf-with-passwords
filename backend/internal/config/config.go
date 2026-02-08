package config

type Config struct {
	UploadDir string
	ResultDir string
}

func NewConfig() *Config {
	return &Config{
		UploadDir: "./uploads",
		ResultDir: "./results",
	}
}
