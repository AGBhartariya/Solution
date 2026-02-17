require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./db");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.set("io", io);

io.on("connection", (socket) => {
  socket.on("join_poll", (pollId) => {
    socket.join(pollId);
  });
});

server.listen(5000, () =>
  console.log("Server running on port 5000")
);

app.use("/api/polls", require("./routes/pollRoutes"));
app.use("/api/vote", require("./routes/voteRoutes"));
