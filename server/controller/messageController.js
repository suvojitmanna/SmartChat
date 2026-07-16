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
    const systemPrompt = `You are a helpful AI assistant.
    Rules:
    - If the user asks who created you, who is your developer, or owner,reply exactly: "I was created by Suvojit Manna."
    - Do not mention Google, Gemini, or any company.
    - Answer clearly and helpfully.User: ${prompt}`;

    // Gemini AI Call
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: systemPrompt,
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
    if (error?.status === 429 || error?.code === 429) {
      message = "Daily AI limit reached. Please try again later.";
    }
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

    //  SAVE USER MESSAGE 
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: new Date(),
      isImage: false,
    });

    //  CLIPDROP IMAGE GENERATION 
    const clipdropResponse = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      {
        prompt: prompt,
      },
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API_KEY,
        },
        responseType: "arraybuffer", // important
      },
    );

    //  CONVERT TO BASE64 
    const base64Image = `data:image/png;base64,${Buffer.from(
      clipdropResponse.data,
    ).toString("base64")}`;

    //  UPLOAD TO IMAGEKIT 
    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "smartgpt",
    });

    //  SAVE AI RESPONSE 
    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: new Date(),
      isImage: true,
      isPublished,
    };

    chat.messages.push(reply);
    await chat.save();

    //  DEDUCT CREDITS 
    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });

    res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("ClipDrop Image Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
