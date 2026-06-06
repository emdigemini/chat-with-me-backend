import { generateCode } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import EmailVerification from "../models/EmailVerification.js";
import sendVerificationCode from "../lib/nodemailer.ts";

export const verifyEmail = async (req:any, res:any) => {
  try {
    const { email }:{ email:string } = req.body
    const status = 'create';
    console.log(email)

    if (!email || !email.trim())
      return res.status(400).json({ message: "All fields are required." });

    if (!email.toLocaleLowerCase().trim().endsWith("@gmail.com"))
      return res.status(400).json({ message: "Invalid email. Please use a Gmail address (@gmail.com)." });

    const existingEmail = await User.findOne({ email });
    
    if (existingEmail) 
      return res.status(409).json({ message: "Email already exists." });

    const verificationCode = generateCode();
    const expiresAt = new Date(Date.now() + 90 * 1000);
    await EmailVerification.findOneAndUpdate(
      { email },
      { code: verificationCode, expiresAt },
      { upsert: true, returnDocument: "after" }
    );
    sendVerificationCode(status, email, verificationCode);

    res.json({ 
      message: 'Verification code sent to your email. It will expire in 90 seconds.',
      verify: {
        email,
        expiresAt
      }
    });
  } catch (err) {
    console.log('Error in verifyEmail controller', err);
    res.status(500).json({ message: "Email verification failed, Internal server error." });
  }
}

export const confirmEmailVerification = async (req: any, res: any) => {
  try {
    const { email, verificationCode }:{ email:string, verificationCode:string } = req.body;

    if (!email.trim())
      return res.status(400).json({ message: "Empty email address, cannot proceed." });

    if (!verificationCode.trim())
      return res.status(400).json({ message: "Verification code cannot be empty." });
    
    const verified = await EmailVerification.findOne({ email, code: verificationCode });
    if (!verified)
      return res.status(401).json({ message: "Invalid verification code." });

    await EmailVerification.findOneAndUpdate({ email, verified: true }, { returnDocument: 'return' });

    if (new Date() > verified.expiresAt)
      return res.status(400).json({ message: "Verification code has expired." });

    res.status(200).json({ message: "Email has been verified successfully." });
  } catch (err) {
    console.log('Error in confirmEmailVerification controller', err);
    res.status(500).json({ message: "Verification failed, Internal server error." });
  }
}

export const createAccount = async (req: any, res: any) => {
  try {
    const { email, password, verificationCode }:{ email:string, password:string, verificationCode:string } = req.body;

    if (!email.trim() || !password.trim())
      return res.status(400).json({ message: "All fields are required." });

    const existingEmail = await User.findOne({ email });
    
    if (existingEmail) 
      return res.status(409).json({ message: "Email already exists." });

    const verified = await EmailVerification.findOne({ email, code: verificationCode });

    if (!verified)
      return res.status(401).json({ message: "Invalid verification code." });

    if (new Date() > verified.expiresAt)
      return res.status(400).json({ message: "Verification code has expired." });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ email, password: hashedPassword });

    res.status(201).json({ message: "Account created successfully!" });
  } catch (err) {
    console.log('Error in createAccount controller', err);
    res.status(500).json({ message: "Account creation failed, Internal server error." });
  }
}

export const loginAccount = async (req: any, res: any) => {
  try {
    const { email, password }:{ email: string, password: string } = req.body;

    if (!email.trim() || !password.trim())
      return res.status(400).json({ message: "All fields are required." });

    const user = await User.findOne({ email });

    if (!user) 
      return res.status(401).json({
        message: "Failed to login, invalid account."
      });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({
        message: "Failed to login, incorrect password."
      });

    res.status(200).json({
      message: "Login Successfully!",
      user
    });

  } catch (err) {
    console.log('Error in loginAccount controller', err);
    res.status(500).json({ message: "Error login, internal server error." });
  }
}