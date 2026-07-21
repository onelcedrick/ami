package model

import "time"

type Client struct {
	ID          string    `json:"id"`
	FullName    string    `json:"full_name"`
	Email       string    `json:"email"`
	TotalSpent  float64   `json:"total_spent"`
	TotalOrders int       `json:"total_orders"`
	CreatedAt   time.Time `json:"created_at"`
	IsActive    bool      `json:"is_active"`
}
