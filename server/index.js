const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const HistoryManager = require("./history");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Serve static files from Client/dist
const distPath = path.join(__dirname, "../Client/dist");
console.log("Serving static files from:", distPath);
app.use(express.static(distPath));

const history = new HistoryManager();
const colors = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6"];
const roomUsers = {}; // Track users by room

io.on("connection", socket => {
  console.log("User connected:", socket.id);

  socket.on("JOIN_ROOM", ({ roomId, userName }) => {
    console.log(`User ${socket.id} (${userName}) joining room ${roomId}`);
    socket.join(roomId);
    history.createRoom(roomId);

    if (!roomUsers[roomId]) roomUsers[roomId] = [];

    const color = colors[Math.floor(Math.random() * colors.length)];
    socket.userData = { id: socket.id, name: userName, color };
    roomUsers[roomId].push(socket.userData);

    console.log(`Room ${roomId} now has ${roomUsers[roomId].length} users:`, roomUsers[roomId].map(u => u.name));

    // send existing users to this user
    roomUsers[roomId].forEach(user => {
      if (user.id !== socket.id) {
        console.log(`Sending existing user ${user.name} to new user ${userName}`);
        socket.emit("USER_JOIN", user);
      }
    });

    // send this user to others
    console.log(`Broadcasting new user ${userName} to room ${roomId}`);
    socket.to(roomId).emit("USER_JOIN", socket.userData);

    socket.emit("SYNC_STATE", history.getAll(roomId));
  });


socket.on("disconnect", () => {
  if (socket.userData) {
    // Find the room the user was in
    for (const roomId in roomUsers) {
      roomUsers[roomId] = roomUsers[roomId].filter(u => u.id !== socket.id);
      if (roomUsers[roomId].length === 0) delete roomUsers[roomId];
      io.to(roomId).emit("USER_LEAVE", socket.userData);
    }
  }
});


  socket.on("STROKE_START", ({ roomId, stroke }) => {
    console.log("STROKE_START received:", { roomId, strokeId: stroke.id });
    history.addStroke(roomId, stroke);
    socket.to(roomId).emit("REMOTE_STROKE_START", stroke);
  });

  socket.on("STROKE_UPDATE", ({ roomId, strokeId, points }) => {
    console.log("STROKE_UPDATE received:", { roomId, strokeId, pointsCount: points.length });
    history.appendPoints(roomId, strokeId, points);
    socket.to(roomId).emit("REMOTE_STROKE_UPDATE", { strokeId, points });
  });

  socket.on("STROKE_END", ({ roomId, strokeId }) => {
    console.log("STROKE_END received:", { roomId, strokeId });
    socket.to(roomId).emit("REMOTE_STROKE_END", { strokeId });
  });

  socket.on("UNDO", ({ roomId }) => {
    console.log("UNDO received for room:", roomId, "Total strokes:", history.rooms[roomId]?.strokes.length || 0);
    history.undo(roomId);
    const visible = history.getVisible(roomId);
    console.log("After undo, visible strokes:", visible.length);
    io.to(roomId).emit("SYNC_STATE", visible);
  });

socket.on("REDO", ({ roomId }) => {
  console.log("REDO received for room:", roomId, "Total strokes:", history.rooms[roomId]?.strokes.length || 0);
  history.redo(roomId);
  const visible = history.getVisible(roomId);
  console.log("After redo, visible strokes:", visible.length);
  io.to(roomId).emit("SYNC_STATE", visible);
});

socket.on("CLEAR_ALL", ({ roomId }) => {
  history.clearRoom(roomId);
  io.to(roomId).emit("CLEAR_ALL");
});

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Serve index.html for all routes (SPA fallback)
app.use((req, res) => {
  const indexPath = path.join(distPath, "index.html");
  res.sendFile(indexPath);
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

