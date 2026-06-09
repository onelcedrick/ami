package repository

import (
	"github.com/am-info/cart-service/internal/model"
	"gorm.io/gorm"
)

type CartRepository struct {
	db *gorm.DB
}

func NewCartRepository(db *gorm.DB) *CartRepository {
	return &CartRepository{db: db}
}

func (r *CartRepository) GetCart(userID string) ([]model.CartItem, error) {
	var items []model.CartItem
	err := r.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&items).Error
	return items, err
}

func (r *CartRepository) FindByUserAndProduct(userID, productID string) (*model.CartItem, error) {
	var item model.CartItem
	err := r.db.Where("user_id = ? AND product_id = ?", userID, productID).First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *CartRepository) Create(item *model.CartItem) error {
	return r.db.Create(item).Error
}

func (r *CartRepository) UpdateQuantity(itemID string, quantity int) error {
	return r.db.Model(&model.CartItem{}).Where("id = ?", itemID).
		Updates(map[string]interface{}{
			"quantity":   quantity,
			"updated_at": gorm.Expr("NOW()"),
		}).Error
}

func (r *CartRepository) RemoveItem(userID, itemID string) error {
	return r.db.Where("id = ? AND user_id = ?", itemID, userID).
		Delete(&model.CartItem{}).Error
}

func (r *CartRepository) ClearCart(userID string) error {
	return r.db.Where("user_id = ?", userID).Delete(&model.CartItem{}).Error
}

func (r *CartRepository) GetCartCount(userID string) (int64, error) {
	var count int64
	err := r.db.Model(&model.CartItem{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}
