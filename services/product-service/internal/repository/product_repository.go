package repository

import (
	"github.com/am-info/product-service/internal/model"
	"gorm.io/gorm"
)

type ProductRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) GetProducts(params ProductQueryParams) ([]model.Product, int64, error) {
	var products []model.Product
	var total int64

	query := r.db.Model(&model.Product{}).Where("is_active = ?", true)
	if params.CategoryID != "" { query = query.Where("category_id = ?", params.CategoryID) }
	if params.Brand != "" { query = query.Where("brand = ?", params.Brand) }
	if params.Search != "" {
		s := "%" + params.Search + "%"
		query = query.Where("name ILIKE ? OR description ILIKE ? OR brand ILIKE ?", s, s, s)
	}
	query.Count(&total)

	orderClause := "created_at DESC"
	switch params.SortBy {
	case "price_asc": orderClause = "price ASC"
	case "price_desc": orderClause = "price DESC"
	case "popular": orderClause = "sales_count DESC"
	}

	offset := (params.Page - 1) * params.Limit
	query.Preload("Category").Order(orderClause).Offset(offset).Limit(params.Limit).Find(&products)
	return products, total, nil
}

func (r *ProductRepository) GetProductByID(id string) (*model.Product, error) {
	var product model.Product
	err := r.db.Preload("Category").First(&product, "id = ? AND is_active = ?", id, true).Error
	return &product, err
}

func (r *ProductRepository) GetFeaturedProducts(limit int) ([]model.Product, error) {
	var products []model.Product
	err := r.db.Where("is_featured = ? AND is_active = ?", true, true).Limit(limit).Find(&products).Error
	return products, err
}

func (r *ProductRepository) GetCategories() ([]model.Category, error) {
	var categories []model.Category
	err := r.db.Where("is_active = ?", true).Order("sort_order ASC").Find(&categories).Error
	return categories, err
}

func (r *ProductRepository) Create(product *model.Product) error {
	return r.db.Create(product).Error
}

func (r *ProductRepository) Update(id string, updates map[string]interface{}) error {
	return r.db.Model(&model.Product{}).Where("id = ?", id).Updates(updates).Error
}

func (r *ProductRepository) Delete(id string) error {
	return r.db.Delete(&model.Product{}, "id = ?", id).Error
}

func (r *ProductRepository) CreateCategory(category *model.Category) (*model.Category, error) {
	var existing model.Category
	err := r.db.Where("name = ?", category.Name).First(&existing).Error
	if err == nil { return &existing, nil }
	if err := r.db.Create(category).Error; err != nil { return nil, err }
	return category, nil
}

func (r *ProductRepository) UpdateCategory(id, name string) error {
	return r.db.Model(&model.Category{}).Where("id = ?", id).Update("name", name).Error
}

func (r *ProductRepository) DeleteCategory(id string) error {
	r.db.Model(&model.Product{}).Where("category_id = ?", id).Update("category_id", nil)
	return r.db.Delete(&model.Category{}, "id = ?", id).Error
}

type ProductQueryParams struct {
	Page       int
	Limit      int
	CategoryID string
	Brand      string
	MinPrice   float64
	MaxPrice   float64
	InStock    bool
	Search     string
	SortBy     string
}
