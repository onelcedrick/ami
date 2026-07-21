package model

import "time"

type Discount struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	DiscountType string    `json:"discount_type"`
	Value        float64   `json:"value"`
	TargetType   string    `json:"target_type"`
	TargetID     *string   `json:"target_id"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
}
