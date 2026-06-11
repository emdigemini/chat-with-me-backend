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
    type: {
      text: { type: String },
      createdAt: { type: Date },
      sentBy: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        default: null
      },
      seenBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
    },
    default: null
  }
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;