package repository

import (
	"fmt"
	"time"

	"github.com/am-info/order-service/internal/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

func (r *OrderRepository) CreateOrder(order *model.Order) error {
	order.OrderNumber = generateOrderNumber()
	
	if err := r.db.Exec(`INSERT INTO orders (id, user_id, order_number, status, subtotal, tax_amount, shipping_amount, discount_amount, total, currency, shipping_address, payment_method, payment_status, notes, created_at, updated_at) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
		order.ID, order.UserID, order.OrderNumber, order.Status, order.Subtotal,
		order.TaxAmount, order.ShippingAmount, order.DiscountAmount, order.Total,
		order.Currency, order.ShippingAddress, order.PaymentMethod, order.PaymentStatus, order.Notes).Error; err != nil {
		return err
	}
	
	for i := range order.Items {
		order.Items[i].ID = uuid.New().String()
		order.Items[i].OrderID = order.ID
		if err := r.db.Exec(`INSERT INTO order_items (id, order_id, product_id, product_name, product_sku, product_price, quantity, total) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			order.Items[i].ID, order.Items[i].OrderID, order.Items[i].ProductID,
			order.Items[i].ProductName, order.Items[i].ProductSKU, order.Items[i].ProductPrice,
			order.Items[i].Quantity, order.Items[i].Total).Error; err != nil {
			return err
		}
	}
	
	return nil
}

func (r *OrderRepository) GetOrderByID(orderID string) (*model.Order, error) {
	var order model.Order
	if err := r.db.Raw("SELECT * FROM orders WHERE id = ?", orderID).Scan(&order).Error; err != nil {
		return nil, err
	}
	
	var items []model.OrderItem
	r.db.Raw("SELECT * FROM order_items WHERE order_id = ?", orderID).Scan(&items)
	order.Items = items
	
	return &order, nil
}

func (r *OrderRepository) GetOrdersByUser(userID string, status string) ([]model.Order, error) {
	var orders []model.Order
	query := "SELECT * FROM orders WHERE user_id = ?"
	args := []interface{}{userID}
	
	if status != "" {
		query += " AND status = ?"
		args = append(args, status)
	}
	query += " ORDER BY created_at DESC"
	
	if err := r.db.Raw(query, args...).Scan(&orders).Error; err != nil {
		return nil, err
	}
	
	for i := range orders {
		var items []model.OrderItem
		r.db.Raw("SELECT * FROM order_items WHERE order_id = ?", orders[i].ID).Scan(&items)
		orders[i].Items = items
	}
	
	return orders, nil
}

func (r *OrderRepository) GetAllOrders(status string, limit, offset int) ([]model.Order, int64, error) {
	var orders []model.Order
	var total int64
	
	r.db.Raw("SELECT COUNT(*) FROM orders").Scan(&total)
	
	query := "SELECT * FROM orders"
	args := []interface{}{}
	if status != "" {
		query += " WHERE status = ?"
		args = append(args, status)
	}
	query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
	args = append(args, limit, offset)
	
	if err := r.db.Raw(query, args...).Scan(&orders).Error; err != nil {
		return nil, 0, err
	}
	
	for i := range orders {
		var items []model.OrderItem
		r.db.Raw("SELECT * FROM order_items WHERE order_id = ?", orders[i].ID).Scan(&items)
		orders[i].Items = items
	}
	
	return orders, total, nil
}

func (r *OrderRepository) UpdateStatus(orderID, status string) error {
	return r.db.Exec("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?", status, orderID).Error
}

func (r *OrderRepository) UpdatePaymentStatus(orderID, paymentStatus, paymentID string) error {
	return r.db.Exec("UPDATE orders SET payment_status = ?, payment_id = ?, updated_at = NOW() WHERE id = ?", paymentStatus, paymentID, orderID).Error
}

func generateOrderNumber() string {
	now := time.Now()
	return fmt.Sprintf("AM-%s-%s", now.Format("20060102"), uuid.New().String()[:8])
}
