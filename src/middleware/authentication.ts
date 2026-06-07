import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const authentication = async (req: Request, res: Response, next: NextFunction) => {
  let token = req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

  if(!token)
    return res.status(401).json({ message: "No token, access denied." });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({message: "Invalid token"});
  }
}

export default authentication;