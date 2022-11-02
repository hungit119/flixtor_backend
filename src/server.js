require("dotenv").config();
const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const router = require("./routes");
const dotenv = require("dotenv");
const path = require("path");
const db = require("./config/db");
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

var cors = require("cors");
dotenv.config();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
db.connect();
router(app);

io.on("connection", (socket) => {
  console.log("have a new connection");
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
