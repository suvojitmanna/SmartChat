import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

const Appcontext = createContext();

export const AppcontextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loadingUser, setLoadingUser] = useState(true);

  /*  FETCH USER  */
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/data");

      if (data.success) {
        setUser(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingUser(false);
    }
  };

  /*  CREATE NEW CHAT  */
  const createNewChat = async () => {
    try {
      if (!user) return toast.error("Login to create a new chat");

      const { data } = await axios.post("/api/chat/create");

      if (data.success) {
        // add new chat at top
        setChats((prev) => [data.chat, ...prev]);

        // select this new chat
        setSelectedChat(data.chat);

        toast.success("New chat created");
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  /*  FETCH USER CHATS  */
  const fetchUserChats = async () => {
    try {
      const { data } = await axios.get("/api/chat/get");

      if (data.success) {
        setChats(data.chats);
        setChats(data.chats);

        const savedChatId = sessionStorage.getItem("activeChatId");

        if (savedChatId) {
          const existingChat = data.chats.find(
            (chat) => chat._id === savedChatId,
          );

          if (existingChat) {
            setSelectedChat(existingChat);
            return;
          }
        }

        setSelectedChat(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /*  THEME HANDLING  */
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  /*  USER CHANGED  */
  useEffect(() => {
    if (user) {
      fetchUserChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user]);

  /*  TOKEN HANDLING  */
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
      setLoadingUser(false);
    }
  }, [token]);

  /*  CONTEXT VALUE  */
  const value = {
    navigate,
    user,
    setUser,
    fetchUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
    createNewChat,
    loadingUser,
    fetchUserChats,
    token,
    setToken,
    axios,
  };

  return <Appcontext.Provider value={value}>{children}</Appcontext.Provider>;
};

export const useAppcontext = () => useContext(Appcontext);
