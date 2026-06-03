import { generateCode } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import VerificationCode from "../models/VerificationCode.js";
import sendVerificationCode from "../lib/nodemailer.ts";

export const createAccount = async (req:any, res:any) => {
  try {
    const { email, password }:{ email:string, password:string } = req.body
    const status = 'create';

    if (!email.trim() || !password.trim())
      return res.status(400).json({ message: "All fields are required." });

    const existingEmail = await User.findOne({ email });
    
    if (existingEmail) 
      return res.status(409).json({ message: "Email already exists." });

    const verificationCode = generateCode();
    const expiresAt = new Date(Date.now() + 90 * 1000);
    await VerificationCode.findOneAndUpdate(
      { email },
      { code: verificationCode, expiresAt },
      { upsert: true, returnDocument: "after" }
    );
    sendVerificationCode(status, email, verificationCode);

    res.json({ 
      message: 'Verification code sent to your email. It will expire in 90 seconds.',
      verify: {
        email,
        password
      }
    });
  } catch (err) {
    console.log('500 status error', err);
    res.status(500).json({ message: "Account creation failed, Internal server error." });
  }
}

export const confirmVerificationCode = async (req: any, res: any) => {
  try {
    const { email, password, verificationCode }:{ email:string, password:string, verificationCode:string } = req.body;

    if (!email.trim() || !password.trim())
      return res.status(400).json({ message: "All fields are required." });

    const existingEmail = await User.findOne({ email });
    
    if (existingEmail) 
      return res.status(409).json({ message: "Email already exists." });

    const verified = await VerificationCode.findOne({ email, code: verificationCode });

    if (!verified)
      return res.status(401).json({ message: "Invalid verification code." });

    if (new Date() > verified.expiresAt)
      return res.status(400).json({ message: "Verification code has expired." });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ email, password: hashedPassword });

    res.status(201).json({ message: "Account created successfully!" });
  } catch (err) {
    console.log('500 status error', err);
    res.status(500).json({ message: "Internal server error." });
  }
}