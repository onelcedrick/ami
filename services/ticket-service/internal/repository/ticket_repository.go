package repository

import (
	"time"

	"github.com/am-info/ticket-service/internal/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TicketRepository struct {
	db *gorm.DB
}

func NewTicketRepository(db *gorm.DB) *TicketRepository {
	return &TicketRepository{db: db}
}

func (r *TicketRepository) CreateTicket(ticket *model.Ticket) error {
	ticket.ID = uuid.New().String()
	return r.db.Exec(`INSERT INTO tickets (id, client_id, technician_id, order_id, subject, description, status, priority, category, created_at, updated_at) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
		ticket.ID, ticket.ClientID, ticket.TechnicianID, ticket.OrderID,
		ticket.Subject, ticket.Description, ticket.Status, ticket.Priority, ticket.Category).Error
}

func (r *TicketRepository) FindByID(id string) (*model.Ticket, error) {
	var ticket model.Ticket
	if err := r.db.Raw("SELECT * FROM tickets WHERE id = ?", id).Scan(&ticket).Error; err != nil {
		return nil, err
	}
	
	var messages []model.TicketMessage
	r.db.Raw("SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC", id).Scan(&messages)
	ticket.Messages = messages
	
	return &ticket, nil
}

func (r *TicketRepository) FindByClientID(clientID, status string) ([]model.Ticket, error) {
	var tickets []model.Ticket
	query := "SELECT * FROM tickets WHERE client_id = ?"
	args := []interface{}{clientID}
	
	if status != "" {
		query += " AND status = ?"
		args = append(args, status)
	}
	query += " ORDER BY created_at DESC"
	
	if err := r.db.Raw(query, args...).Scan(&tickets).Error; err != nil {
		return nil, err
	}
	
	for i := range tickets {
		var messages []model.TicketMessage
		r.db.Raw("SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC", tickets[i].ID).Scan(&messages)
		tickets[i].Messages = messages
	}
	
	return tickets, nil
}

func (r *TicketRepository) FindByTechnicianID(techID, status string) ([]model.Ticket, error) {
	var tickets []model.Ticket
	query := "SELECT * FROM tickets WHERE technician_id = ?"
	args := []interface{}{techID}
	
	if status != "" {
		query += " AND status = ?"
		args = append(args, status)
	}
	query += " ORDER BY created_at DESC"
	
	if err := r.db.Raw(query, args...).Scan(&tickets).Error; err != nil {
		return nil, err
	}
	
	for i := range tickets {
		var messages []model.TicketMessage
		r.db.Raw("SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC", tickets[i].ID).Scan(&messages)
		tickets[i].Messages = messages
	}
	
	return tickets, nil
}

func (r *TicketRepository) FindAll(status, priority string) ([]model.Ticket, error) {
	var tickets []model.Ticket
	query := "SELECT * FROM tickets WHERE 1=1"
	args := []interface{}{}
	
	if status != "" {
		query += " AND status = ?"
		args = append(args, status)
	}
	if priority != "" {
		query += " AND priority = ?"
		args = append(args, priority)
	}
	query += " ORDER BY created_at DESC"
	
	if err := r.db.Raw(query, args...).Scan(&tickets).Error; err != nil {
		return nil, err
	}
	
	for i := range tickets {
		var messages []model.TicketMessage
		r.db.Raw("SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC", tickets[i].ID).Scan(&messages)
		tickets[i].Messages = messages
	}
	
	return tickets, nil
}

func (r *TicketRepository) UpdateStatus(id, status string) error {
	updates := map[string]interface{}{
		"status": status,
	}
	
	switch status {
	case model.StatusResolved:
		updates["resolved_at"] = time.Now()
	case model.StatusClosed:
		updates["closed_at"] = time.Now()
	}
	
	return r.db.Exec("UPDATE tickets SET status = ?, updated_at = NOW() WHERE id = ?", status, id).Error
}

func (r *TicketRepository) AssignTechnician(id, techID string) error {
	return r.db.Exec("UPDATE tickets SET technician_id = ?, status = ?, updated_at = NOW() WHERE id = ?",
		techID, model.StatusInProgress, id).Error
}

func (r *TicketRepository) AddMessage(msg *model.TicketMessage) error {
	msg.ID = uuid.New().String()
	return r.db.Exec(`INSERT INTO ticket_messages (id, ticket_id, sender_id, sender_role, message, attachment_url, is_read, created_at) 
		VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
		msg.ID, msg.TicketID, msg.SenderID, msg.SenderRole, msg.Message, msg.AttachmentURL, msg.IsRead).Error
}

func (r *TicketRepository) GetUnreadCount(userID string) (int64, error) {
	var count int64
	r.db.Raw(`SELECT COUNT(*) FROM ticket_messages tm
		JOIN tickets t ON t.id = tm.ticket_id
		WHERE tm.sender_id != ? AND tm.is_read = false 
		AND (t.client_id = ? OR t.technician_id = ?)`,
		userID, userID, userID).Scan(&count)
	return count, nil
}

func (r *TicketRepository) MarkAsRead(ticketID, userID string) error {
	return r.db.Exec(`UPDATE ticket_messages SET is_read = true 
		WHERE ticket_id = ? AND sender_id != ? AND is_read = false`,
		ticketID, userID).Error
}
