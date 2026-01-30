const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};

io.on("connection", (socket) => {
  socket.on("join", (username) => {
    users[socket.id] = username;
    io.emit("users", Object.values(users));
    io.emit("message", {
      user: "Sistema",
      text: `${username} entrou no chat`,
      system: true
    });
  });

  socket.on("message", (msg) => {
    io.emit("message", msg);
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    delete users[socket.id];
    io.emit("users", Object.values(users));
    if (username) {
      io.emit("message", {
        user: "Sistema",
        text: `${username} saiu do chat`,
        system: true
      });
    }
  });
});

server.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
