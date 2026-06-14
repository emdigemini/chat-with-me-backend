import { Server, Socket  } from "socket.io";
import { Request, Response } from "express";
import { messageRateLimit } from "../config/upstash";
import User from "../models/User";
import Chat from "../models/Chat";
import Message from "../models/Message";

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

const connectedUsers: Record<string, ConnectedUser> = {};

export const chatEventController = (io: Server, socket: Socket) => {
  console.log(`[+] Socket connected: ${socket.id}`);

  joinChat(socket);
  messagesSeen(io, socket);
  loadMoreMessages(socket);
  sendMessage(io, socket);
  isTyping(socket);
  disconnectChat(socket);
}

function joinChat(socket: Socket) {
  socket.on('join_chat', async ({ chatId, seenId }: { chatId: string, seenId: string }) => {
    try {
      const userId = socket.data.userId;
      const hasAccessToChat = await Chat.findOne({
        _id: chatId,
        participants: userId
      });

      if (!hasAccessToChat) {
        socket.emit("error", {
          message: "You do not have access to this chat."
        });
        return;
      }

      const prev = connectedUsers[socket.id];

      if (prev?.chatId) {
        socket.leave(prev.chatId);
        console.log(`  User ${prev.userId} left chat ${prev.chatId}`);
      }

      socket.join(chatId);
      connectedUsers[socket.id] = { userId, chatId };
      // console.log(`  User ${userId} joined chat ${chatId}`);

      const msgDoc = await Message.find({ chatId })
        .sort({ createdAt: -1 }).limit(20).lean();

      const history = msgDoc.reverse().map(m => {
        return {
          id: m._id,
          chatId: m.chatId,
          senderId: m.senderId,
          seenBy: m.seenBy,
          message: m.message,
          time: m.createdAt
        }
      });

      socket.emit('chat_history', history);
    } catch (err) {
      console.error('Error connecting to a chat:', err);
      socket.emit('error_chat', { message: 'Failed to connect with chat' });
    }
  });
}

function messagesSeen(io: Server, socket: Socket) {
  socket.on("messages_seen", async ({ chatId }: { chatId: string }) => {
    const userId = socket.data.userId;
    console.log(userId)
    await Message.updateMany(
      {
        chatId,
        senderId: { $ne: userId }
      }, {
        $addToSet: { seenBy: userId }
      }
    );
    
    io.to(chatId).emit('messages_seen', { chatId, userId });
  })
}

