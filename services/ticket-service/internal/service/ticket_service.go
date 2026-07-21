package service

import (
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/am-info/ticket-service/internal/model"
	"github.com/am-info/ticket-service/internal/repository"
)

type TicketService struct {
	repo  *repository.TicketRepository
	
}

func NewTicketService(repo *repository.TicketRepository, ) *TicketService {
	return &TicketService{
		repo:  repo,
		wsHub: wsHub,
	}
}

func (s *TicketService) CreateTicket(clientID string, req model.CreateTicketRequest) (*model.Ticket, error) {
	if req.Priority == "" {
		req.Priority = model.PriorityMedium
	}
	if req.Category == "" {
		req.Category = "general"
	}

	ticket := &model.Ticket{
		ClientID:    clientID,
		Subject:     req.Subject,
		Description: req.Description,
		Status:      model.StatusOpen,
		Priority:    req.Priority,
		Category:    req.Category,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if req.OrderID != "" {
		ticket.OrderID = &req.OrderID
	}

	if err := s.repo.CreateTicket(ticket); err != nil {
		return nil, err
	}

	// Notifier les techniciens
	// s.wsHub.BroadcastToRole(model.RoleTechnician, map[string]interface{}{
		"type":    "new_ticket",
		"ticket":  ticket,
		"message": fmt.Sprintf("Nouveau ticket: %s", ticket.Subject),
	})

	log.Printf("📫 Ticket créé: %s par %s", ticket.Subject, clientID)
	return ticket, nil
}

func (s *TicketService) GetTicket(ticketID string) (*model.Ticket, error) {
	return s.repo.FindByID(ticketID)
}

func (s *TicketService) GetTickets(userID, role, status string) ([]model.Ticket, error) {
	switch role {
	case model.RoleClient:
		return s.repo.FindByClientID(userID, status)
	case model.RoleTechnician:
		return s.repo.FindAll(status, "")
	case model.RoleAdmin:
		return s.repo.FindAll(status, "")
	default:
		return nil, errors.New("rôle non autorisé")
	}
}

func (s *TicketService) AddMessage(ticketID, senderID, senderRole string, req model.AddMessageRequest) (*model.TicketMessage, error) {
	ticket, err := s.repo.FindByID(ticketID)
	if err != nil {
		return nil, errors.New("ticket non trouvé")
	}

	// Vérifier permissions
	if senderRole == model.RoleClient && ticket.ClientID != senderID {
		return nil, errors.New("non autorisé")
	}

	msg := &model.TicketMessage{
		TicketID:      ticketID,
		SenderID:      senderID,
		SenderRole:    senderRole,
		Message:       req.Message,
		AttachmentURL: req.AttachmentURL,
		IsRead:        false,
		CreatedAt:     time.Now(),
	}

	if err := s.repo.AddMessage(msg); err != nil {
		return nil, err
	}

	// Notification temps réel à l'autre partie
	notifyUserID := ticket.ClientID
	if senderRole == model.RoleClient && ticket.TechnicianID != nil {
		notifyUserID = *ticket.TechnicianID
	}

	// s.wsHub.SendToUser(notifyUserID, map[string]interface{}{
		"type":      "new_message",
		"ticket_id": ticketID,
		"message":   msg,
	})

	// Si le client répond à un ticket en attente, le repasser en cours
	if ticket.Status == model.StatusWaitingClient && senderRole == model.RoleClient {
		s.repo.UpdateStatus(ticketID, model.StatusInProgress)
	}

	log.Printf("💬 Message ajouté au ticket %s par %s", ticketID, senderRole)
	return msg, nil
}

func (s *TicketService) UpdateStatus(ticketID, newStatus string) error {
	ticket, err := s.repo.FindByID(ticketID)
	if err != nil {
		return errors.New("ticket non trouvé")
	}

	validNext, exists := model.ValidTransitions[ticket.Status]
	if !exists {
		return errors.New("statut actuel invalide")
	}

	valid := false
	for _, status := range validNext {
		if status == newStatus {
			valid = true
			break
		}
	}

	if !valid {
		return fmt.Errorf("transition impossible: %s → %s", ticket.Status, newStatus)
	}

	if err := s.repo.UpdateStatus(ticketID, newStatus); err != nil {
		return err
	}

	// Notifier le client
	// s.wsHub.SendToUser(ticket.ClientID, map[string]interface{}{
		"type":      "status_changed",
		"ticket_id": ticketID,
		"status":    newStatus,
	})

	log.Printf("🔄 Ticket %s: %s → %s", ticketID, ticket.Status, newStatus)
	return nil
}

func (s *TicketService) AssignTechnician(ticketID, techID string) error {
	if err := s.repo.AssignTechnician(ticketID, techID); err != nil {
		return err
	}

	ticket, _ := s.repo.FindByID(ticketID)
	// s.wsHub.SendToUser(ticket.ClientID, map[string]interface{}{
		"type":      "technician_assigned",
		"ticket_id": ticketID,
	})

	log.Printf("👨‍🔧 Ticket %s assigné au technicien %s", ticketID, techID)
	return nil
}

func (s *TicketService) GetUnreadCount(userID string) (int64, error) {
	return s.repo.GetUnreadCount(userID)
}

func (s *TicketService) MarkAsRead(ticketID, userID string) error {
	return s.repo.MarkAsRead(ticketID, userID)
}
