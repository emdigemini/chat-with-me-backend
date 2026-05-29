import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import CONNECT_DB from "./src/config/db.js";
import { chatEventController } from "./src/controller/chatController.js";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// connect socket to server
io.on('connection', (socket) => chatEventController(io, socket));

// Simple health-check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Chat server is running' });
});

const PORT = process.env.PORT || 3001;

(async () => {
  try {
    await CONNECT_DB();
    server.listen(PORT, () => {
      console.log('Database connected successfully!');
      console.log(`\n🚀 Chat server running on http://localhost:${PORT}\n`);
    });
  } catch (err) {
    console.log('SERVER FAILED TO START', err);
    process.exit(1);
  }
})();

