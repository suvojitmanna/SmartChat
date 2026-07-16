import React, { useEffect, useRef, useState } from "react";
import { useAppcontext } from "../context/Appcontext";
import { assets } from "../assets/assets";
import Message from "./Message";
import toast from "react-hot-toast";

const ChatBox = () => {
  const containerRef = useRef(null);
  const controllerRef = useRef(null);

  const {
    selectedChat,
    setSelectedChat,
    setChats,
    theme,
    user,
    axios,
    token,
    setUser,
  } = useAppcontext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");

  /* LOAD SELECTED CHAT */
  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages || []);
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  /* SAVE ACTIVE CHAT (Refresh Safe)  */
  useEffect(() => {
    if (selectedChat?._id) {
      sessionStorage.setItem("activeChatId", selectedChat._id);
    }
  }, [selectedChat]);

  /*  AUTO SCROLL  */
  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  /*  STOP BUTTON  */
  const handleStop = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
      toast("Generation stopped", {
        icon: "❌",
      });
    }
    setLoading(false);
  };

  /*  SEND MESSAGE   */
  const createChatIfNeeded = async () => {
    if (selectedChat?._id) return selectedChat._id;

    try {
      const { data } = await axios.post(
        "/api/chat/create",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (data.success) {
        setChats((prev) => [data.chat, ...prev]);
        setSelectedChat(data.chat);
        toast("Send Message successfully", {
          icon: "🎉",
        });
        return data.chat._id;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }

    return null;
  };

  /*  CHAT  */
  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading || !prompt.trim() || !user) return;

    setLoading(true);

    const promptCopy = prompt;
    setPrompt("");

    const chatId = await createChatIfNeeded();
    if (!chatId) {
      setLoading(false);
      return;
    }

    const userMessage = {
      role: "user",
      content: promptCopy,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      controllerRef.current = new AbortController();

      const { data } = await axios.post(
        `/api/message/${mode}`,
        { chatId, prompt: promptCopy },
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: controllerRef.current.signal,
        },
      );

      if (data.success) {
        const newReply = data.reply;

        setMessages((prev) => [...prev, newReply]);

        // Update selected chat safely
        setSelectedChat((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...(prev.messages || []), userMessage, newReply],
            updatedAt: new Date(),
          };
        });

        // Move chat to top safely
        setChats((prevChats) => {
          const existingChat = prevChats.find((chat) => chat._id === chatId);

          if (!existingChat) return prevChats;

          const filtered = prevChats.filter((chat) => chat._id !== chatId);

          const updatedChat = {
            ...existingChat,
            messages: [...(existingChat.messages || []), userMessage, newReply],
            updatedAt: new Date(),
          };

          return [updatedChat, ...filtered];
        });

        setUser((prev) => ({
          ...prev,
          credits: prev.credits - 1,
        }));
        toast.success("Chat create Successfully...🎉");
      } else {
        toast.error("⚠️", data.message);
      }
    } catch (error) {
      if (error.code === "ERR_CANCELED" || error.name === "CanceledError") {
        console.log("Request aborted");
        return;
      }

      toast.error(error.response?.data?.message || error.message);
    } finally {
      controllerRef.current = null;
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40">
      {/* Messages */}
      <div ref={containerRef} className="flex-1 mb-5 overflow-y-auto space-y-3">
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
          <Message key={msg._id || msg.timestamp || index} message={msg} />
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

      {/* Input */}
      <form
        onSubmit={onSubmit}
        className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border rounded-full w-full max-w-2xl p-3 pl-5 mx-auto flex gap-3 items-center shadow-lg"
      >
        <select
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          // Change the text color of the currently selected item
          className={`text-sm outline-none bg-transparent ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          <option
            value="text"
            className={
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-white text-black"
            }
          >
            Text
          </option>
          <option
            value="image"
            className={
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-white text-black"
            }
          >
            Image
          </option>
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
