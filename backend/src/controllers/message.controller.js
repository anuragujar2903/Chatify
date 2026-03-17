import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Groq from "groq-sdk";
import { ENV } from "../lib/env.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
    }
    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl;
    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // find all the messages where the logged-in user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const summarizeChat = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: otherUserId } = req.params;

    // Fetch messages between the two users
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    if (messages.length < 3) {
      return res.status(400).json({ message: "Not enough messages to summarize (need at least 3)." });
    }

    // Format the conversation as a readable transcript (text only)
    const transcript = messages
      .filter((m) => m.text) // only text messages
      .map((m) => {
        const role = m.senderId.toString() === myId.toString() ? "You" : "Partner";
        return `${role}: ${m.text}`;
      })
      .join("\n");

    if (!transcript.trim()) {
      return res.status(400).json({ message: "No text messages found to summarize." });
    }

    // Call Groq API
    const groq = new Groq({ apiKey: ENV.GROQ_API_KEY });
    const language = req.body.language || "English";

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant. Summarize chat conversations in 4-6 concise bullet points in ${language}. Focus on key topics, decisions, and action items. Format your response ONLY as bullet points starting with "•".`,
        },
        {
          role: "user",
          content: `Summarize this conversation:\n\n${transcript}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 512,
    });

    const summary = completion.choices[0].message.content;

    res.status(200).json({ summary });
  } catch (error) {
    console.error("Error in summarizeChat controller:", error.message);

    if (error.message?.includes("429") || error.message?.includes("rate")) {
      return res.status(429).json({
        message: "AI rate limit reached. Please wait a moment and try again.",
      });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSmartReplies = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
    }).sort({ createdAt: -1 }).limit(5);

    if (messages.length === 0) {
      return res.status(200).json({ replies: ["Hi!", "Hello!", "Hey there!"] });
    }

    const transcript = messages.reverse().map((m) => {
      const role = m.senderId.toString() === myId.toString() ? "You" : "Partner";
      return `${role}: ${m.text || "[image]"}`;
    }).join("\n");

    const groq = new Groq({ apiKey: ENV.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: 'Generate exactly 3 short, natural reply suggestions for the last message in the conversation. Each reply should be 2-6 words max. Return ONLY a JSON array of 3 strings, nothing else. Example: ["Sounds good!", "Let me check", "Sure, no problem"]',
        },
        { role: "user", content: transcript },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    let replies;
    try {
      const raw = completion.choices[0].message.content.trim();
      replies = JSON.parse(raw);
      if (!Array.isArray(replies)) throw new Error("not array");
      replies = replies.slice(0, 3);
    } catch {
      replies = ["Got it!", "Okay 👍", "Sure!"];
    }

    res.status(200).json({ replies });
  } catch (error) {
    console.error("Error in getSmartReplies:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSentiment = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
    }).sort({ createdAt: -1 }).limit(10);

    if (messages.length < 2) {
      return res.status(200).json({ emoji: "💬", label: "Just getting started", mood: "neutral" });
    }

    const transcript = messages.reverse()
      .filter((m) => m.text)
      .map((m) => m.text)
      .join("\n");

    const groq = new Groq({ apiKey: ENV.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: 'Analyze the sentiment/mood of this chat conversation. Return ONLY a JSON object with exactly these fields: {"emoji": "<single emoji>", "label": "<2-4 word mood description>", "mood": "<one of: positive, negative, neutral, heated, excited, sad>"}. Examples: {"emoji":"😊","label":"Friendly and warm","mood":"positive"}, {"emoji":"🔥","label":"Getting heated","mood":"heated"}',
        },
        { role: "user", content: transcript },
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    let sentiment;
    try {
      const raw = completion.choices[0].message.content.trim();
      sentiment = JSON.parse(raw);
    } catch {
      sentiment = { emoji: "💬", label: "Casual chat", mood: "neutral" };
    }

    res.status(200).json(sentiment);
  } catch (error) {
    console.error("Error in getSentiment:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const aiSearchChat = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: otherUserId } = req.params;
    const { query } = req.body;

    if (!query?.trim()) {
      return res.status(400).json({ message: "Please provide a search query." });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    if (messages.length === 0) {
      return res.status(200).json({ answer: "No messages found in this conversation." });
    }

    const transcript = messages
      .filter((m) => m.text)
      .map((m) => {
        const role = m.senderId.toString() === myId.toString() ? "You" : "Partner";
        const date = new Date(m.createdAt).toLocaleString();
        return `[${date}] ${role}: ${m.text}`;
      })
      .join("\n");

    const groq = new Groq({ apiKey: ENV.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that searches through a chat conversation to answer the user's question. Be concise and specific. If the answer isn't in the conversation, say so. Include relevant timestamps when possible.",
        },
        {
          role: "user",
          content: `Chat history:\n${transcript}\n\nQuestion: ${query}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const answer = completion.choices[0].message.content;
    res.status(200).json({ answer });
  } catch (error) {
    console.error("Error in aiSearchChat:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const generateMeetingNotes = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    if (messages.length < 3) {
      return res.status(400).json({ message: "Need at least 3 messages to generate meeting notes." });
    }

    const myUser = await User.findById(myId).select("fullName");
    const otherUser = await User.findById(otherUserId).select("fullName");

    const transcript = messages
      .filter((m) => m.text)
      .map((m) => {
        const name = m.senderId.toString() === myId.toString() ? myUser.fullName : otherUser.fullName;
        const date = new Date(m.createdAt).toLocaleString();
        return `[${date}] ${name}: ${m.text}`;
      })
      .join("\n");

    const language = req.body.language || "English";
    const groq = new Groq({ apiKey: ENV.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are a professional meeting minutes assistant. Analyze the chat conversation and generate structured meeting notes in ${language}. Return ONLY a valid JSON object with this exact structure:
{
  "title": "Brief meeting title",
  "date": "Date range of the conversation",
  "participants": ["Name1", "Name2"],
  "agenda": ["Topic 1 discussed", "Topic 2 discussed", "Topic 3 discussed"],
  "decisions": ["Decision 1 made", "Decision 2 made"],
  "actionItems": [{"person": "Name", "task": "What they need to do", "priority": "high/medium/low"}],
  "keyHighlights": ["Important highlight 1", "Important highlight 2"]
}
If something is not clear from the conversation, make reasonable inferences. Always include at least 2 items in each array.`,
        },
        {
          role: "user",
          content: `Generate meeting notes from this conversation:\n\n${transcript}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    let notes;
    try {
      const raw = completion.choices[0].message.content.trim();
      // Extract JSON from markdown code fences if present
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
      notes = JSON.parse(jsonMatch[1].trim());
    } catch {
      notes = {
        title: "Meeting Notes",
        date: new Date().toLocaleDateString(),
        participants: [myUser.fullName, otherUser.fullName],
        agenda: ["General discussion"],
        decisions: ["No specific decisions captured"],
        actionItems: [{ person: "Team", task: "Review conversation", priority: "medium" }],
        keyHighlights: ["Conversation took place"],
      };
    }

    // Ensure participants are always included
    notes.participants = notes.participants || [myUser.fullName, otherUser.fullName];

    res.status(200).json({ notes });
  } catch (error) {
    console.error("Error in generateMeetingNotes:", error.message);
    if (error.message?.includes("429") || error.message?.includes("rate")) {
      return res.status(429).json({ message: "AI rate limit reached. Please wait and try again." });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};
