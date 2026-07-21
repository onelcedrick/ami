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

func (h *OrderHandler) CreateOrder(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	order, err := h.service.CreateOrder(userID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(order)
}

func (h *OrderHandler) GetUserOrders(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	orders, _ := h.service.GetUserOrders(userID)
	if orders == nil { orders = []model.Order{} }
	return c.JSON(orders)
}

func (h *OrderHandler) GetOrder(c *fiber.Ctx) error {
	order, err := h.service.GetOrder(c.Params("id"))
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Commande non trouvée"})
	}
	return c.JSON(order)
}

func (h *OrderHandler) CancelOrder(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	if err := h.service.CancelOrder(userID, c.Params("id")); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "Commande annulée"})
}

func (h *OrderHandler) GetAllOrders(c *fiber.Ctx) error {
	orders, _ := h.service.GetAllOrders()
	return c.JSON(orders)
}

func (h *OrderHandler) UpdateStatus(c *fiber.Ctx) error {
	status := c.Query("status")
	if status == "" {
		var input struct { Status string `json:"status"` }
		c.BodyParser(&input)
		status = input.Status
	}
	if status == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Statut requis"})
	}
	h.service.UpdateStatus(c.Params("id"), status)
	return c.JSON(fiber.Map{"message": "Statut mis à jour"})
}
