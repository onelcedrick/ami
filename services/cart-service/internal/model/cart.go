package model

import "time"

type CartItem struct {
	ID        string    `gorm:"type:varchar(36);primaryKey" json:"id"`
	UserID    string    `gorm:"type:varchar(255);not null;uniqueIndex:idx_user_product" json:"user_id"`
	ProductID string    `gorm:"type:varchar(255);not null;uniqueIndex:idx_user_product" json:"product_id"`
	Quantity  int       `gorm:"not null;default:1;check:quantity > 0" json:"quantity"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Format identique au FastAPI original
type CartItemResponse struct {
	ID          string  `json:"id"`
	ProductID   string  `json:"product_id"`
	ProductName string  `json:"product_name"`
	Quantity    int     `json:"quantity"`
	UnitPrice   float64 `json:"unit_price"`
	Total       float64 `json:"total"`
	ImageURL    *string `json:"image_url"`
	Stock       int     `json:"stock"`
}

type CartResponse struct {
	Items []CartItemResponse `json:"items"`
	Total float64            `json:"total"`
	Count int                `json:"count"`
}

type ProductInfo struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	SKU         string  `json:"sku"`
	Stock       int     `json:"stock_quantity"`
	ImageURL    *string `json:"image_url"`
}

type AddToCartRequest struct {
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity"`
}
