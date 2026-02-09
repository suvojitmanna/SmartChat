import React, { useEffect, useRef, useState } from "react";
import { useAppcontext } from "../context/Appcontext";
import { assets } from "../assets/assets";
import Message from "./Message";
import toast from "react-hot-toast";

const ChatBox = () => {
  const containerRef = useRef(null);

  const { selectedChat, setSelectedChat, theme, user, axios, token, setUser } =
    useAppcontext();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isPublished, setIsPublished] = useState(false);

  const onSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!user) return toast("Login to send message");
      if (!selectedChat?._id) return toast.error("No chat selected");

      setLoading(true);
      const promptCopy = prompt;
      setPrompt("");

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: promptCopy,
          timestamp: Date.now(),
          isImage: false,
        },
      ]);

      const { data } = await axios.post(
        `/api/message/${mode}`,
        { chatId: selectedChat._id, prompt: promptCopy, isPublished },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (data.success) {
        setMessages((prev) => [...prev, data.reply]);

        // keep chat synced for refresh
        setSelectedChat((prev) => ({
          ...prev,
          messages: [
            ...(prev.messages || []),
            {
              role: "user",
              content: promptCopy,
              timestamp: Date.now(),
              isImage: false,
            },
            data.reply,
          ],
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
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
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
              className="w-full max-w-56 sm:max-w-68 opacity-90 hover:opacity-100 transition-opacity duration-300"
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

        {/* Three Dots Loading */}
        {loading && (
          <div className="loader flex items-center gap-2 justify-center py-2">
            <div
              className="w-2 h-2 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500 animate-bounce"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="w-2 h-2 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500 animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500 animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        )}
      </div>

      {mode === "image" && (
        <label className="inline-flex items-center gap-2 mb-3 text-sm mx-auto cursor-pointer group">
          <p className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
            Publish Generated Image to Community{" "}
          </p>
          <input
            type="checkbox"
            className="cursor-pointer accent-indigo-600 dark:accent-purple-600 w-4 h-4"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
        </label>
      )}

      {/* Prompt Input Box */}
      <form
        onSubmit={onSubmit}
        className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-purple-950/40 dark:to-indigo-950/40 border border-indigo-300/30 dark:border-purple-500/30 hover:border-indigo-400/50 dark:hover:border-purple-500/50 focus-within:border-indigo-500/50 dark:focus-within:border-purple-500/50 rounded-full w-full max-w-2xl p-3 pl-5 mx-auto flex gap-3 items-center shadow-lg hover:shadow-indigo-500/20 dark:hover:shadow-purple-500/20 transition-all duration-300"
      >
        <select
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          className="text-sm pl-2 pr-2 outline-none bg-transparent text-gray-700 dark:text-gray-200 font-medium cursor-pointer hover:text-indigo-600 dark:hover:text-purple-400 transition-colors"
        >
          <option
            className="bg-white dark:bg-gray-800 text-gray-700 dark:text-white"
            value="text"
          >
            Text
          </option>
          <option
            className="bg-white dark:bg-gray-800 text-gray-700 dark:text-white"
            value="image"
          >
            Image
          </option>
        </select>
        <div className="h-5 w-px bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent opacity-50"></div>
        <input
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          type="text"
          placeholder="Type your prompt here.."
          className="flex-1 w-full text-sm outline-none bg-transparent text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          required
        />
        <button
          disabled={loading}
          className="hover:scale-110 active:scale-95 transition-transform duration-150 disabled:opacity-50 disabled:scale-100"
        >
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            className="w-7 cursor-pointer"
          />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
