package model

import (
	"time"
)

type User struct {
	ID             string    `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()" json:"id"`
	Email          string    `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash   string    `gorm:"not null" json:"-"`
	FirstName      string    `gorm:"not null" json:"first_name"`
	LastName       string    `gorm:"not null" json:"last_name"`
	Phone          string    `json:"phone,omitempty"`
    AvatarURL     string    `json:"avatar_url,omitempty"`
	Role           string    `gorm:"default:client;check:role IN ('client','technician','admin')" json:"role"`
	IsActive       bool      `gorm:"default:true" json:"is_active"`
	EmailVerified  bool      `gorm:"default:false" json:"email_verified"`
	LastLogin      *time.Time `json:"last_login,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// Request/Response DTOs
type RegisterRequest struct {
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=8"`
	FirstName string `json:"first_name" validate:"required"`
	LastName  string `json:"last_name" validate:"required"`
	Phone     string `json:"phone,omitempty"`
    AvatarURL     string    `json:"avatar_url,omitempty"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
	User         UserResponse `json:"user"`
}

type UserResponse struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Phone     string `json:"phone,omitempty"`
    AvatarURL     string    `json:"avatar_url,omitempty"`
	Role      string `json:"role"`
}
