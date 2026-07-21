package handler

import (
	"fmt"
	"strings"

	"github.com/am-info/product-service/internal/model"
	"github.com/am-info/product-service/internal/repository"
	"github.com/am-info/product-service/internal/service"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type ProductHandler struct {
	service *service.ProductService
	repo    *repository.ProductRepository
}

func NewProductHandler(service *service.ProductService, repo *repository.ProductRepository) *ProductHandler {
	return &ProductHandler{service: service, repo: repo}
}

// GET /categories
func (h *ProductHandler) GetCategories(c *fiber.Ctx) error {
	categories, _ := h.service.GetCategories()
	return c.JSON(categories)
}

// POST /categories (comme FastAPI)
func (h *ProductHandler) CreateCategory(c *fiber.Ctx) error {
	var input struct {
		Name string `json:"name"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Données invalides"})
	}

	slug := strings.ToLower(strings.ReplaceAll(input.Name, " ", "-"))
	category := &model.Category{
		Name:     input.Name,
		Slug:     slug,
		IsActive: true,
	}

	result, err := h.repo.CreateCategory(category)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erreur création"})
	}

	// Invalider le cache
	h.service.InvalidateCache()

	return c.Status(201).JSON(result)
}

// PUT /categories/:id
func (h *ProductHandler) UpdateCategory(c *fiber.Ctx) error {
	var input struct {
		Name string `json:"name"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Données invalides"})
	}

	if err := h.repo.UpdateCategory(c.Params("id"), input.Name); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erreur"})
	}

	h.service.InvalidateCache()
	return c.JSON(fiber.Map{"message": "Modifié"})
}

// DELETE /categories/:id
func (h *ProductHandler) DeleteCategory(c *fiber.Ctx) error {
	if err := h.repo.DeleteCategory(c.Params("id")); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erreur"})
	}

	h.service.InvalidateCache()
	return c.JSON(fiber.Map{"message": "Supprimee"})
}

// GET /products
func (h *ProductHandler) GetProducts(c *fiber.Ctx) error {
	params := repository.ProductQueryParams{
		Page: c.QueryInt("page", 1), Limit: c.QueryInt("limit", 20),
		CategoryID: c.Query("category"), Brand: c.Query("brand"),
		Search: c.Query("q"), SortBy: c.Query("sort", "newest"),
	}
	if params.Page < 1 { params.Page = 1 }
	if params.Limit < 1 || params.Limit > 100 { params.Limit = 20 }

	products, total, err := h.service.GetProducts(params)
	if err != nil { return c.Status(500).JSON(fiber.Map{"error": "Erreur"}) }
	return c.JSON(fiber.Map{"data": products, "pagination": fiber.Map{
		"page": params.Page, "limit": params.Limit, "total": total,
		"total_pages": (total + int64(params.Limit) - 1) / int64(params.Limit),
	}})
}

func (h *ProductHandler) GetProduct(c *fiber.Ctx) error {
	product, err := h.service.GetProduct(c.Params("id"))
	if err != nil { return c.Status(404).JSON(fiber.Map{"error": "Produit non trouvé"}) }
	return c.JSON(product)
}

func (h *ProductHandler) CreateProduct(c *fiber.Ctx) error {
	var input struct {
		Name string `json:"name"`; Price float64 `json:"price"`
		StockQuantity int `json:"stock_quantity"`; CategoryID string `json:"category_id"`
		Brand string `json:"brand"`; Description string `json:"description"`
	}
	if err := c.BodyParser(&input); err != nil { return c.Status(400).JSON(fiber.Map{"error": "Données invalides"}) }

	product := &model.Product{
		Name: input.Name, Price: input.Price, StockQuantity: input.StockQuantity,
		Brand: input.Brand, Description: input.Description, IsActive: true,
		Slug: fmt.Sprintf("%s-%s", strings.ToLower(strings.ReplaceAll(input.Name, " ", "-")), uuid.New().String()[:6]),
		SKU: fmt.Sprintf("SKU-%s", uuid.New().String()[:8]),
	}
	if input.CategoryID != "" { product.CategoryID = &input.CategoryID }

	if err := h.repo.Create(product); err != nil { return c.Status(500).JSON(fiber.Map{"error": "Erreur"}) }
	h.service.InvalidateCache()
	return c.Status(201).JSON(product)
}

func (h *ProductHandler) UpdateProduct(c *fiber.Ctx) error {
	var input struct {
		Name string `json:"name"`; Price float64 `json:"price"`
		StockQuantity int `json:"stock_quantity"`; CategoryID string `json:"category_id"`
		Brand string `json:"brand"`; Description string `json:"description"`
		IsActive *bool `json:"is_active"`
	}
	if err := c.BodyParser(&input); err != nil { return c.Status(400).JSON(fiber.Map{"error": "Données invalides"}) }

	updates := map[string]interface{}{}
	if input.Name != "" { updates["name"] = input.Name }
	if input.Price > 0 { updates["price"] = input.Price }
	if input.StockQuantity >= 0 { updates["stock_quantity"] = input.StockQuantity }
	if input.Brand != "" { updates["brand"] = input.Brand }
	if input.Description != "" { updates["description"] = input.Description }
	if input.CategoryID != "" { updates["category_id"] = input.CategoryID }
	if input.IsActive != nil { updates["is_active"] = *input.IsActive }

	if err := h.repo.Update(c.Params("id"), updates); err != nil { return c.Status(500).JSON(fiber.Map{"error": "Erreur"}) }
	h.service.InvalidateCache()
	return c.JSON(fiber.Map{"message": "Modifié"})
}

func (h *ProductHandler) DeleteProduct(c *fiber.Ctx) error {
	if err := h.repo.Delete(c.Params("id")); err != nil { return c.Status(500).JSON(fiber.Map{"error": "Erreur"}) }
	h.service.InvalidateCache()
	return c.JSON(fiber.Map{"message": "Supprimé"})
}

func (h *ProductHandler) GetFeaturedProducts(c *fiber.Ctx) error {
	products, _ := h.service.GetFeaturedProducts()
	return c.JSON(products)
}

func (h *ProductHandler) InvalidateCache(c *fiber.Ctx) error {
	h.service.InvalidateCache()
	return c.JSON(fiber.Map{"message": "Cache vidé"})
}
