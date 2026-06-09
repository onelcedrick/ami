package service

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/am-info/auth-service/internal/model"
	"github.com/am-info/auth-service/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/argon2"
)

const (
	argon2Time    = uint32(3)
	argon2Memory  = uint32(64 * 1024)
	argon2Threads = uint8(4)
	argon2KeyLen  = uint32(32)
	saltLen       = 16
)

type AuthService struct {
	repo       *repository.UserRepository
	privateKey *rsa.PrivateKey
	publicKey  *rsa.PublicKey
}

func NewAuthService(repo *repository.UserRepository) (*AuthService, error) {
	privateKey, publicKey, err := loadRSAKeys()
	if err != nil {
		return nil, fmt.Errorf("erreur chargement clés RSA: %w", err)
	}

	return &AuthService{
		repo:       repo,
		privateKey: privateKey,
		publicKey:  publicKey,
	}, nil
}

func (s *AuthService) PublicKey() interface{} {
	return s.publicKey
}

func (s *AuthService) Register(req model.RegisterRequest) (*model.User, error) {
	if s.repo.EmailExists(req.Email) {
		return nil, errors.New("cet email est déjà utilisé")
	}

	hashedPassword, err := hashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("erreur hashage mot de passe: %w", err)
	}

	fmt.Printf("DEBUG - Hash créé: %s\n", hashedPassword)

	user := &model.User{
		ID:           uuid.New().String(),
		Email:        req.Email,
		PasswordHash: hashedPassword,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Phone:        req.Phone,
		Role:         "client",
	}

	if err := s.repo.Create(user); err != nil {
		return nil, fmt.Errorf("erreur création utilisateur: %w", err)
	}

	return user, nil
}

func (s *AuthService) Login(req model.LoginRequest) (*model.LoginResponse, error) {
	user, err := s.repo.FindByEmail(req.Email)
	if err != nil {
		return nil, errors.New("email ou mot de passe incorrect")
	}

	fmt.Printf("DEBUG - Hash stocké: %s\n", user.PasswordHash)
	fmt.Printf("DEBUG - Password testé: %s\n", req.Password)

	if !verifyPassword(user.PasswordHash, req.Password) {
		return nil, errors.New("email ou mot de passe incorrect")
	}

	accessToken, err := s.generateAccessToken(user)
	if err != nil {
		return nil, fmt.Errorf("erreur génération token: %w", err)
	}

	refreshToken, err := s.generateRefreshToken(user)
	if err != nil {
		return nil, fmt.Errorf("erreur génération refresh token: %w", err)
	}

	s.repo.UpdateLastLogin(user.ID)

	return &model.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    86400,
		User: model.UserResponse{
			ID:        user.ID,
			Email:     user.Email,
			FirstName: user.FirstName,
			LastName:  user.LastName,
			Phone:     user.Phone,
			Role:      user.Role,
		},
	}, nil
}

func (s *AuthService) GetUserByID(id string) (*model.UserResponse, error) {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	return &model.UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Phone:     user.Phone,
		Role:      user.Role,
	}, nil
}

