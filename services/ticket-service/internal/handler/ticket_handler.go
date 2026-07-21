package handler

import (
	"fmt"
	"os"

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

func (h *TicketHandler) GetTickets(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	userRole := c.Locals("user_role").(string)
	status := c.Query("status")
	tickets, _ := h.service.GetTickets(userID, userRole, status)
	if tickets == nil { tickets = []model.Ticket{} }
	return c.JSON(tickets)
}

func (h *TicketHandler) GetTicket(c *fiber.Ctx) error {
	ticket, err := h.service.GetTicket(c.Params("id"))
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Ticket non trouvé"})
	}
	return c.JSON(ticket)
}

func (h *TicketHandler) AddMessage(c *fiber.Ctx) error {
	ticketID := c.Params("id")
	senderID := c.Locals("user_id").(string)
	senderRole := c.Locals("user_role").(string)
	var req model.AddMessageRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Message invalide"})
	}
	if req.Message == "" { req.Message = "Message" }
	msg, err := h.service.AddMessage(ticketID, senderID, senderRole, req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(msg)
}

func (h *TicketHandler) UpdateStatus(c *fiber.Ctx) error {
	var req model.UpdateStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Statut invalide"})
	}
	if err := h.service.UpdateStatus(c.Params("id"), req.Status); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "Statut mis à jour"})
}

func (h *TicketHandler) AssignTechnician(c *fiber.Ctx) error {
	var req model.AssignTechRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Données invalides"})
	}
	if err := h.service.AssignTechnician(c.Params("id"), req.TechnicianID); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "Technicien assigné"})
}

func (h *TicketHandler) GetUnreadCount(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	count, _ := h.service.GetUnreadCount(userID)
	return c.JSON(fiber.Map{"unread_count": count})
}

func (h *TicketHandler) MarkAsRead(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	h.service.MarkAsRead(c.Params("id"), userID)
	return c.JSON(fiber.Map{"message": "Marqué comme lu"})
}

func (h *TicketHandler) GetSLARules(c *fiber.Ctx) error {
	return c.JSON(service.SLARules)
}

func (h *TicketHandler) UploadPhoto(c *fiber.Ctx) error {
	ticketID := c.Params("id")
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Fichier requis"})
	}
	filename := fmt.Sprintf("ticket_%s_%s", ticketID[:8], file.Filename)
	os.MkdirAll("../../uploads/tickets", 0755)
	filepath := fmt.Sprintf("../../uploads/tickets/%s", filename)
	c.SaveFile(file, filepath)
	
	imageURL := fmt.Sprintf("/uploads/tickets/%s", filename)
	senderID := c.Locals("user_id").(string)
	
	h.service.AddMessage(ticketID, senderID, "client", model.AddMessageRequest{
		Message:       "Photo",
		AttachmentURL: &imageURL,
	})
	return c.JSON(fiber.Map{"message": "Photo envoyee", "image_url": imageURL})
}

func (h *TicketHandler) GetTechnicianTickets(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	tickets, _ := h.service.GetTickets(userID, "technician", "")
	return c.JSON(tickets)
}

func (h *TicketHandler) AssignToMe(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	h.service.AssignTechnician(c.Params("id"), userID)
	return c.JSON(fiber.Map{"message": "Ticket assigné"})
}

func (h *TicketHandler) ChangeStatus(c *fiber.Ctx) error {
	status := c.Query("status")
	h.service.UpdateStatus(c.Params("id"), status)
	return c.JSON(fiber.Map{"message": "Statut modifié"})
}
