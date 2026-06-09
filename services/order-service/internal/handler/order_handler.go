package handler

import (
	"github.com/am-info/order-service/internal/model"
	"github.com/am-info/order-service/internal/service"
	"github.com/gofiber/fiber/v2"
)

type OrderHandler struct {
	service *service.OrderService
}

func NewOrderHandler(service *service.OrderService) *OrderHandler {
	return &OrderHandler{service: service}
}

// POST /api/v1/orders
func (h *OrderHandler) CreateOrder(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	var req model.CreateOrderRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Données invalides"})
	}

	if req.ShippingAddress == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Adresse de livraison requise"})
	}

	order, err := h.service.CreateOrder(userID, req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(order)
}

// GET /api/v1/orders
func (h *OrderHandler) GetUserOrders(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	status := c.Query("status")

	orders, err := h.service.GetUserOrders(userID, status)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erreur récupération commandes"})
	}

	if orders == nil {
		orders = []model.Order{}
	}

	return c.JSON(orders)
}

// GET /api/v1/orders/:id
func (h *OrderHandler) GetOrder(c *fiber.Ctx) error {
	orderID := c.Params("id")

	order, err := h.service.GetOrder(orderID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Commande non trouvée"})
	}

	return c.JSON(order)
}

// PUT /api/v1/orders/:id/status (admin)
func (h *OrderHandler) UpdateStatus(c *fiber.Ctx) error {
	orderID := c.Params("id")

	var req model.UpdateStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Statut invalide"})
	}

	if err := h.service.UpdateStatus(orderID, req.Status); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Statut mis à jour"})
}

// POST /api/v1/orders/:id/pay
func (h *OrderHandler) ProcessPayment(c *fiber.Ctx) error {
	orderID := c.Params("id")

	var req model.PaymentRequest
	if err := c.BodyParser(&req); err != nil {
		req = model.PaymentRequest{PaymentMethod: "card"}
	}

	if err := h.service.ProcessPayment(orderID, req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Paiement traité"})
}

// PUT /api/v1/orders/:id/cancel
func (h *OrderHandler) CancelOrder(c *fiber.Ctx) error {
	orderID := c.Params("id")

	if err := h.service.CancelOrder(orderID); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Commande annulée"})
}

// GET /api/v1/admin/orders (admin)
func (h *OrderHandler) GetAllOrders(c *fiber.Ctx) error {
	status := c.Query("status")
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)

	orders, total, err := h.service.GetAllOrders(status, page, limit)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erreur"})
	}

	return c.JSON(fiber.Map{
		"data": orders,
		"total": total,
		"page": page,
	})
}
