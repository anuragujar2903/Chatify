import express from "express";
import {
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  sendMessage,
  summarizeChat,
  getSmartReplies,
  getSentiment,
  aiSearchChat,
  generateMeetingNotes,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);
router.post("/summarize/:id", summarizeChat);
router.post("/smart-replies/:id", getSmartReplies);
router.post("/sentiment/:id", getSentiment);
router.post("/ai-search/:id", aiSearchChat);
router.post("/meeting-notes/:id", generateMeetingNotes);

export default router;
