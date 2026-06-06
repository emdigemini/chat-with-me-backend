import mongoose from "mongoose";

const verificationEmailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  }
});

const EmailVerification = mongoose.model('EmailVerification', verificationEmailSchema);

export default EmailVerification; 