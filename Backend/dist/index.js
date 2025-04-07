"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importStar(require("ws"));
// Create a WebSocket server
const wss = new ws_1.WebSocketServer({ port: 8080 });
// RoomID -> Array of Users
const usersList = new Map();
wss.on("connection", function (socket) {
    console.log("User connected");
    socket.on("message", (message) => {
        var _a;
        try {
            const newMessage = message.toString();
            const parsedMessage = JSON.parse(newMessage);
            console.log(parsedMessage);
            const { type, roomId, metaData, payload } = parsedMessage;
            if (type === "create") {
                if (usersList.has(roomId)) {
                    console.log(`Room ${roomId} already exists.`);
                    return;
                }
                usersList.set(roomId, [{
                        userSocket: socket,
                        name: metaData.name,
                        avatarUrl: metaData.avatarUrl,
                    }]);
                console.log(`Room ${roomId} created and user added.`);
            }
            else if (type === "join") {
                if (!usersList.has(roomId)) {
                    console.log(`Room ${roomId} does not exist.`);
                    return;
                }
                // Enforce 50 user limit
                if (usersList.get(roomId).length >= 50) {
                    console.log(`Room ${roomId} is full.`);
                    return;
                }
                usersList.get(roomId).push({
                    userSocket: socket,
                    name: metaData.name,
                    avatarUrl: metaData.avatarUrl,
                });
                console.log(`User ${metaData.name} joined room ${roomId}`);
            }
            else if (type === "chat") {
                if (!usersList.has(roomId)) {
                    console.log(`Room ${roomId} does not exist.`);
                    return;
                }
                const messageToSend = payload.message;
                (_a = usersList.get(roomId)) === null || _a === void 0 ? void 0 : _a.forEach((user) => {
                    if (user.userSocket.readyState === ws_1.default.OPEN) {
                        user.userSocket.send(JSON.stringify(messageToSend));
                    }
                });
            }
        }
        catch (err) {
            console.error("Invalid message format", err);
        }
    });
    socket.on("close", () => {
        console.log("User disconnected");
        for (const [roomId, sockets] of usersList.entries()) {
            const index = sockets.findIndex((user) => user.userSocket === socket);
            if (index !== -1) {
                sockets.splice(index, 1);
                console.log(`Socket removed from room ${roomId}`);
                if (sockets.length === 0) {
                    usersList.delete(roomId);
                    console.log(`Room ${roomId} deleted`);
                }
            }
        }
    });
});
