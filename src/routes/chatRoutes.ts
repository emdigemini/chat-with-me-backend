import express from "express";
import { getChats, getLatestMessage } from "../controller/chatController";

const router = express.Router();

router.get("/chat-list/:id", getChats);
router.post("/new-messages", getLatestMessage);

export default router;