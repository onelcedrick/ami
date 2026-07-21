package events

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"sync"
)

// Event représente un événement système
type Event struct {
	Type      string `json:"type"`      // login, logout, create, update, delete
	UserID    string `json:"user_id"`
	UserEmail string `json:"user_email"`
	Entity    string `json:"entity"`    // user, product, order, ticket
	EntityID  string `json:"entity_id"`
	Details   string `json:"details"`
}

// Observer interface (Design Pattern Observer)
type Observer interface {
	Notify(event Event)
}

// EventBus (Singleton) - gère les événements et notifie les observers
type EventBus struct {
	observers []Observer
	mu        sync.RWMutex
}

var instance *EventBus
var once sync.Once

// GetEventBus retourne l'instance unique (Singleton Pattern)
func GetEventBus() *EventBus {
	once.Do(func() {
		instance = &EventBus{
			observers: make([]Observer, 0),
		}
	})
	return instance
}

// Subscribe ajoute un observer
func (eb *EventBus) Subscribe(observer Observer) {
	eb.mu.Lock()
	defer eb.mu.Unlock()
	eb.observers = append(eb.observers, observer)
	log.Printf("📡 Observer enregistré: %d total", len(eb.observers))
}

// Emit émet un événement à tous les observers
func (eb *EventBus) Emit(event Event) {
	eb.mu.RLock()
	defer eb.mu.RUnlock()
	
	log.Printf("📢 Événement émis: %s - %s - %s", event.Type, event.Entity, event.Details)
	
	for _, observer := range eb.observers {
		go observer.Notify(event)
	}
}

// ==========================================
// LogObserver - enregistre les événements dans l'Admin Service
// ==========================================
type LogObserver struct {
	AdminServiceURL string
}

func NewLogObserver(adminURL string) *LogObserver {
	return &LogObserver{AdminServiceURL: adminURL}
}

func (l *LogObserver) Notify(event Event) {
	data, _ := json.Marshal(event)
	
	resp, err := http.Post(
		l.AdminServiceURL+"/api/v1/admin/logs/activity",
		"application/json",
		bytes.NewReader(data),
	)
	
	if err != nil {
		log.Printf("❌ Erreur log: %v", err)
		return
	}
	defer resp.Body.Close()
	
	if resp.StatusCode == 200 {
		log.Printf("✅ Log enregistré: %s - %s", event.Type, event.Details)
	} else {
		log.Printf("⚠️ Log erreur: %d", resp.StatusCode)
	}
}
