package handler

import (
	"github.com/am-info/cart-service/internal/model"
	"github.com/am-info/cart-service/internal/service"
	"github.com/gofiber/fiber/v2"
)

type CartHandler struct {
	service *service.CartService
}

func NewCartHandler(service *service.CartService) *CartHandler {
	return &CartHandler{service: service}
}

func (h *CartHandler) GetCart(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	cart, err := h.service.GetCart(userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erreur"})
	}
	return c.JSON(cart)
}

func (h *CartHandler) AddToCart(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	var req model.AddToCartRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Données invalides"})
	}
	cart, err := h.service.AddToCart(userID, req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(cart)
}

func (h *CartHandler) UpdateQuantity(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	itemID := c.Params("id")
	var req struct {
		Quantity int `json:"quantity"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Données invalides"})
	}
	cart, err := h.service.UpdateQuantity(userID, itemID, req.Quantity)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(cart)
}

func (h *CartHandler) RemoveItem(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	itemID := c.Params("id")
	cart, err := h.service.RemoveItem(userID, itemID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erreur"})
	}
	return c.JSON(cart)
}

func (h *CartHandler) ClearCart(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	h.service.ClearCart(userID)
	return c.JSON(fiber.Map{"message": "Panier vidé"})
}

func (h *CartHandler) GetCartCount(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	count, _ := h.service.GetCartCount(userID)
	return c.JSON(fiber.Map{"count": count})
}
