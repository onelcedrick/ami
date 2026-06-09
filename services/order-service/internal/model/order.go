package model

import "time"

const (
	StatusPending    = "pending"
	StatusConfirmed  = "confirmed"
	StatusPaid       = "paid"
	StatusProcessing = "processing"
	StatusShipped    = "shipped"
	StatusDelivered  = "delivered"
	StatusCancelled  = "cancelled"
	StatusRefunded   = "refunded"
)

const (
	PaymentPending  = "pending"
	PaymentPaid     = "paid"
	PaymentFailed   = "failed"
	PaymentRefunded = "refunded"
)

type Order struct {
	ID              string      `gorm:"column:id;type:varchar(36);primaryKey" json:"id"`
	UserID          string      `gorm:"column:user_id;type:varchar(255);not null" json:"user_id"`
	OrderNumber     string      `gorm:"column:order_number;type:varchar(20);uniqueIndex" json:"order_number"`
	Status          string      `gorm:"column:status;type:varchar(20);default:pending" json:"status"`
	Subtotal        float64     `gorm:"column:subtotal;type:decimal(10,2);not null" json:"subtotal"`
	TaxAmount       float64     `gorm:"column:tax_amount;type:decimal(10,2);default:0" json:"tax_amount"`
	ShippingAmount  float64     `gorm:"column:shipping_amount;type:decimal(10,2);default:0" json:"shipping_amount"`
	DiscountAmount  float64     `gorm:"column:discount_amount;type:decimal(10,2);default:0" json:"discount_amount"`
	Total           float64     `gorm:"column:total;type:decimal(10,2);not null" json:"total"`
	Currency        string      `gorm:"column:currency;type:varchar(3);default:EUR" json:"currency"`
	ShippingAddress string      `gorm:"column:shipping_address;type:text" json:"shipping_address,omitempty"`
	PaymentMethod   string      `gorm:"column:payment_method;type:varchar(50)" json:"payment_method,omitempty"`
	PaymentStatus   string      `gorm:"column:payment_status;type:varchar(20);default:pending" json:"payment_status"`
	PaymentID       string      `gorm:"column:payment_id;type:varchar(255)" json:"payment_id,omitempty"`
	Notes           string      `gorm:"column:notes;type:text" json:"notes,omitempty"`
	Items           []OrderItem `gorm:"foreignKey:OrderID;references:ID" json:"items,omitempty"`
	CreatedAt       time.Time   `json:"created_at"`
	UpdatedAt       time.Time   `json:"updated_at"`
}

func (Order) TableName() string {
	return "orders"
}

type OrderItem struct {
	ID           string  `gorm:"column:id;type:varchar(36);primaryKey" json:"id"`
	OrderID      string  `gorm:"column:order_id;type:varchar(36);not null;index" json:"order_id"`
	ProductID    string  `gorm:"column:product_id;type:varchar(255);not null" json:"product_id"`
	ProductName  string  `gorm:"column:product_name;type:varchar(255);not null" json:"product_name"`
	ProductSKU   string  `gorm:"column:product_sku;type:varchar(100)" json:"product_sku,omitempty"`
	ProductPrice float64 `gorm:"column:product_price;type:decimal(10,2);not null" json:"product_price"`
	Quantity     int     `gorm:"column:quantity;not null" json:"quantity"`
	Total        float64 `gorm:"column:total;type:decimal(10,2);not null" json:"total"`
}

func (OrderItem) TableName() string {
	return "order_items"
}

type CreateOrderRequest struct {
	ShippingAddress string `json:"shipping_address"`
	PaymentMethod   string `json:"payment_method"`
	Notes           string `json:"notes,omitempty"`
}

type UpdateStatusRequest struct {
	Status string `json:"status"`
}

type PaymentRequest struct {
	PaymentMethod string `json:"payment_method"`
}