function loadMoreMessages(socket: Socket) {
  socket.on('load_more_messages', async ({ chatId, before }: { chatId: string; before: string }) => {
    try {
      const userId = socket.data.userId;

      const hasAccessToChat = await Chat.findOne({
        _id: chatId,
        participants: userId
      });

      if (!hasAccessToChat) {
        socket.emit("error", { message: "You do not have access to this chat." });
        return;
      }

      const msgDoc = await Message.find({
        chatId,
        createdAt: { $lt: new Date(before) }
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      const history = msgDoc.reverse().map(m => ({
        id: m._id.toString(),
        chatId: m.chatId,
        senderId: m.senderId,
        seenBy: m.seenBy,
        message: m.message,
        time: m.createdAt
      }));

      socket.emit('more_messages', {
        messages: history,
        hasMore: msgDoc.length === 10
      });
    } catch (err) {
      console.error('Error loading more messages:', err);
      socket.emit('error_message', { message: 'Failed to load more messages' });
    }
  });
}

function sendMessage(io: Server, socket: Socket) {
  socket.on('send_message', async ({ chatId, text }: { chatId: string, text: string }) => {
    const senderId = socket.data.userId;
    if (!chatId || !senderId || !text?.trim()) {
      socket.emit('error_message', { message: 'Invalid message data' });
      return;
    }

    try {
      const { success, reset } = await messageRateLimit.limit(`${senderId},${chatId}`);

      if (!success) {
        const seconds = Math.ceil((reset - Date.now()) / 1000);

        socket.emit("error_message", {
          message: `You're sending messages too quickly. Try again in ${seconds}s.`,
        });

        return;
      }

      const msgDoc = await Message.create({
        chatId, senderId, message: text.trim()
      });

      const chatDocs = await Chat.findByIdAndUpdate(chatId, {
        lastMessage: {
          text: msgDoc.message,
          sentBy: msgDoc.senderId,
        }
      }, { new: true })
      .populate("participants", "_id name")
      .populate("lastMessage.sentBy", "_id name")
      .populate("lastMessage.seenBy", "_id name");

      let chats;
      if (chatDocs) {
        chats = {
          id: chatDocs._id.toString(),
          chatId: chatDocs.chatId,
          participants: chatDocs.participants,
          lastMessage: chatDocs.lastMessage
        }
      }

      const message = {
        id: msgDoc._id,
        chatId: msgDoc.chatId,
        senderId: msgDoc.senderId,
        seenBy: msgDoc.seenBy,
        message: msgDoc.message,
        time: msgDoc.createdAt
      };

      console.log(`[Chat: ${chatId}] ${senderId}: ${text}`);

      io.to(chatId).emit('new_message', { message, chats });
    } catch (err) {
      console.error('Error sending message:', err);
      socket.emit('error_message', { message: 'Failed to send message' });
    }
  });
}

function isTyping(socket: Socket) {
  socket.on('typing', ({ chatId, isTyping }: { chatId: string, isTyping: boolean }) => {
    const userId = socket.data.userId;
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

export async function getNewMessages(req: Request, res: Response) {
  try {
    const id = req.query['[id]'] as string[];

    console.log(req.query)

    const newMsgDocs = await Message.find({
      chatId: { $in: id },
      seenBy: []
    });

    const messages = newMsgDocs.map((m) => {
      return {
        id: m._id.toString(),
        chatId: m.chatId,
        senderId: m.senderId,
        seenBy: m.seenBy,
        message: m.message,
        time: m.createdAt
      }
    });
    
    res.status(200).json({ messages });
  } catch (err) {
    console.log('Error in getNewMessages controller', err);
    res.status(500).json({ message: "Internal server error." });
  }
}


// __________________________________________________________________
// create new chat and fetch all chats_______________________________
// __________________________________________________________________
export const getChats = async (req: Request, res: Response) => {
  try {
    const { id } = req.body as { id: string };

    const chatDocs = await Chat.find({ participants: id })
      .populate("participants", "_id name")
      .populate("lastMessage.sentBy", "_id name")
      .populate("lastMessage.seenBy", "_id name");

    res.status(200).json({
      chats: chatDocs.map(chat => ({
        id: chat._id.toString(),
        chatId: chat.chatId,
        participants: chat.participants,
        lastMessage: chat.lastMessage
      }))
    })
  } catch (err) { 
    console.log('Error in getChats controller', err);
    res.status(500).json({ message: "Internal server error." });
  }
}

export const addNewChat = async (req: Request, res: Response) => {
  try {
    const { hostId, guestId }: { hostId: string, guestId: string } = req.body;

    if (!hostId?.trim() || !guestId?.trim()) 
      return res.status(400).json({ message: "Please provide a valid invite ID." });

    if (hostId === guestId)
      return res.status(400).json({
        message: "You cannot create a conversation with yourself."
      });

    const isHostExists = await User.findById(hostId);
    const isGuestExists = await User.findById(guestId);

    if (!isHostExists) 
      return res.status(404).json({ message: "No user found with the provided invite ID." });

    if (!isGuestExists) 
      return res.status(404).json({ message: "Cannot connect to the host. Your user ID is invalid." });

    const participants = [hostId, guestId];
    const chatId = participants.sort().join("_");

    const isChatExists = await Chat.findOne({ chatId })
      .populate("participants", "_id name");

    if (isChatExists)
      return res.status(409).json({ 
        message: "You already have an existing conversation with this user.",
        chat: {
          id: isChatExists?._id.toString(),
          chatId: isChatExists?.chatId,
          participants: isChatExists?.participants,
          lastMessage: isChatExists?.lastMessage
        }
      });

    const newChat = await Chat.create({ chatId, participants })

    const chatDoc = await Chat.findById(newChat._id)
      .populate("participants", "_id name");

    res.status(201).json({
      chat: {
        id: chatDoc?._id.toString(),
        chatId: chatDoc?.chatId,
        participants: chatDoc?.participants,
        lastMessage: chatDoc?.lastMessage
      }
    });
  } catch (err) {
    console.log('Error in addNewChat controller', err);
    res.status(500).json({ message: "Failed to connect with host, internal server error." });
  }
}

