import WebSocket, { WebSocketServer } from "ws";

interface User {
  userSocket: WebSocket;
  name: string;
  avatarUrl: string;
}

const PORT = parseInt(process.env.PORT || "8080" ,10);
const wss = new WebSocketServer({ port: PORT });


const usersList = new Map<string, User[]>();

wss.on("connection", function (socket: WebSocket) {
  console.log("User connected");

  socket.on("message", (message) => {
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

       
        if (usersList.get(roomId)!.length >= 10) {
          console.log(`Room ${roomId} is full.`);
          return;
        }

        usersList.get(roomId)!.push({
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

        usersList.get(roomId)?.forEach((user) => {
          if (user.userSocket.readyState === WebSocket.OPEN) {
            user.userSocket.send(JSON.stringify(messageToSend));
          }
        });
      }

    } catch (err) {
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

