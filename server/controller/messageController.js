import imagekit from "../config/imageKit.js";
import { ai } from "../config/openAi.js";
import Chat from "../models/chat.js";
import User from "../models/user.js";
import axios from "axios";

  //TEXT MESSAGE CONTROLLER (Gemini)
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, prompt } = req.body;

    if (req.user.credits < 1) {
      return res
        .status(403)
        .json({ success: false, message: "Not enough credits" });
    }

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }

    // Save user message
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: new Date(),
      isImage: false,
    });

    // Gemini AI Call
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const reply = {
      role: "assistant",
      content: response.text,
      timestamp: new Date(),
      isImage: false,
    };

    chat.messages.push(reply);
    await chat.save();

    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });

    res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("Gemini Text Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

  //IMAGE GENERATION CONTROLLER
export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { prompt, chatId, isPublished } = req.body;

    if (req.user.credits < 2) {
      return res
        .status(403)
        .json({ success: false, message: "Not enough credits" });
    }

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }

    // Save user prompt
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: new Date(),
      isImage: false,
    });

    const encodedPrompt = encodeURIComponent(prompt);

    // Generate AI image URL from ImageKit
    const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

    const aiImageResponse = await axios.get(generatedImageUrl, {
      responseType: "arraybuffer",
    });

    const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data).toString("base64")}`;

    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "smartgpt",
    });

    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: new Date(),
      isImage: true,
      isPublished,
    };

    chat.messages.push(reply);
    await chat.save();

    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });

    res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("Image Message Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
