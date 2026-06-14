import express from "express";
import { addNewChat, getChats, getLatestMessage } from "../controller/chatController";

const router = express.Router();

router.post("/new-chat", addNewChat);
router.get("/chat-list/:id", getChats);
router.post("/new-messages", getLatestMessage);

export default router;