func (s *AuthService) generateAccessToken(user *model.User) (string, error) {
	claims := jwt.MapClaims{
		"sub":        user.ID,
		"email":      user.Email,
		"role":       user.Role,
		"first_name": user.FirstName,
		"last_name":  user.LastName,
		"type":       "access",
		"iat":        time.Now().Unix(),
		"exp":        time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	return token.SignedString(s.privateKey)
}

func (s *AuthService) generateRefreshToken(user *model.User) (string, error) {
	claims := jwt.MapClaims{
		"sub":  user.ID,
		"type": "refresh",
		"iat":  time.Now().Unix(),
		"exp":  time.Now().Add(7 * 24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	return token.SignedString(s.privateKey)
}

func hashPassword(password string) (string, error) {
	salt := make([]byte, saltLen)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}

	hash := argon2.IDKey([]byte(password), salt, argon2Time, argon2Memory, argon2Threads, argon2KeyLen)

	b64Salt := base64.RawStdEncoding.EncodeToString(salt)
	b64Hash := base64.RawStdEncoding.EncodeToString(hash)

	encoded := fmt.Sprintf("$argon2id$v=19$m=%d,t=%d,p=%d$%s$%s",
		argon2Memory, argon2Time, argon2Threads, b64Salt, b64Hash)

	return encoded, nil
}

func verifyPassword(encodedHash, password string) bool {
	// Format: $argon2id$v=19$m=65536,t=3,p=4$SALT$HASH
	parts := strings.Split(encodedHash, "$")
	if len(parts) < 6 {
		fmt.Printf("DEBUG - Format invalide, parties: %d\n", len(parts))
		return false
	}

	// Extraire les paramètres
	params := strings.Split(parts[3], ",")
	if len(params) != 3 {
		fmt.Printf("DEBUG - Paramètres invalides: %s\n", parts[3])
		return false
	}

	var memory, time, threads uint32
	fmt.Sscanf(params[0], "m=%d", &memory)
	fmt.Sscanf(params[1], "t=%d", &time)
	fmt.Sscanf(params[2], "p=%d", &threads)

	b64Salt := parts[4]
	b64Hash := parts[5]

	fmt.Printf("DEBUG - m=%d, t=%d, p=%d\n", memory, time, threads)
	fmt.Printf("DEBUG - Salt: %s\n", b64Salt)
	fmt.Printf("DEBUG - Hash attendu: %s\n", b64Hash)

	salt, err := base64.RawStdEncoding.DecodeString(b64Salt)
	if err != nil {
		fmt.Printf("DEBUG - Erreur décodage sel: %v\n", err)
		return false
	}

	expectedHash, err := base64.RawStdEncoding.DecodeString(b64Hash)
	if err != nil {
		fmt.Printf("DEBUG - Erreur décodage hash: %v\n", err)
		return false
	}

	computedHash := argon2.IDKey([]byte(password), salt, time, memory, uint8(threads), uint32(len(expectedHash)))

	fmt.Printf("DEBUG - Hash calculé: %s\n", base64.RawStdEncoding.EncodeToString(computedHash))

	return compareBytes(computedHash, expectedHash)
}

func compareBytes(a, b []byte) bool {
	if len(a) != len(b) {
		return false
	}
	var v byte
	for i := 0; i < len(a); i++ {
		v |= a[i] ^ b[i]
	}
	return v == 0
}

func loadRSAKeys() (*rsa.PrivateKey, *rsa.PublicKey, error) {
	privateKey, err := loadPrivateKey("../../keys/private.pem")
	if err == nil {
		publicKey, err := loadPublicKey("../../keys/public.pem")
		if err == nil {
			return privateKey, publicKey, nil
		}
	}

	fmt.Println("🔑 Génération de nouvelles clés RSA...")
	privateKey, publicKey, err := generateRSAKeys()
	if err != nil {
		return nil, nil, err
	}

	os.MkdirAll("../../keys", 0700)
	savePrivateKey("../../keys/private.pem", privateKey)
	savePublicKey("../../keys/public.pem", publicKey)

	return privateKey, publicKey, nil
}

func generateRSAKeys() (*rsa.PrivateKey, *rsa.PublicKey, error) {
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return nil, nil, err
	}
	return privateKey, &privateKey.PublicKey, nil
}

func loadPrivateKey(path string) (*rsa.PrivateKey, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	block, _ := pem.Decode(data)
	return x509.ParsePKCS1PrivateKey(block.Bytes)
}

func loadPublicKey(path string) (*rsa.PublicKey, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	block, _ := pem.Decode(data)
	pub, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	return pub.(*rsa.PublicKey), nil
}

func savePrivateKey(path string, key *rsa.PrivateKey) error {
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()

	return pem.Encode(f, &pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: x509.MarshalPKCS1PrivateKey(key),
	})
}

func savePublicKey(path string, key *rsa.PublicKey) error {
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()

	pubBytes, err := x509.MarshalPKIXPublicKey(key)
	if err != nil {
		return err
	}

	return pem.Encode(f, &pem.Block{
		Type:  "PUBLIC KEY",
		Bytes: pubBytes,
	})
}
