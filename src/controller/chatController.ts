import { Server, Socket  } from "socket.io";

interface Message {
  id: string;
  senderId: string;
  text: string;
  time: string;
}

interface ConnectedUser {
  userId: string;
  chatId: string;
}

const messagesByChat: Record<string, Message[]> = {};
const connectedUsers: Record<string, ConnectedUser> = {};

export const chatEventController = (io: Server, socket: Socket) => {
  console.log(`[+] Socket connected: ${socket.id}`);

  joinChat(socket);
  sendMessage(io, socket);
  isTyping(socket);
  disconnectChat(socket);
}

function joinChat(socket: Socket) {
  socket.on('join_chat', ({ chatId, userId }: { chatId: string, userId: string }) => {
    const prev = connectedUsers[socket.id];
    if (prev?.chatId) {
      socket.leave(prev.chatId);
      console.log(`  User ${prev.userId} left chat ${prev.chatId}`);
    }

    socket.join(chatId);
    connectedUsers[socket.id] = { userId, chatId };
    console.log(`  User ${userId} joined chat ${chatId}`);

    const history = messagesByChat[chatId] || [];
    socket.emit('chat_history', history);
  });
}

function sendMessage(io: Server, socket: Socket) {
  socket.on('send_message', ({ chatId, senderId, text }: { chatId: string, senderId: string, text: string }) => {
    if (!chatId || !senderId || !text?.trim()) return;

    const message = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      senderId,
      text: text.trim(),
      time: new Date().toISOString(),
    };

    if (!messagesByChat[chatId]) messagesByChat[chatId] = [];
    messagesByChat[chatId].push(message);

    console.log(`  [Chat: ${chatId}] ${senderId}: ${text}`);

    io.to(chatId).emit('new_message', message);
  });
}

function isTyping(socket: Socket) {
  socket.on('typing', ({ chatId, userId, isTyping }: { chatId: string, userId: string, isTyping: boolean }) => {
    socket.to(chatId).emit('user_typing', { userId, isTyping });
  });
}

function disconnectChat(socket: Socket) {
  socket.on('disconnect', () => {
    const user = connectedUsers[socket.id];
    if (user) {
      console.log(`[-] User ${user.userId} disconnected from chat ${user.chatId}`);
      delete connectedUsers[socket.id];
    } else {
      console.log(`[-] Socket disconnected: ${socket.id}`);
    }
  });
}