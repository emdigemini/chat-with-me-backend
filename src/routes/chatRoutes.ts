import express from "express";
import { addNewChat } from "../controller/chatController";

const router = express.Router();

router.post("/new-chat", addNewChat);

export default router;