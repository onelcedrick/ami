package handler

import (
	"bytes"
	"fmt"
	"net/http"
	"os"
	"github.com/am-info/auth-service/internal/model"
	"github.com/am-info/auth-service/internal/service"
	"github.com/gofiber/fiber/v2"
)

type AuthHandler struct {
	service *service.AuthService
}

func NewAuthHandler(service *service.AuthService) *AuthHandler {
	return &AuthHandler{service: service}
}

// POST /api/v1/auth/register
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req model.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Données invalides",
		})
	}

	if req.Email == "" || req.Password == "" || req.FirstName == "" || req.LastName == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Tous les champs sont requis",
		})
	}

	if len(req.Password) < 8 {
		return c.Status(400).JSON(fiber.Map{
			"error": "Le mot de passe doit contenir au moins 8 caractères",
		})
	}

	user, err := h.service.Register(req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Compte créé avec succès",
		"user": model.UserResponse{
			ID:        user.ID,
			Email:     user.Email,
			FirstName: user.FirstName,
			LastName:  user.LastName,
			Role:      user.Role,
		},
	})
}

// POST /api/v1/auth/login
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req model.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Données invalides",
		})
	}

	if req.Email == "" || req.Password == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Email et mot de passe requis",
		})
	}

	response, err := h.service.Login(req)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	go logLogin(response.User.Email, response.User.ID)
	return c.JSON(response)
}

// GET /api/v1/auth/me
func (h *AuthHandler) GetProfile(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	user, err := h.service.GetUserByID(userID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Utilisateur non trouvé",
		})
	}

	return c.JSON(user)
}

// POST /api/v1/auth/refresh
func (h *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"message": "Refresh token endpoint",
	})
}

// POST /api/v1/auth/avatar
func (h *AuthHandler) UploadAvatar(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Fichier requis"})
	}

	os.MkdirAll("../../uploads/avatars", 0755)

	filename := fmt.Sprintf("avatar_%s_%s", userID[:8], file.Filename)
	filepath := fmt.Sprintf("../../uploads/avatars/%s", filename)

	if err := c.SaveFile(file, filepath); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erreur sauvegarde"})
	}

	avatarURL := fmt.Sprintf("/uploads/avatars/%s", filename)
	h.service.UpdateAvatar(userID, avatarURL)

	return c.JSON(fiber.Map{
		"message":    "Photo mise a jour",
		"avatar_url": avatarURL,
	})
}

// PUT /api/v1/auth/profile
func (h *AuthHandler) UpdateProfile(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	var input struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Données invalides"})
	}

	if err := h.service.UpdateProfile(userID, input.FirstName, input.LastName); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erreur modification"})
	}

	return c.JSON(fiber.Map{
		"message":    "Profil mis a jour",
		"first_name": input.FirstName,
		"last_name":  input.LastName,
	})
}

func logLogin(email, userID string) {
	adminURL := os.Getenv("ADMIN_SERVICE_URL")
	if adminURL == "" {
		adminURL = "http://localhost:8086"
	}
	data := []byte(fmt.Sprintf(`{"user_id":"%s","user_email":"%s","action":"login","entity":"user","details":"Connexion"}`, userID, email))
	http.Post(adminURL+"/api/v1/admin/logs/activity", "application/json", bytes.NewReader(data))
}
