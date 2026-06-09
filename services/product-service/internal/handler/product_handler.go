package handler

import (
	"github.com/am-info/product-service/internal/model"
	"github.com/am-info/product-service/internal/repository"
	"github.com/am-info/product-service/internal/service"
	"github.com/gofiber/fiber/v2"
)

type ProductHandler struct {
	service *service.ProductService
	repo    *repository.ProductRepository
}

func NewProductHandler(service *service.ProductService, repo *repository.ProductRepository) *ProductHandler {
	return &ProductHandler{service: service, repo: repo}
}

// GET /api/v1/products
func (h *ProductHandler) GetProducts(c *fiber.Ctx) error {
	params := repository.ProductQueryParams{
		Page:       c.QueryInt("page", 1),
		Limit:      c.QueryInt("limit", 20),
		CategoryID: c.Query("category"),
		Brand:      c.Query("brand"),
		MinPrice:   c.QueryFloat("min_price", 0),
		MaxPrice:   c.QueryFloat("max_price", 0),
		InStock:    c.QueryBool("in_stock"),
		Search:     c.Query("q"),
		SortBy:     c.Query("sort", "newest"),
	}

	if params.Page < 1 { params.Page = 1 }
	if params.Limit < 1 || params.Limit > 100 { params.Limit = 20 }

	products, total, err := h.service.GetProducts(params)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erreur récupération produits"})
	}

	totalPages := (total + int64(params.Limit) - 1) / int64(params.Limit)

	return c.JSON(fiber.Map{
		"data": products,
		"pagination": fiber.Map{
			"page": params.Page, "limit": params.Limit,
			"total": total, "total_pages": totalPages,
		},
	})
}

// GET /api/v1/products/:id
func (h *ProductHandler) GetProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	product, err := h.service.GetProduct(id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Produit non trouvé"})
	}
	return c.JSON(product)
}

// POST /api/v1/products
func (h *ProductHandler) CreateProduct(c *fiber.Ctx) error {
	var input struct {
		Name        string  `json:"name"`
		Description string  `json:"description"`
		Price       float64 `json:"price"`
		Stock       int     `json:"stock_quantity"`
		CategoryID  string  `json:"category_id"`
		Brand       string  `json:"brand"`
		SKU         string  `json:"sku"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Données invalides"})
	}

	product := &model.Product{
		Name:          input.Name,
		Slug:          generateSlug(input.Name),
		Description:   input.Description,
		Price:         input.Price,
		StockQuantity: input.Stock,
		CategoryID:    &input.CategoryID,
		Brand:         input.Brand,
		SKU:           input.SKU,
		IsActive:      true,
	}

	if err := h.repo.Create(product); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erreur création produit"})
	}

	return c.Status(201).JSON(product)
}

// PUT /api/v1/products/:id
func (h *ProductHandler) UpdateProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	var input struct {
		Name          string  `json:"name"`
		Description   string  `json:"description"`
		Price         float64 `json:"price"`
		StockQuantity int     `json:"stock_quantity"`
		CategoryID    string  `json:"category_id"`
		Brand         string  `json:"brand"`
		IsActive      *bool   `json:"is_active"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Données invalides"})
	}

	updates := map[string]interface{}{}
	if input.Name != "" { updates["name"] = input.Name }
	if input.Description != "" { updates["description"] = input.Description }
	if input.Price > 0 { updates["price"] = input.Price }
	if input.StockQuantity >= 0 { updates["stock_quantity"] = input.StockQuantity }
	if input.CategoryID != "" { updates["category_id"] = input.CategoryID }
	if input.Brand != "" { updates["brand"] = input.Brand }
	if input.IsActive != nil { updates["is_active"] = *input.IsActive }

	if err := h.repo.Update(id, updates); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erreur modification"})
	}

	return c.JSON(fiber.Map{"message": "Produit modifié"})
}

// DELETE /api/v1/products/:id
func (h *ProductHandler) DeleteProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.repo.Delete(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erreur suppression"})
	}
	return c.JSON(fiber.Map{"message": "Produit supprimé"})
}

// GET /api/v1/products/featured
func (h *ProductHandler) GetFeaturedProducts(c *fiber.Ctx) error {
	products, err := h.service.GetFeaturedProducts()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erreur"})
	}
	return c.JSON(products)
}

// GET /api/v1/categories
func (h *ProductHandler) GetCategories(c *fiber.Ctx) error {
	categories, err := h.service.GetCategories()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erreur"})
	}
	return c.JSON(categories)
}

func generateSlug(name string) string {
	slug := ""
	for _, c := range name {
		if (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') {
			slug += string(c)
		} else if c == ' ' || c == '-' {
			slug += "-"
		}
	}
	return slug
}
