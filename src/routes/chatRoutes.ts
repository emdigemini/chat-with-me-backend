import express from "express";
import { addNewChat, getChats } from "../controller/chatController";

const router = express.Router();

router.post("/new-chat", addNewChat);
router.get("/chat-list/:id", getChats);

export default router;