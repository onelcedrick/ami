package config

import "os"

type Config struct {
	Port            string
	AuthServiceURL  string
	ProductServiceURL string
	CartServiceURL  string
	OrderServiceURL string
	TicketServiceURL string
	IAServiceURL    string
	PublicKeyPath   string
}

func Load() *Config {
	return &Config{
		Port:             getEnv("PORT", "8080"),
		AuthServiceURL:   getEnv("AUTH_SERVICE_URL", "http://localhost:8081"),
		ProductServiceURL: getEnv("PRODUCT_SERVICE_URL", "http://localhost:8082"),
		CartServiceURL:   getEnv("CART_SERVICE_URL", "http://localhost:8083"),
		OrderServiceURL:  getEnv("ORDER_SERVICE_URL", "http://localhost:8084"),
		TicketServiceURL: getEnv("TICKET_SERVICE_URL", "http://localhost:8085"),
		IAServiceURL:     getEnv("IA_SERVICE_URL", "http://localhost:8000"),
		PublicKeyPath:    getEnv("JWT_PUBLIC_KEY_PATH", "../../keys/public.pem"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
