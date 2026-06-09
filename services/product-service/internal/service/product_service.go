package service

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/am-info/product-service/internal/model"
	"github.com/am-info/product-service/internal/repository"
	"github.com/redis/go-redis/v9"
)

type ProductService struct {
	repo  *repository.ProductRepository
	redis *redis.Client
}

func NewProductService(repo *repository.ProductRepository, redis *redis.Client) *ProductService {
	return &ProductService{
		repo:  repo,
		redis: redis,
	}
}

// GetProducts retourne les produits avec cache Redis
func (s *ProductService) GetProducts(params repository.ProductQueryParams) ([]model.Product, int64, error) {
	// Clé cache
	cacheKey := fmt.Sprintf("products:page:%d:limit:%d:cat:%s:sort:%s:search:%s",
		params.Page, params.Limit, params.CategoryID, params.SortBy, params.Search)

	ctx := context.Background()

	// Vérifier le cache
	if cached, err := s.redis.Get(ctx, cacheKey).Result(); err == nil {
		var result struct {
			Products []model.Product `json:"products"`
			Total    int64           `json:"total"`
		}
		if err := json.Unmarshal([]byte(cached), &result); err == nil {
			return result.Products, result.Total, nil
		}
	}

	// Requête DB
	products, total, err := s.repo.GetProducts(params)
	if err != nil {
		return nil, 0, err
	}

	// Mettre en cache (5 minutes)
	result := struct {
		Products []model.Product `json:"products"`
		Total    int64           `json:"total"`
	}{Products: products, Total: total}

	if data, err := json.Marshal(result); err == nil {
		s.redis.Set(ctx, cacheKey, data, 5*time.Minute)
	}

	return products, total, nil
}

// GetProduct retourne un produit avec cache
func (s *ProductService) GetProduct(id string) (*model.Product, error) {
	cacheKey := fmt.Sprintf("product:%s", id)
	ctx := context.Background()

	// Vérifier cache
	if cached, err := s.redis.Get(ctx, cacheKey).Result(); err == nil {
		var product model.Product
		if err := json.Unmarshal([]byte(cached), &product); err == nil {
			return &product, nil
		}
	}

	product, err := s.repo.GetProductByID(id)
	if err != nil {
		return nil, err
	}

	// Cache 10 minutes
	if data, err := json.Marshal(product); err == nil {
		s.redis.Set(ctx, cacheKey, data, 10*time.Minute)
	}

	return product, nil
}

// GetFeaturedProducts retourne les produits en vedette
func (s *ProductService) GetFeaturedProducts() ([]model.Product, error) {
	cacheKey := "products:featured"
	ctx := context.Background()

	if cached, err := s.redis.Get(ctx, cacheKey).Result(); err == nil {
		var products []model.Product
		if err := json.Unmarshal([]byte(cached), &products); err == nil {
			return products, nil
		}
	}

	products, err := s.repo.GetFeaturedProducts(12)
	if err != nil {
		return nil, err
	}

	if data, err := json.Marshal(products); err == nil {
		s.redis.Set(ctx, cacheKey, data, 10*time.Minute)
	}

	return products, nil
}

// GetCategories retourne les catégories
func (s *ProductService) GetCategories() ([]model.Category, error) {
	cacheKey := "categories:all"
	ctx := context.Background()

	if cached, err := s.redis.Get(ctx, cacheKey).Result(); err == nil {
		var categories []model.Category
		if err := json.Unmarshal([]byte(cached), &categories); err == nil {
			return categories, nil
		}
	}

	categories, err := s.repo.GetCategories()
	if err != nil {
		return nil, err
	}

	if data, err := json.Marshal(categories); err == nil {
		s.redis.Set(ctx, cacheKey, data, 30*time.Minute)
	}

	return categories, nil
}
