import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import CONNECT_DB from "./src/config/db.ts";
import { chatEventController } from "./src/controller/chatController.ts";
import cookieParser from "cookie-parser";
import userRoutes from "./src/routes/userRoutes.ts";
import chatRoutes from "./src/routes/chatRoutes.ts";
import cookie from "cookie";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors({
  origin: process.env.SERVER_URL?.split(","),
  credentials: true,
}));

// middleware
app.use(express.json());
app.use(cookieParser());

// routes
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.SERVER_URL?.split(","),
    methods: ['GET', 'POST'],
    credentials: true
  },
});

// connect socket to server
io.use((socket, next) => {
  const cookies = socket.handshake.headers.cookie;

 if (!cookies) {
    console.log("NO COOKIES");
    return next(new Error("No cookies"));
  }

  const { token } = cookie.parse(cookies);

  if (!token) return next(new Error('No token, access denied'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; [key: string]: any };
    socket.data.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => chatEventController(io, socket));

// simple health-check endpoint
app.get('/', (_, res) => {
  res.json({ status: 'ok', message: 'server is now running...' });
});

const PORT = Number(process.env.PORT) || 3001;

(async () => {
  try {
    await CONNECT_DB();
    server.listen(PORT, "0.0.0.0", () => {
      console.log('Database connected successfully!');
      console.log(`\n🚀 Chat server running on http://localhost:${PORT}\n`);
    });
  } catch (err) {
    console.log('SERVER FAILED TO START', err);
    process.exit(1);
  }
})();

