import React, { useEffect, useRef, useState } from "react";
import { useAppcontext } from "../context/Appcontext";
import { assets } from "../assets/assets";
import Message from "./Message";
import toast from "react-hot-toast";

const ChatBox = () => {
  const containerRef = useRef(null);
  const controllerRef = useRef(null);

  const { selectedChat, setSelectedChat, theme, user, axios, token, setUser } =
    useAppcontext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isPublished, setIsPublished] = useState(false);

  // ✅ STOP FUNCTION
  const handleStop = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    setLoading(false);
    toast("Generation stopped");
  };

  const onSubmit = async (e) => {
    try {
      e.preventDefault();

      if (loading) return;
      if (!user) return toast("Login to send message");
      if (!selectedChat?._id) return toast.error("No chat selected");

      setLoading(true);

      const promptCopy = prompt;
      setPrompt("");

      // Add user message instantly
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: promptCopy,
          timestamp: Date.now(),
          isImage: false,
        },
      ]);

      // ✅ Create AbortController
      controllerRef.current = new AbortController();

      const { data } = await axios.post(
        `/api/message/${mode}`,
        { chatId: selectedChat._id, prompt: promptCopy, isPublished },
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: controllerRef.current.signal,
        },
      );

      if (data.success) {
        const newReply = { ...data.reply, isNew: true };

        setMessages((prev) => [...prev, newReply]);

        setSelectedChat((prev) => ({
          ...prev,
          messages: [...(prev.messages || []), newReply],
        }));

        setUser((prev) => ({
          ...prev,
          credits: prev.credits - (mode === "image" ? 5 : 1),
        }));
      } else {
        toast.error(data.message);
        setPrompt(promptCopy);
      }
    } catch (error) {
      if (error.name === "CanceledError") {
        console.log("Request cancelled");
      } else {
        toast.error(error.response?.data?.message || error.message);
      }
    } finally {
      setLoading(false);
      controllerRef.current = null;
    }
  };

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages || []);
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40">
      {/* Chat Messages */}
      <div
        ref={containerRef}
        className="flex-1 mb-5 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-600 dark:scrollbar-thumb-purple-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-purple-500"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <img
              src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
              className="w-full max-w-56 sm:max-w-68 opacity-90"
              alt="Logo"
            />
            <p className="mt-6 text-4xl sm:text-6xl font-bold bg-gradient-to-r from-gray-600 to-gray-400 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Ask Me Anything.
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}

        {loading && (
          <div className="flex items-center gap-2 justify-center py-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
            <div
              className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        )}
      </div>

      {/* Publish Option */}
      {mode === "image" && (
        <label className="inline-flex items-center gap-2 mb-3 text-sm mx-auto cursor-pointer">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Publish Generated Image to Community
          </p>
          <input
            type="checkbox"
            className="w-4 h-4 accent-indigo-600"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
        </label>
      )}

      {/* Input */}
      <form
        onSubmit={onSubmit}
        className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border rounded-full w-full max-w-2xl p-3 pl-5 mx-auto flex gap-3 items-center shadow-lg"
      >
        <select
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          className="text-sm outline-none bg-transparent"
        >
          <option value="text">Text</option>
          <option value="image">Image</option>
        </select>

        <div className="h-5 w-px bg-gray-300 opacity-50"></div>

        <input
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          type="text"
          placeholder="Type your prompt here.."
          className="flex-1 text-sm outline-none bg-transparent"
          required
        />

        <button
          type={loading ? "button" : "submit"}
          onClick={loading ? handleStop : undefined}
          disabled={!loading && !prompt}
          className="hover:scale-110 active:scale-95 transition-transform duration-150 disabled:opacity-50"
        >
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            className="w-7 cursor-pointer"
            alt="action"
          />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
