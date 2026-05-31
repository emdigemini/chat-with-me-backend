import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  ],
  lastMessage: {
    text: { type: String },
    senderId: { type: String },
    createdAt: { type: Date },
    default: null
  }
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;