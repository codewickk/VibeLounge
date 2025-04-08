import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer:true });

app.use(cors());
app.use(express.json());

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

const rooms = new Map<string, Set<any>>();

wss.on('connection', (ws) => {
  let currentRoomId: string | null = null;

  ws.on('message', (data) => {
    const message: ClientMessage = JSON.parse(data.toString());

    if (message.type === 'create' || message.type === 'join') {
      currentRoomId = message.roomId;

      if (!rooms.has(currentRoomId)) {
        rooms.set(currentRoomId, new Set());
      }

      rooms.get(currentRoomId)!.add(ws);


      rooms.get(currentRoomId)!.forEach((client) => {
        if (client !== ws && client.readyState === client.OPEN) {
          client.send(JSON.stringify({
            type: 'join',
            metadata: message.metadata,
            roomId: message.roomId,
            payload: {
              message: `${message.metadata.name} joined the room`,
            }
          }));
        }
      });
    }

    if (message.type === 'chat' && currentRoomId && rooms.has(currentRoomId)) {
      rooms.get(currentRoomId)!.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    }
  });

  ws.on('close', () => {
    if (currentRoomId && rooms.has(currentRoomId)) {
      rooms.get(currentRoomId)!.delete(ws);
      if (rooms.get(currentRoomId)!.size === 0) {
        rooms.delete(currentRoomId);
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
