package service

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
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
	return &ProductService{repo: repo, redis: redis}
}

func (s *ProductService) GetProducts(params repository.ProductQueryParams) ([]model.Product, int64, error) {
	cacheKey := fmt.Sprintf("products:page:%d:limit:%d:cat:%s:sort:%s:search:%s",
		params.Page, params.Limit, params.CategoryID, params.SortBy, params.Search)

	ctx := context.Background()

	if cached, err := s.redis.Get(ctx, cacheKey).Result(); err == nil {
		var result struct {
			Products []model.Product `json:"products"`
			Total    int64           `json:"total"`
		}
		if err := json.Unmarshal([]byte(cached), &result); err == nil {
			return result.Products, result.Total, nil
		}
	}

	products, total, err := s.repo.GetProducts(params)
	if err != nil {
		return nil, 0, err
	}

	result := struct {
		Products []model.Product `json:"products"`
		Total    int64           `json:"total"`
	}{Products: products, Total: total}

	if data, err := json.Marshal(result); err == nil {
		s.redis.Set(ctx, cacheKey, data, 5*time.Minute)
	}

	products = s.FetchAndApplyDiscounts(products)
	return products, total, nil
}

func (s *ProductService) GetProduct(id string) (*model.Product, error) {
	cacheKey := fmt.Sprintf("product:%s", id)
	ctx := context.Background()

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

	if data, err := json.Marshal(product); err == nil {
		s.redis.Set(ctx, cacheKey, data, 10*time.Minute)
	}

	return product, nil
}

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

func (s *ProductService) InvalidateCache() {
	ctx := context.Background()
	s.redis.Del(ctx, "categories:all")
	s.redis.Del(ctx, "products:featured")
	keys, _ := s.redis.Keys(ctx, "products:*").Result()
	for _, key := range keys {
		s.redis.Del(ctx, key)
	}
}

// FetchAndApplyDiscounts récupère les promotions depuis l'Admin Service
func (s *ProductService) FetchAndApplyDiscounts(products []model.Product) []model.Product {
	adminURL := os.Getenv("ADMIN_SERVICE_URL")
	if adminURL == "" {
		adminURL = "http://localhost:8086"
	}

	req, _ := http.NewRequest("GET", adminURL+"/api/v1/admin/discounts", nil)
	req.Header.Set("X-User-ID", "admin")
	req.Header.Set("X-User-Role", "admin")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return products
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var discounts []struct {
		ID           string  `json:"id"`
		Name         string  `json:"name"`
		DiscountType string  `json:"discount_type"`
		Value        float64 `json:"value"`
		TargetType   string  `json:"target_type"`
		TargetID     string  `json:"target_id"`
		IsActive     bool    `json:"is_active"`
	}

	json.Unmarshal(body, &discounts)

	for i := range products {
		bestPrice := products[i].Price

		catID := ""
		if products[i].CategoryID != nil {
			catID = *products[i].CategoryID
		}

		for _, d := range discounts {
			if !d.IsActive {
				continue
			}

			applicable := false
			switch d.TargetType {
			case "global":
				applicable = true
			case "product":
				applicable = (d.TargetID == products[i].ID)
			case "category":
				applicable = (d.TargetID == catID || d.TargetID == products[i].Category.Name)
			}

			if applicable {
				var newPrice float64
				switch d.DiscountType {
				case "percentage":
					newPrice = products[i].Price * (1 - d.Value/100)
				case "fixed_amount":
					newPrice = products[i].Price - d.Value
					if newPrice < 0 {
						newPrice = 0
					}
				}

				if newPrice < bestPrice {
					bestPrice = newPrice
				}
			}
		}

		if bestPrice < products[i].Price {
			originalPrice := products[i].Price
			products[i].Price = bestPrice
			products[i].ComparePrice = &originalPrice
		}
	}

	return products
}
