package repository

import (
	"database/sql"
	"time"
)

type DiscountRepository struct {
	db *sql.DB
}

func NewDiscountRepository(db *sql.DB) *DiscountRepository {
	// Créer la table si elle n'existe pas
	db.Exec(`CREATE TABLE IF NOT EXISTS discounts (
		id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
		name VARCHAR(255) NOT NULL,
		discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
		value DECIMAL(10,2) NOT NULL,
		target_type VARCHAR(20) NOT NULL DEFAULT 'global',
		target_id VARCHAR(36),
		is_active BOOLEAN DEFAULT true,
		created_at TIMESTAMPTZ DEFAULT NOW()
	)`)
	return &DiscountRepository{db: db}
}

func (r *DiscountRepository) GetAll() ([]map[string]interface{}, error) {
	rows, err := r.db.Query(`SELECT id, name, discount_type, value, target_type, target_id, is_active, created_at FROM discounts ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var discounts []map[string]interface{}
	for rows.Next() {
		var id, name, discountType, targetType string
		var value float64
		var targetID sql.NullString
		var isActive bool
		var createdAt time.Time
		rows.Scan(&id, &name, &discountType, &value, &targetType, &targetID, &isActive, &createdAt)

		tid := (*string)(nil)
		if targetID.Valid {
			tid = &targetID.String
		}

		discounts = append(discounts, map[string]interface{}{
			"id":            id,
			"name":          name,
			"discount_type": discountType,
			"value":         value,
			"target_type":   targetType,
			"target_id":     tid,
			"is_active":     isActive,
			"created_at":    createdAt,
		})
	}
	if discounts == nil {
		discounts = []map[string]interface{}{}
	}
	return discounts, nil
}

func (r *DiscountRepository) Create(data map[string]interface{}) (map[string]interface{}, error) {
	var id string
	err := r.db.QueryRow(`INSERT INTO discounts (name, discount_type, value, target_type, target_id) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
		data["name"], data["discount_type"], data["value"], data["target_type"], data["target_id"]).Scan(&id)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{"id": id, "message": "Cree"}, nil
}

func (r *DiscountRepository) Toggle(id string) error {
	_, err := r.db.Exec(`UPDATE discounts SET is_active = NOT is_active WHERE id = $1`, id)
	return err
}

func (r *DiscountRepository) Delete(id string) error {
	_, err := r.db.Exec(`DELETE FROM discounts WHERE id = $1`, id)
	return err
}
