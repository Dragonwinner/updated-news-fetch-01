import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { verifyToken } from '../utils/jwt';

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, Set<WebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      console.log('New WebSocket connection');

      // Handle authentication
      const url = new URL(request.url || '', 'ws://localhost');
      const token = url.searchParams.get('token');
      
      let userId: string | null = null;

      if (token) {
        try {
          const decoded = verifyToken(token);
          userId = decoded.userId;
          
          // Add client to user's connection set
          if (!this.clients.has(userId)) {
            this.clients.set(userId, new Set());
          }
          this.clients.get(userId)?.add(ws);
        } catch {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
          ws.close();
          return;
        }
      }

      // Handle messages
      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('Error handling message:', error);
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        console.log('WebSocket connection closed');
        if (userId) {
          this.clients.get(userId)?.delete(ws);
          if (this.clients.get(userId)?.size === 0) {
            this.clients.delete(userId);
          }
        }
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to real-time updates',
      }));
    });
  }

  private handleMessage(ws: WebSocket, data: unknown) {
    // Handle different message types
    const message = data as { type: string; payload?: unknown };
    
    switch (message.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
      case 'subscribe':
        // Handle subscription requests
        break;
      default:
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Unknown message type',
        }));
    }
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(message: unknown) {
    const messageStr = JSON.stringify(message);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  /**
   * Send message to specific user
   */
  sendToUser(userId: string, message: unknown) {
    const messageStr = JSON.stringify(message);
    const userClients = this.clients.get(userId);
    
    if (userClients) {
      userClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageStr);
        }
      });
    }
  }

  /**
   * Notify about new domain
   */
  notifyNewDomain(domain: unknown) {
    this.broadcast({
      type: 'new_domain',
      data: domain,
    });
  }

  /**
   * Notify about domain update
   */
  notifyDomainUpdate(domain: unknown) {
    this.broadcast({
      type: 'domain_updated',
      data: domain,
    });
  }

  /**
   * Notify specific user
   */
  notifyUser(userId: string, notification: unknown) {
    this.sendToUser(userId, {
      type: 'notification',
      data: notification,
    });
  }
}

let wsService: WebSocketService | null = null;

export const initializeWebSocket = (server: Server): WebSocketService => {
  if (!wsService) {
    wsService = new WebSocketService(server);
    console.log('✅ WebSocket service initialized');
  }
  return wsService;
};

export const getWebSocketService = (): WebSocketService | null => {
  return wsService;
};
