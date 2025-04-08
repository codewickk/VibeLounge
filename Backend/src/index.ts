import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

app.use(cors());
app.use(express.json());

app.get('/ping', (req, res) => {
  res.json({ status: 'alive', connections: wss.clients.size });
});

app.get('/', (req, res) => {
  res.send('🎉 VibeLounge WebSocket Server is running.');
});

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

interface ClientMessage {
  type: 'join' | 'chat' | 'create';
  roomId: string;
  metadata: {
    name: string;
    avatarUrl: string;
    timestamp: number;
  };
  payload?: {
    message: string;
  };
}

// Track rooms and associated client metadata
interface ClientInfo {
  ws: WebSocket;
  name: string;
  avatarUrl: string;
}

const rooms = new Map<string, Map<WebSocket, ClientInfo>>();

// Single WebSocket connection handler
wss.on('connection', (ws) => {
  console.log(`WebSocket connected at ${new Date().toISOString()}`);
  console.log(`Total connections: ${wss.clients.size}`);
  
  let currentRoomId: string | null = null;
  let currentUserName: string | null = null;

  ws.on('message', (data) => {
    try {
      const message: ClientMessage = JSON.parse(data.toString());
      console.log(`Received message type: ${message.type} for room: ${message.roomId}`);

      if (message.type === 'join') {
        // Store the room ID and user info
        currentRoomId = message.roomId;
        currentUserName = message.metadata.name;
        
        // Initialize room if it doesn't exist
        if (!rooms.has(currentRoomId)) {
          rooms.set(currentRoomId, new Map());
        }
        
        // Add this client to the room
        const roomClients = rooms.get(currentRoomId)!;
        roomClients.set(ws, {
          ws,
          name: message.metadata.name,
          avatarUrl: message.metadata.avatarUrl
        });
        
        // Send join notification to everyone in the room INCLUDING sender
        roomClients.forEach((client) => {
          if (client.ws.readyState === WebSocket.OPEN) {
            // Let everyone know about the new user
            if (client.ws !== ws) {
              client.ws.send(JSON.stringify({
                type: 'join',
                metadata: message.metadata,
                roomId: message.roomId,
                payload: {
                  message: `${message.metadata.name} joined the room`
                }
              }));
            }
            
            // Send an updated participant list to everyone
            const participantNames = Array.from(roomClients.values()).map(c => c.name);
            client.ws.send(JSON.stringify({
              type: 'participantList',
              roomId: currentRoomId,
              metadata: { name: 'System', timestamp: Date.now() },
              payload: {
                participants: participantNames
              }
            }));
          }
        });
        
        // Send welcome message only to the joined user
        ws.send(JSON.stringify({
          type: 'system',
          metadata: { name: 'System', timestamp: Date.now() },
          payload: {
            message: `Welcome to room ${message.roomId}!`
          }
        }));
      }

      if (message.type === 'chat' && currentRoomId && rooms.has(currentRoomId)) {
        const roomClients = rooms.get(currentRoomId)!;
        
        // Broadcast the message to ALL clients in the room, including sender
        roomClients.forEach((client) => {
          if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(message));
          }
        });
      }
    } catch (err) {
      console.error('Error processing message:', err);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    
    if (currentRoomId && rooms.has(currentRoomId)) {
      const roomClients = rooms.get(currentRoomId)!;
      
      // Remove this client from the room
      roomClients.delete(ws);
      
      // Notify others that this user left
      if (currentUserName) {
        roomClients.forEach((client) => {
          if (client.ws.readyState === WebSocket.OPEN) {
            // Send leave notification
            client.ws.send(JSON.stringify({
              type: 'system',
              metadata: { name: 'System', timestamp: Date.now() },
              payload: {
                message: `${currentUserName} left the room`
              }
            }));
            
            // Send updated participant list
            const participantNames = Array.from(roomClients.values()).map(c => c.name);
            client.ws.send(JSON.stringify({
              type: 'participantList',
              roomId: currentRoomId,
              metadata: { name: 'System', timestamp: Date.now() },
              payload: {
                participants: participantNames
              }
            }));
          }
        });
      }
      
      // Clean up empty rooms
      if (roomClients.size === 0) {
        rooms.delete(currentRoomId);
        console.log(`Room ${currentRoomId} deleted (empty)`);
      }
    }
  });
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});