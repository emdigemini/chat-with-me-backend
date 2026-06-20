import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    index: true
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seenBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    required: true,
    default: []
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  unreadCounts: {
    userId: {
      type: String,
      default: ''
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

export default Message;