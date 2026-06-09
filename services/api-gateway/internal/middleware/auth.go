package middleware

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type AuthMiddleware struct {
	publicKey *rsa.PublicKey
}

func NewAuthMiddleware(publicKeyPath string) (*AuthMiddleware, error) {
	keyData, err := os.ReadFile(publicKeyPath)
	if err != nil {
		return nil, fmt.Errorf("erreur lecture clé publique: %w", err)
	}

	block, _ := pem.Decode(keyData)
	if block == nil {
		return nil, fmt.Errorf("échec décodage PEM")
	}

	pubKey, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("échec parsing clé publique: %w", err)
	}

	rsaPubKey, ok := pubKey.(*rsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("clé non RSA")
	}

	return &AuthMiddleware{publicKey: rsaPubKey}, nil
}

// RequireAuth vérifie le token JWT
func (m *AuthMiddleware) RequireAuth(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		// Mode développement : accepter X-User-ID
		userID := c.Get("X-User-ID")
		if userID != "" {
			c.Locals("user_id", userID)
			c.Locals("user_role", c.Get("X-User-Role", "client"))
			return c.Next()
		}
		return c.Status(401).JSON(fiber.Map{"error": "Authentification requise"})
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return c.Status(401).JSON(fiber.Map{"error": "Format token invalide"})
	}

	token, err := jwt.Parse(parts[1], func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("méthode de signature invalide")
		}
		return m.publicKey, nil
	})

	if err != nil || !token.Valid {
		return c.Status(401).JSON(fiber.Map{"error": "Token invalide ou expiré"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Claims invalides"})
	}

	c.Locals("user_id", claims["sub"])
	c.Locals("user_email", claims["email"])
	c.Locals("user_role", claims["role"])

	return c.Next()
}

// RequireRole vérifie le rôle
func (m *AuthMiddleware) RequireRole(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole := c.Locals("user_role").(string)
		for _, role := range roles {
			if userRole == role {
				return c.Next()
			}
		}
		return c.Status(403).JSON(fiber.Map{"error": "Accès refusé"})
	}
}
