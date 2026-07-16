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
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

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

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setPrompt(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Microphone error");
    };

    recognitionRef.current = recognition;
  }, []);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      return;
    }

    recognitionRef.current.start();
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
        toast.success("Chat created Successfully...🎉");
      } else {
        toast.error("⚠️ " + data.message);
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
    <div className="flex-1 flex flex-col h-full w-full justify-between px-3 sm:px-6 md:px-10 lg:px-20 xl:px-32 2xl:pr-40 py-4 max-md:pt-14 overflow-hidden">
      {/* Messages Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1 sm:pr-2"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <img
              src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
              className="w-40 sm:w-56 md:w-68 opacity-90 object-contain"
              alt="Logo"
            />
            <p className="mt-4 sm:mt-6 text-3xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-600 to-gray-400 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent leading-tight">
              Ask Me Anything.
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <Message key={msg._id || msg.timestamp || index} message={msg} />
        ))}

        {loading && (
          <div className="flex items-center gap-2 justify-center py-4">
            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-indigo-500 animate-bounce"></div>
            <div
              className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-indigo-500 animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-indigo-500 animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        )}
      </div>

      {/* Input Form Area */}
      <div className="pt-2 sm:pt-4 w-full">
        <form
          onSubmit={onSubmit}
          className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border rounded-full w-full max-w-3xl md:max-w-4xl p-2 sm:p-3 pl-4 sm:pl-6 mx-auto flex gap-2 sm:gap-4 items-center shadow-lg"
        >
          {/* Dropdown mode selector */}
          <select
            onChange={(e) => setMode(e.target.value)}
            value={mode}
            className={`text-xs sm:text-sm outline-none bg-transparent cursor-pointer ${
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

          <div className="h-5 sm:h-6 w-px bg-gray-300 opacity-50 shrink-0"></div>

          {/* Input field */}
          <input
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt}
            type="text"
            placeholder="Type your prompt here..."
            className="flex-1 text-sm sm:text-base outline-none bg-transparent min-w-0"
            required
          />

          {/* Buttons Area */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pr-1 sm:pr-0">
            {/* Voice Button */}
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-2 sm:p-2.5 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center ${
                isListening
                  ? "bg-red-500 animate-pulse"
                  : "bg-indigo-500 hover:bg-indigo-600"
              }`}
            >
              <img
                src={assets?.Mic_icon}
                alt="Mic"
                className="w-4 h-4 sm:w-5 sm:h-5 object-contain invert"
              />
            </button>

            {/* Submit / Stop Button */}
            <button
              type={loading ? "button" : "submit"}
              onClick={loading ? handleStop : undefined}
              disabled={!loading && !prompt?.trim()}
              className="transition-transform duration-150 cursor-pointer hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
            >
              <img
                src={loading ? assets.stop_icon : assets.send_icon}
                className="w-8 sm:w-10 h-8 sm:h-10 object-contain"
                alt={loading ? "Stop generating" : "Send prompt"}
              />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
