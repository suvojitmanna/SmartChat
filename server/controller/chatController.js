import Chat from "../models/chat.js";

// API controller for creating a new chat
export const createChat = async (req, res) => {
  try {
    const userId = req.user._id;

    const chat = await Chat.create({
      userId,
      userName: req.user.name,
      name: "New Chat",
      messages: [],
    });

    res.status(201).json({
      success: true,
      message: "Chat created successfully",
    });
  } catch (error) {
    console.error("Create Chat Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create chat",
    });
  }
};

//API Controller for getting all chats

export const getChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.error("Get Chats Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chats",
    });
  }
};

//API Controller for Deletting all chats

export const deleteChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.body;

    await Chat.deleteOne({ _id: chatId, userId });

    res.status(200).json({
      success: true,
      message: "chat Deleted",
    });
  } catch (error) {
    res.json(500).json({
      success: false,
      message: "Failed to fetch chats",
    });
  }
};
