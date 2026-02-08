package config

type Config struct {
	uploadDir string
	resultDir string
}

func NewConfig() *Config {
	return &Config{}
}
