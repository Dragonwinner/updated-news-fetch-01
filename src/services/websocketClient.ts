const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

export type WebSocketMessage = {
  type: string;
  data?: unknown;
  message?: string;
};

export type WebSocketCallback = (message: WebSocketMessage) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private callbacks: Set<WebSocketCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token?: string) {
    const url = token ? `${WS_BASE_URL}/ws?token=${token}` : `${WS_BASE_URL}/ws`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.notifyCallbacks(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        this.handleReconnect(token);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }

  private handleReconnect(token?: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(token);
      }, delay);
    } else {
      console.error('Max reconnect attempts reached');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  subscribe(callback: WebSocketCallback) {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  private notifyCallbacks(message: WebSocketMessage) {
    this.callbacks.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in WebSocket callback:', error);
      }
    });
  }
}

export const wsClient = new WebSocketClient();
