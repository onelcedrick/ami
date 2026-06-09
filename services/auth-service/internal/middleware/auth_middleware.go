package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type AuthMiddleware struct {
	publicKey interface{}
}

func NewAuthMiddleware(publicKey interface{}) *AuthMiddleware {
	return &AuthMiddleware{publicKey: publicKey}
}

// RequireAuth vérifie le token JWT
func (m *AuthMiddleware) RequireAuth(c *fiber.Ctx) error {
	// Extraire le token du header Authorization
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(401).JSON(fiber.Map{
			"error": "Token d'authentification requis",
		})
	}

	// Vérifier le format "Bearer <token>"
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return c.Status(401).JSON(fiber.Map{
			"error": "Format de token invalide",
		})
	}

	tokenString := parts[1]

	// Parser et valider le token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fiber.NewError(401, "Méthode de signature invalide")
		}
		return m.publicKey, nil
	})

	if err != nil || !token.Valid {
		return c.Status(401).JSON(fiber.Map{
			"error": "Token invalide ou expiré",
		})
	}

	// Extraire les claims
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(401).JSON(fiber.Map{
			"error": "Claims invalides",
		})
	}

	// Vérifier que c'est un access token
	if claims["type"] != "access" {
		return c.Status(401).JSON(fiber.Map{
			"error": "Type de token invalide",
		})
	}

	// Stocker les infos utilisateur dans le contexte
	c.Locals("user_id", claims["sub"])
	c.Locals("user_email", claims["email"])
	c.Locals("user_role", claims["role"])
	c.Locals("user_first_name", claims["first_name"])
	c.Locals("user_last_name", claims["last_name"])

	return c.Next()
}

// RequireRole vérifie le rôle de l'utilisateur
func (m *AuthMiddleware) RequireRole(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole := c.Locals("user_role").(string)
		for _, role := range roles {
			if userRole == role {
				return c.Next()
			}
		}
		return c.Status(403).JSON(fiber.Map{
			"error": "Accès non autorisé",
		})
	}
}
