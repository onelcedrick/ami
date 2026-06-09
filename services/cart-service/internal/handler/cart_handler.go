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

// GET /api/v1/cart
func (h *CartHandler) GetCart(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	cart, err := h.service.GetCart(userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Erreur récupération panier",
		})
	}

	return c.JSON(cart)
}

// POST /api/v1/cart/items
func (h *CartHandler) AddToCart(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	var req model.AddToCartRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Données invalides",
		})
	}

	if req.ProductID == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "ID produit requis",
		})
	}

	item, err := h.service.AddToCart(userID, req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(201).JSON(item)
}

// PUT /api/v1/cart/items/:id
func (h *CartHandler) UpdateQuantity(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	itemID := c.Params("id")

	var req model.UpdateQuantityRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Données invalides",
		})
	}

	if err := h.service.UpdateQuantity(userID, itemID, req.Quantity); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{"message": "Quantité mise à jour"})
}

// DELETE /api/v1/cart/items/:id
func (h *CartHandler) RemoveItem(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	itemID := c.Params("id")

	if err := h.service.RemoveItem(userID, itemID); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Erreur suppression",
		})
	}

	return c.JSON(fiber.Map{"message": "Article supprimé"})
}

// DELETE /api/v1/cart
func (h *CartHandler) ClearCart(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	if err := h.service.ClearCart(userID); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Erreur vidage panier",
		})
	}

	return c.JSON(fiber.Map{"message": "Panier vidé"})
}

// GET /api/v1/cart/count
func (h *CartHandler) GetCartCount(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	count, err := h.service.GetCartCount(userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Erreur",
		})
	}

	return c.JSON(fiber.Map{"count": count})
}
