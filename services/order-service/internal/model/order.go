package model

import "time"

// Statuts identiques au FastAPI original
const (
	StatusPending        = "pending"
	StatusAwaitingPayment = "awaiting_payment"
	StatusPaid           = "paid"
	StatusPreparing      = "preparing"
	StatusReady          = "ready"
	StatusDelivered      = "delivered"
	StatusCancelled      = "cancelled"
)

type Order struct {
	ID         string      `gorm:"column:id;type:varchar(36);primaryKey" json:"id"`
	UserID     string      `gorm:"column:user_id;type:varchar(255);not null" json:"user_id"`
	Status     string      `gorm:"column:status;type:varchar(20);default:pending" json:"status"`
	TotalAmount float64    `gorm:"column:total_amount;type:decimal(10,2)" json:"total_amount"`
	Items      []OrderItem `gorm:"foreignKey:OrderID" json:"items,omitempty"`
	CreatedAt  time.Time   `json:"created_at"`
	UpdatedAt  time.Time   `json:"updated_at"`
}

func (Order) TableName() string { return "orders" }

type OrderItem struct {
	ID             string  `gorm:"column:id;type:varchar(36);primaryKey" json:"id"`
	OrderID        string  `gorm:"column:order_id;type:varchar(36);not null" json:"order_id"`
	ProductID      string  `gorm:"column:product_id;type:varchar(255)" json:"product_id"`
	ProductName    string  `gorm:"column:product_name;type:varchar(255)" json:"product_name"`
	Quantity       int     `gorm:"column:quantity" json:"quantity"`
	UnitPrice      float64 `gorm:"column:unit_price;type:decimal(10,2)" json:"unit_price"`
	Total          float64 `gorm:"column:total;type:decimal(10,2)" json:"total"`
}

func (OrderItem) TableName() string { return "order_items" }
