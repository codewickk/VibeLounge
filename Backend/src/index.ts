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

const rooms = new Map<string, Map<string, ClientInfo>>();

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
        
        // Check if user with same name already exists in the room
        const roomClients = rooms.get(currentRoomId)!;
        
        // Add this client to the room - using name as key to prevent duplicates
        roomClients.set(currentUserName, {
          ws,
          name: message.metadata.name,
          avatarUrl: message.metadata.avatarUrl
        });
        
        console.log(`Room ${currentRoomId} now has ${roomClients.size} participants`);
        
        // Get unique participant names
        const participantNames = Array.from(roomClients.keys());
        
        // Notify everyone in the room about the new user
        roomClients.forEach((client) => {
          // First, let others know about the new user
          if (client.name !== currentUserName) {
            client.ws.send(JSON.stringify({
              type: 'join',
              metadata: message.metadata,
              roomId: message.roomId,
              payload: {
                message: `${message.metadata.name} joined the room`
              }
            }));
          }
          
          // Then send the updated participant list to everyone
          client.ws.send(JSON.stringify({
            type: 'participantList',
            roomId: currentRoomId,
            metadata: { name: 'System', timestamp: Date.now() },
            payload: {
              participants: participantNames
            }
          }));
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
        
        // Broadcast the message to ALL clients in the room
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
      
      // Find and remove this client from the room
      let clientRemoved = false;
      
      if (currentUserName && roomClients.has(currentUserName)) {
        const client = roomClients.get(currentUserName)!;
        if (client.ws === ws) {
          roomClients.delete(currentUserName);
          clientRemoved = true;
        }
      }
      
      // If the client was successfully removed, notify others
      if (clientRemoved && currentUserName) {
        // Get updated participant list
        const participantNames = Array.from(roomClients.keys());
        
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