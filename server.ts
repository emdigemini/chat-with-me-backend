import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import CONNECT_DB from "./src/config/db.ts";
import { chatEventController } from "./src/controller/chatController.ts";
import userRoutes from "./src/routes/userRoutes.ts";

const app = express();
app.use(cors({
  origin: [
    'https://chat-with-me-alpha.vercel.app',
    'http://localhost:8081',
  ],
  credentials: true,
}));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      'https://chat-with-me-alpha.vercel.app',
      'http://localhost:8081',
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
});

// connect socket to server
io.on('connection', (socket) => chatEventController(io, socket));

// Simple health-check endpoint
app.get('/', (_, res) => {
  res.json({ status: 'ok', message: 'server is now running...' });
});

const PORT = process.env.PORT || 3001;

// routes
app.use('/api/user', userRoutes);

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

