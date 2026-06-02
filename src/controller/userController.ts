import User from "../models/User";
import bcrypt from "bcryptjs";

export const createAccount = async (req:any, res:any) => {
  try {
    const { email, password }:{ email:string, password:string, gender:string } = req.body

    if (!email.trim() || !password.trim())
      return res.status(400).json({ message: "All fields are required." });

    const existingEmail = await User.findOne({ email });
    
    if (existingEmail) 
      return res.status(409).json({ message: "Email already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ email, password: hashedPassword });

    res.status(201).json({ message: "Account created successfully!" });

  } catch (err) {
    console.log('500 status error', err);
    res.status(500).json({ message: "Internal server error." });
  }
}