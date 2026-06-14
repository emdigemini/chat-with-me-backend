import express from "express";
import { addNewChat, getChats, getNewMessages } from "../controller/chatController";

const router = express.Router();

router.post("/new-chat", addNewChat);
router.get("/chat-list/:id", getChats);
router.get("/new-messages", getNewMessages);

export default router;