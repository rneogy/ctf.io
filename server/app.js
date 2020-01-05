require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const randomColor = require("randomcolor");

const publicPath = path.resolve(__dirname, "..", "build");

app.use(express.static(publicPath));

const port = process.env.PORT || 3000;

http.listen(port, () => {
  console.log(`Listening on port ${port} and looking in folder ${publicPath}`);
});

const width = 800;
const height = 800;
const radius = 20;

const maxSpeedPixelsPerSecond = 300;
const speed = maxSpeedPixelsPerSecond / 1000; // pixels per millisecond
const accelPixelsPerSecond = 300; // take one second to get to full speed
const accel = accelPixelsPerSecond / 1000;
const friction = 0.8;

const state = {
  players: {}
};

io.on("connection", socket => {
  console.log(`${socket.id} connected!`);

  const x = Math.floor(Math.random() * width);
  const y = Math.floor(Math.random() * height);
  const velocity = { x: 0, y: 0 };
  const accel = { x: 0, y: 0 };
  const lastUpdate = Date.now();
  const color = randomColor({ luminosity: "light" });

  state.players[socket.id] = { x, y, velocity, accel, lastUpdate, color };

  const player = state.players[socket.id];

  socket.on("move", movement => {
    player.accel = {
      x: player.accel.x + (movement.x || 0),
      y: player.accel.y + (movement.y || 0)
    };
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`);
    delete state.players[socket.id];
  });
});

const clamp = (x, min, max) => Math.max(Math.min(x, max), min);
const clampX = x => clamp(x, radius, width - radius);
const clampY = x => clamp(x, radius, height - radius);

setInterval(() => {
  for (const id in state.players) {
    const player = state.players[id];
    const now = Date.now();
    const dt = now - player.lastUpdate;
    player.velocity.x = clamp(
      player.velocity.x * friction + accel * player.accel.x * dt,
      -speed,
      speed
    );

    player.velocity.y = clamp(
      player.velocity.y * friction + accel * player.accel.y * dt,
      -speed,
      speed
    );

    player.x = clampX(player.x + player.velocity.x * dt);
    player.y = clampY(player.y + player.velocity.y * dt);
    player.lastUpdate = now;
  }
  io.emit("updateState", state.players);
}, 1000 / 60);
