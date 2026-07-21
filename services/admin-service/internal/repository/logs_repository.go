package repository

import (
	"database/sql"
	"fmt"
	"time"
)

type LogsRepository struct {
	db *sql.DB
}

func NewLogsRepository(db *sql.DB) *LogsRepository {
	db.Exec(`CREATE TABLE IF NOT EXISTS activity_logs (
		id VARCHAR(36) PRIMARY KEY,
		user_id VARCHAR(36),
		user_name VARCHAR(255) DEFAULT 'Systeme',
		user_email VARCHAR(255) DEFAULT '',
		action VARCHAR(50) NOT NULL,
		entity VARCHAR(50),
		entity_id VARCHAR(36),
		details TEXT,
		ip_address VARCHAR(50),
		created_at TIMESTAMPTZ DEFAULT NOW()
	)`)
	return &LogsRepository{db: db}
}

func (r *LogsRepository) LogActivity(userID, userName, userEmail, action, entity, entityID, details, ip string) {
	r.db.Exec(`INSERT INTO activity_logs (user_id, user_name, user_email, action, entity, entity_id, details, ip_address) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, userID, userName, userEmail, action, entity, entityID, details, ip)
}

func (r *LogsRepository) GetRecent(limit int, action, entity string) ([]map[string]interface{}, error) {
	query := "SELECT id, user_id, user_name, user_email, action, entity, entity_id, details, ip_address, created_at FROM activity_logs WHERE 1=1"
	args := []interface{}{}
	argIdx := 1

	if action != "" {
		query += fmt.Sprintf(" AND action = $%d", argIdx)
		args = append(args, action)
		argIdx++
	}
	if entity != "" {
		query += fmt.Sprintf(" AND entity = $%d", argIdx)
		args = append(args, entity)
		argIdx++
	}

	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d", argIdx)
	args = append(args, limit)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []map[string]interface{}
	for rows.Next() {
		var id, userID, userName, userEmail, act, ent string
		var entityID, details, ip sql.NullString
		var createdAt time.Time
		rows.Scan(&id, &userID, &userName, &userEmail, &act, &ent, &entityID, &details, &ip, &createdAt)

		logs = append(logs, map[string]interface{}{
			"id": id, "user_id": userID, "user_name": userName, "user_email": userEmail,
			"action": act, "entity": ent, "entity_id": entityID.String,
			"details": details.String, "ip_address": ip.String, "created_at": createdAt,
		})
	}
	if logs == nil { logs = []map[string]interface{}{} }
	return logs, nil
}

func (r *LogsRepository) GetStats() (map[string]interface{}, error) {
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	var totalAll, totalToday int
	r.db.QueryRow("SELECT COUNT(*) FROM activity_logs").Scan(&totalAll)
	r.db.QueryRow("SELECT COUNT(*) FROM activity_logs WHERE created_at >= $1", today).Scan(&totalToday)

	topActions := []map[string]interface{}{}
	rows, _ := r.db.Query("SELECT action, COUNT(*) FROM activity_logs GROUP BY action ORDER BY COUNT(*) DESC LIMIT 5")
	if rows != nil {
		defer rows.Close()
		for rows.Next() {
			var a string; var c int
			rows.Scan(&a, &c)
			topActions = append(topActions, map[string]interface{}{"action": a, "count": c})
		}
	}
	if topActions == nil { topActions = []map[string]interface{}{} }

	return map[string]interface{}{
		"total_all": totalAll, "total_today": totalToday,
		"top_actions": topActions,
	}, nil
}
