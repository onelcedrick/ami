package handler

import (
	"github.com/am-info/ticket-service/internal/model"
	"github.com/am-info/ticket-service/internal/service"
	"github.com/gofiber/fiber/v2"
)

type TicketHandler struct {
	service *service.TicketService
}

func NewTicketHandler(service *service.TicketService) *TicketHandler {
	return &TicketHandler{service: service}
}

// POST /api/v1/tickets
func (h *TicketHandler) CreateTicket(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	var req model.CreateTicketRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Données invalides"})
	}

	if req.Subject == "" || req.Description == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Sujet et description requis"})
	}

	ticket, err := h.service.CreateTicket(userID, req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(ticket)
}

// GET /api/v1/tickets
func (h *TicketHandler) GetTickets(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	userRole := c.Locals("user_role").(string)
	status := c.Query("status")

	tickets, err := h.service.GetTickets(userID, userRole, status)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	if tickets == nil {
		tickets = []model.Ticket{}
	}

	return c.JSON(tickets)
}

// GET /api/v1/tickets/:id
func (h *TicketHandler) GetTicket(c *fiber.Ctx) error {
	ticketID := c.Params("id")

	ticket, err := h.service.GetTicket(ticketID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Ticket non trouvé"})
	}

	return c.JSON(ticket)
}

// POST /api/v1/tickets/:id/messages
func (h *TicketHandler) AddMessage(c *fiber.Ctx) error {
	ticketID := c.Params("id")
	senderID := c.Locals("user_id").(string)
	senderRole := c.Locals("user_role").(string)

	var req model.AddMessageRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Message invalide"})
	}

	if req.Message == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Message requis"})
	}

	msg, err := h.service.AddMessage(ticketID, senderID, senderRole, req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(msg)
}

// PUT /api/v1/tickets/:id/status
func (h *TicketHandler) UpdateStatus(c *fiber.Ctx) error {
	ticketID := c.Params("id")

	var req model.UpdateStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Statut invalide"})
	}

	if err := h.service.UpdateStatus(ticketID, req.Status); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Statut mis à jour"})
}

// POST /api/v1/tickets/:id/assign
func (h *TicketHandler) AssignTechnician(c *fiber.Ctx) error {
	ticketID := c.Params("id")

	var req model.AssignTechRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Données invalides"})
	}

	if err := h.service.AssignTechnician(ticketID, req.TechnicianID); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Technicien assigné"})
}

// GET /api/v1/tickets/unread-count
func (h *TicketHandler) GetUnreadCount(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	count, err := h.service.GetUnreadCount(userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erreur"})
	}

	return c.JSON(fiber.Map{"unread_count": count})
}

// POST /api/v1/tickets/:id/read
func (h *TicketHandler) MarkAsRead(c *fiber.Ctx) error {
	ticketID := c.Params("id")
	userID := c.Locals("user_id").(string)

	if err := h.service.MarkAsRead(ticketID, userID); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erreur"})
	}

	return c.JSON(fiber.Map{"message": "Marqué comme lu"})
}
