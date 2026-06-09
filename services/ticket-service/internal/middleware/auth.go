package middleware

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"log"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

var publicKey *rsa.PublicKey

func init() {
	paths := []string{"../../keys/public.pem", "../keys/public.pem", "keys/public.pem"}
	for _, p := range paths {
		keyData, err := os.ReadFile(p)
		if err == nil {
			block, _ := pem.Decode(keyData)
			if block != nil {
				pubKey, err := x509.ParsePKIXPublicKey(block.Bytes)
				if err == nil {
					publicKey = pubKey.(*rsa.PublicKey)
					log.Println("✅ Ticket Service: Clé JWT chargée depuis", p)
					return
				}
			}
		}
	}
	log.Println("⚠️ Ticket Service: Pas de clé JWT, utilisation X-User-ID")
}

func AuthMiddleware(c *fiber.Ctx) error {
	// 1. Essayer JWT
	authHeader := c.Get("Authorization")
	if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") && publicKey != nil {
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return publicKey, nil
		})
		if err == nil && token.Valid {
			if claims, ok := token.Claims.(jwt.MapClaims); ok {
				c.Locals("user_id", claims["sub"].(string))
				c.Locals("user_role", claims["role"].(string))
				return c.Next()
			}
		}
	}

	// 2. Fallback X-User-ID
	userID := c.Get("X-User-ID")
	if userID != "" {
		c.Locals("user_id", userID)
		c.Locals("user_role", c.Get("X-User-Role", "client"))
		return c.Next()
	}

	return c.Status(401).JSON(fiber.Map{"error": "Authentification requise"})
}
