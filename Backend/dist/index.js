"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ noServer: true });
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('🎉 VibeLounge WebSocket Server is running.');
});
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});
const rooms = new Map();
wss.on('connection', (ws) => {
    let currentRoomId = null;
    ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'create' || message.type === 'join') {
            currentRoomId = message.roomId;
            if (!rooms.has(currentRoomId)) {
                rooms.set(currentRoomId, new Set());
            }
            rooms.get(currentRoomId).add(ws);
            rooms.get(currentRoomId).forEach((client) => {
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
            rooms.get(currentRoomId).forEach((client) => {
                if (client.readyState === client.OPEN) {
                    client.send(JSON.stringify(message));
                }
            });
        }
    });
    ws.on('close', () => {
        if (currentRoomId && rooms.has(currentRoomId)) {
            rooms.get(currentRoomId).delete(ws);
            if (rooms.get(currentRoomId).size === 0) {
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
