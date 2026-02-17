require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./db");

const app = express();
connectDB();

/* ===============================
   ALLOWED ORIGINS
================================ */
const allowedOrigins = [
  "http://localhost:5173", // local frontend
  "https://solution-sand.vercel.app/" // <-- change after deploy
];

/* ===============================
   EXPRESS CORS
================================ */
app.use(
  cors({
    origin: function (origin, callback) {
      // allow REST tools or server-to-server calls
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(
          new Error("CORS not allowed"),
          false
        );
      }

      return callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true
  })
);

app.use(express.json());

/* ===============================
   HTTP SERVER
================================ */
const server = http.createServer(app);

/* ===============================
   SOCKET.IO CORS
================================ */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

/* ===============================
   SOCKET CONNECTION
================================ */
io.on("connection", (socket) => {
  socket.on("join_poll", (pollId) => {
    socket.join(pollId);
  });
});

/* ===============================
   ROUTES
================================ */
app.use("/api/polls", require("./routes/pollRoutes"));
app.use("/api/vote", require("./routes/voteRoutes"));

/* ===============================
   SERVER START
================================ */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
