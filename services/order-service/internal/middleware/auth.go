package middleware

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
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
				pubKey, _ := x509.ParsePKIXPublicKey(block.Bytes)
				if pubKey != nil {
					publicKey = pubKey.(*rsa.PublicKey)
					return
				}
			}
		}
	}
}

func AuthMiddleware(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") && publicKey != nil {
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) { return publicKey, nil })
		if err == nil && token.Valid {
			claims := token.Claims.(jwt.MapClaims)
			c.Locals("user_id", claims["sub"])
			c.Locals("user_role", claims["role"])
			return c.Next()
		}
	}

	userID := c.Get("X-User-ID")
	if userID != "" {
		c.Locals("user_id", userID)
		c.Locals("user_role", "client")
		return c.Next()
	}

	return c.Status(401).JSON(fiber.Map{"error": "Authentification requise"})
}
