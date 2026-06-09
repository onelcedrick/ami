package model

import (
	"time"
)

type Category struct {
	ID          string     `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()" json:"id"`
	Name        string     `gorm:"not null" json:"name"`
	Slug        string     `gorm:"uniqueIndex;not null" json:"slug"`
	Description string     `json:"description,omitempty"`
	ParentID    *string    `gorm:"type:uuid" json:"parent_id,omitempty"`
	ImageURL    string     `json:"image_url,omitempty"`
	IsActive    bool       `gorm:"default:true" json:"is_active"`
	SortOrder   int        `gorm:"default:0" json:"sort_order"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	Children    []Category `gorm:"foreignKey:ParentID" json:"children,omitempty"`
}

type Product struct {
	ID              string    `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()" json:"id"`
	Name            string    `gorm:"not null" json:"name"`
	Slug            string    `gorm:"uniqueIndex;not null" json:"slug"`
	Description     string    `json:"description,omitempty"`
	ShortDescription string   `json:"short_description,omitempty"`
	Price           float64   `gorm:"not null" json:"price"`
	ComparePrice    *float64  `json:"compare_price,omitempty"`
	SKU             string    `gorm:"uniqueIndex" json:"sku,omitempty"`
	StockQuantity   int       `gorm:"default:0" json:"stock_quantity"`
	StockStatus     string    `gorm:"default:in_stock" json:"stock_status"`
	CategoryID      *string   `gorm:"type:uuid" json:"category_id,omitempty"`
	Category        *Category `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Brand           string    `json:"brand,omitempty"`
	Images          []string  `gorm:"type:text[]" json:"images,omitempty"`
	Thumbnail       string    `json:"thumbnail,omitempty"`
	IsActive        bool      `gorm:"default:true" json:"is_active"`
	IsFeatured      bool      `gorm:"default:false" json:"is_featured"`
	RatingAvg       float64   `gorm:"default:0" json:"rating_avg"`
	RatingCount     int       `gorm:"default:0" json:"rating_count"`
	SalesCount      int       `gorm:"default:0" json:"sales_count"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}
