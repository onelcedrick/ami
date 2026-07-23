package websocket

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gofiber/websocket/v2"
)

type Client struct {
	ID   string
	Conn *websocket.Conn
	Mu   sync.Mutex
}

type Hub struct {
	clients    map[string]*Client
	register   chan *Client
	unregister chan *Client
	broadcast  chan []byte
	mu         sync.RWMutex
}

func NewHub() *Hub {
	h := &Hub{
		clients:    make(map[string]*Client),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan []byte, 256),
	}
	go h.Run()
	return h
}

var DefaultHub = NewHub()

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client.ID] = client
			h.mu.Unlock()
			log.Printf("🔌 WebSocket: Client connecté (%s)", client.ID)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client.ID]; ok {
				delete(h.clients, client.ID)
				client.Conn.Close()
			}
			h.mu.Unlock()
			log.Printf("🔌 WebSocket: Client déconnecté (%s)", client.ID)

		case message := <-h.broadcast:
			h.mu.RLock()
			for id, client := range h.clients {
				err := client.Conn.WriteMessage(websocket.TextMessage, message)
				if err != nil {
					log.Printf("⚠️ Erreur envoi à %s: %v", id, err)
					client.Conn.Close()
					delete(h.clients, id)
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) SendToUser(userID string, message []byte) {
	h.mu.RLock()
	client, ok := h.clients[userID]
	h.mu.RUnlock()
	if ok {
		client.Mu.Lock()
		client.Conn.WriteMessage(websocket.TextMessage, message)
		client.Mu.Unlock()
	}
}

func (h *Hub) BroadcastJSON(payload map[string]interface{}) {
	data, err := json.Marshal(payload)
	if err != nil {
		return
	}
	h.broadcast <- data
}

func NewWSHandler(h *Hub) func(*websocket.Conn) {
	return func(c *websocket.Conn) {
		userID := c.Query("user_id", "anonymous")

		client := &Client{
			ID:   userID,
			Conn: c,
		}

		h.register <- client
		log.Printf("✅ WebSocket connecté: %s", userID)

		for {
			_, _, err := c.ReadMessage()
			if err != nil {
				break
			}
		}

		h.unregister <- client
	}
}

func HandleWebSocket(c *websocket.Conn) {
	NewWSHandler(DefaultHub)(c)
}
