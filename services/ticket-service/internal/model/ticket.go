package model

import "time"

const (
	StatusOpen         = "open"
	StatusInProgress   = "in_progress"
	StatusWaitingClient = "waiting_client"
	StatusResolved     = "resolved"
	StatusClosed       = "closed"
)

const (
	PriorityLow    = "low"
	PriorityMedium = "medium"
	PriorityHigh   = "high"
	PriorityUrgent = "urgent"
)

const (
	RoleClient     = "client"
	RoleTechnician = "technician"
	RoleAdmin      = "admin"
)

var ValidTransitions = map[string][]string{
	StatusOpen:          {StatusInProgress},
	StatusInProgress:    {StatusWaitingClient, StatusResolved},
	StatusWaitingClient: {StatusInProgress, StatusResolved},
	StatusResolved:      {StatusClosed},
	StatusClosed:        {},
}

type Ticket struct {
	ID           string          `gorm:"column:id;type:varchar(36);primaryKey" json:"id"`
	ClientID     string          `gorm:"column:client_id;type:varchar(255);not null;index" json:"client_id"`
	TechnicianID *string         `gorm:"column:technician_id;type:varchar(255);index" json:"technician_id,omitempty"`
	OrderID      *string         `gorm:"column:order_id;type:varchar(36)" json:"order_id,omitempty"`
	Subject      string          `gorm:"column:subject;type:varchar(255);not null" json:"subject"`
	Description  string          `gorm:"column:description;type:text;not null" json:"description"`
	Status       string          `gorm:"column:status;type:varchar(20);default:open;index" json:"status"`
	Priority     string          `gorm:"column:priority;type:varchar(10);default:medium" json:"priority"`
	Category     string          `gorm:"column:category;type:varchar(50);default:general" json:"category"`
	Messages     []TicketMessage `gorm:"foreignKey:TicketID" json:"messages,omitempty"`
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
	ResolvedAt   *time.Time      `json:"resolved_at,omitempty"`
	ClosedAt     *time.Time      `json:"closed_at,omitempty"`
}

func (Ticket) TableName() string {
	return "tickets"
}

type TicketMessage struct {
	ID            string    `gorm:"column:id;type:varchar(36);primaryKey" json:"id"`
	TicketID      string    `gorm:"column:ticket_id;type:varchar(36);not null;index" json:"ticket_id"`
	SenderID      string    `gorm:"column:sender_id;type:varchar(255);not null" json:"sender_id"`
	SenderRole    string    `gorm:"column:sender_role;type:varchar(20);not null" json:"sender_role"`
	Message       string    `gorm:"column:message;type:text;not null" json:"message"`
	AttachmentURL *string   `gorm:"column:attachment_url;type:text" json:"attachment_url,omitempty"`
	IsRead        bool      `gorm:"column:is_read;default:false" json:"is_read"`
	CreatedAt     time.Time `json:"created_at"`
}

func (TicketMessage) TableName() string {
	return "ticket_messages"
}

// DTOs
type CreateTicketRequest struct {
	Subject     string `json:"subject"`
	Description string `json:"description"`
	Priority    string `json:"priority"`
	Category    string `json:"category"`
	OrderID     string `json:"order_id,omitempty"`
}

type AddMessageRequest struct {
	Message       string  `json:"message"`
	AttachmentURL *string `json:"attachment_url,omitempty"`
}

type UpdateStatusRequest struct {
	Status string `json:"status"`
}

type AssignTechRequest struct {
	TechnicianID string `json:"technician_id"`
}
