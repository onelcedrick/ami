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

type ProductInfo struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
	SKU   string  `json:"sku"`
	Stock int     `json:"stock_quantity"`
}

type CartResponse struct {
	Items      []CartItemResponse `json:"items"`
	TotalItems int                `json:"total_items"`
	TotalPrice float64            `json:"total_price"`
}

type CartItemResponse struct {
	ID        string      `json:"id"`
	ProductID string      `json:"product_id"`
	Product   ProductInfo `json:"product"`
	Quantity  int         `json:"quantity"`
	Subtotal  float64     `json:"subtotal"`
}

type AddToCartRequest struct {
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity"`
}

type UpdateQuantityRequest struct {
	Quantity int `json:"quantity"`
}
