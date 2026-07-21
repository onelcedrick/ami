package repository

import (
	"time"

	"github.com/am-info/order-service/internal/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) *OrderRepository {
	db.Exec(`CREATE TABLE IF NOT EXISTS orders (
		id VARCHAR(36) PRIMARY KEY, user_id VARCHAR(255) NOT NULL,
		status VARCHAR(20) DEFAULT 'pending',
		total_amount DECIMAL(10,2) DEFAULT 0,
		created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
	)`)
	db.Exec(`CREATE TABLE IF NOT EXISTS order_items (
		id VARCHAR(36) PRIMARY KEY, order_id VARCHAR(36) NOT NULL,
		product_id VARCHAR(255) NOT NULL, product_name VARCHAR(255) NOT NULL,
		quantity INT NOT NULL, unit_price DECIMAL(10,2) NOT NULL,
		total DECIMAL(10,2) NOT NULL
	)`)
	return &OrderRepository{db: db}
}

func (r *OrderRepository) Create(order *model.Order) error {
	order.ID = uuid.New().String()
	return r.db.Create(order).Error
}

func (r *OrderRepository) GetByUser(userID string) ([]model.Order, error) {
	var orders []model.Order
	r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&orders)
	for i := range orders {
		r.db.Where("order_id = ?", orders[i].ID).Find(&orders[i].Items)
	}
	return orders, nil
}

func (r *OrderRepository) GetAll() ([]model.Order, error) {
	var orders []model.Order
	r.db.Order("created_at DESC").Find(&orders)
	return orders, nil
}

func (r *OrderRepository) GetByID(orderID string) (*model.Order, error) {
	var order model.Order
	err := r.db.First(&order, "id = ?", orderID).Error
	if err == nil {
		r.db.Where("order_id = ?", orderID).Find(&order.Items)
	}
	return &order, err
}

func (r *OrderRepository) UpdateStatus(orderID, status string) error {
	return r.db.Model(&model.Order{}).Where("id = ?", orderID).Updates(map[string]interface{}{
		"status": status, "updated_at": time.Now(),
	}).Error
}

func (r *OrderRepository) Delete(orderID string) error {
	r.db.Where("order_id = ?", orderID).Delete(&model.OrderItem{})
	return r.db.Delete(&model.Order{}, "id = ?", orderID).Error
}

func (r *OrderRepository) GetAllOrders() ([]model.Order, error) {
	var orders []model.Order
	r.db.Order("created_at DESC").Find(&orders)
	for i := range orders {
		var items []model.OrderItem
		r.db.Where("order_id = ?", orders[i].ID).Find(&items)
		orders[i].Items = items
	}
	return orders, nil
}

