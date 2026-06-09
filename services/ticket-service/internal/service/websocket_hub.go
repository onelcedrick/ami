package service

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gofiber/websocket/v2"
)

type Client struct {
	ID   string
	Role string
	Conn *websocket.Conn
	Send chan []byte
}

type WebSocketHub struct {
	clients    map[string]*Client
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

func NewWebSocketHub() *WebSocketHub {
	hub := &WebSocketHub{
		clients:    make(map[string]*Client),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
	go hub.run()
	return hub
}

func (h *WebSocketHub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client.ID] = client
			h.mu.Unlock()
			log.Printf("🔌 Client WS connecté: %s (%s)", client.ID, client.Role)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client.ID]; ok {
				delete(h.clients, client.ID)
				close(client.Send)
			}
			h.mu.Unlock()
			log.Printf("🔌 Client WS déconnecté: %s", client.ID)
		}
	}
}

func (h *WebSocketHub) Register(client *Client) {
	h.register <- client
}

func (h *WebSocketHub) Unregister(client *Client) {
	h.unregister <- client
}

func (h *WebSocketHub) SendToUser(userID string, data interface{}) {
	h.mu.RLock()
	client, ok := h.clients[userID]
	h.mu.RUnlock()

	if ok {
		message, _ := json.Marshal(data)
		select {
		case client.Send <- message:
		default:
		}
	}
}

func (h *WebSocketHub) BroadcastToRole(role string, data interface{}) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	message, _ := json.Marshal(data)
	for _, client := range h.clients {
		if client.Role == role {
			select {
			case client.Send <- message:
			default:
			}
		}
	}
}
