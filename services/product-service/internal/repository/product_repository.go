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

	if params.CategoryID != "" {
		query = query.Where("category_id = ?", params.CategoryID)
	}
	if params.Brand != "" {
		query = query.Where("brand = ?", params.Brand)
	}
	if params.MinPrice > 0 {
		query = query.Where("price >= ?", params.MinPrice)
	}
	if params.MaxPrice > 0 {
		query = query.Where("price <= ?", params.MaxPrice)
	}
	if params.InStock {
		query = query.Where("stock_quantity > 0")
	}
	if params.Search != "" {
		searchTerm := "%" + params.Search + "%"
		query = query.Where(
			"name ILIKE ? OR description ILIKE ? OR brand ILIKE ?",
			searchTerm, searchTerm, searchTerm,
		)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	orderClause := "created_at DESC"
	switch params.SortBy {
	case "price_asc":
		orderClause = "price ASC"
	case "price_desc":
		orderClause = "price DESC"
	case "name_asc":
		orderClause = "name ASC"
	case "name_desc":
		orderClause = "name DESC"
	case "popular":
		orderClause = "sales_count DESC"
	case "rating":
		orderClause = "rating_avg DESC"
	case "newest":
		orderClause = "created_at DESC"
	}

	offset := (params.Page - 1) * params.Limit
	if err := query.Preload("Category").
		Order(orderClause).
		Offset(offset).
		Limit(params.Limit).
		Find(&products).Error; err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

func (r *ProductRepository) GetProductByID(id string) (*model.Product, error) {
	var product model.Product
	if err := r.db.Preload("Category").First(&product, "id = ? AND is_active = ?", id, true).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *ProductRepository) GetProductBySlug(slug string) (*model.Product, error) {
	var product model.Product
	if err := r.db.Preload("Category").First(&product, "slug = ? AND is_active = ?", slug, true).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *ProductRepository) GetFeaturedProducts(limit int) ([]model.Product, error) {
	var products []model.Product
	if err := r.db.Where("is_featured = ? AND is_active = ?", true, true).
		Order("created_at DESC").
		Limit(limit).
		Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (r *ProductRepository) GetRelatedProducts(productID string, categoryID string, limit int) ([]model.Product, error) {
	var products []model.Product
	if err := r.db.Where("category_id = ? AND id != ? AND is_active = ?", categoryID, productID, true).
		Order("sales_count DESC").
		Limit(limit).
		Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (r *ProductRepository) GetCategories() ([]model.Category, error) {
	var categories []model.Category
	if err := r.db.Where("is_active = ?", true).
		Order("sort_order ASC").
		Find(&categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}

func (r *ProductRepository) GetCategoryBySlug(slug string) (*model.Category, error) {
	var category model.Category
	if err := r.db.First(&category, "slug = ? AND is_active = ?", slug, true).Error; err != nil {
		return nil, err
	}
	return &category, nil
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

// Create crée un nouveau produit
func (r *ProductRepository) Create(product *model.Product) error {
	return r.db.Create(product).Error
}

// Update met à jour un produit
func (r *ProductRepository) Update(id string, updates map[string]interface{}) error {
	return r.db.Model(&model.Product{}).Where("id = ?", id).Updates(updates).Error
}

// Delete supprime un produit
func (r *ProductRepository) Delete(id string) error {
	return r.db.Delete(&model.Product{}, "id = ?", id).Error
}
