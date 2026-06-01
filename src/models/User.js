import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/dwelbkkok/image/upload/v1780199136/default-avatar-blue.jpg'
  },
  name: {
    type: String,
    default: `user_${Date.now()}`
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: '',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@gmail\.com$/, 'Please enter a valid gmail address'],
  },
  chatIDs: {
    type: [String],
    default: []
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User