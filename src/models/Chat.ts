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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    text: {
      type: String,
      default: ''
    }
  }
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;