import React, { useState } from "react";
import { useAppcontext } from "../context/Appcontext";
import { assets } from "../assets/assets";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {
  const navigate = useNavigate();
  const {
    chats,
    setSelectedChat,
    theme,
    setTheme,
    user,
    createNewChat,
    axios,
    setChats,
    fetchUserChats,
    setToken,
  } = useAppcontext();

  const [search, setSearch] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    toast.success("Logged out Successfully");
  };

  const deleteChat = async (e, chatId) => {
    try {
      e.stopPropagation();
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this chat?",
      );
      if (!confirmDelete) return;

      const { data } = await axios.post("/api/chat/delete", { chatId });

      if (data.success) {
        setChats((prev) => prev.filter((chat) => chat && chat._id !== chatId));
        await fetchUserChats();
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <>
      {/* Invisible overlay to catch outside clicks */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 z-40 md:hidden"
        />
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex flex-col min-h-screen md:h-screen 
  w-72 max-w-[80%] md:w-72 p-5 
  dark:bg-gradient-to-b dark:from-[#242124]/30 dark:to-[#000000]/30
  border-r border-[#80609F]/30 backdrop-blur-3xl 
  transition-all duration-500 max-md:absolute left-0 z-50 ${
    !isMenuOpen && "max-md:-translate-x-full max-md:pointer-events-none"
  }`}
      >
        <img
          src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
          className="w-full max-w-48"
          alt="Logo"
        />

        <button
          onClick={createNewChat}
          className="flex justify-center items-center w-full py-2 mt-10 text-white bg-gradient-to-r from-[#A456F7] to-[#3D81F6] text-sm rounded-md hover:scale-105"
        >
          <span className="mr-2 text-xl">+</span> New Chat
        </button>

        <div className="flex items-center gap-2 p-3 mt-4 border border-gray-400 dark:border-white/20 rounded-md focus-within:ring-2 focus-within:ring-purple-500/40">
          <img
            src={
              theme === "dark" ? assets.search_icon : assets.search_icon_light
            }
            className="w-4 not:dark:invert"
          />
          <input
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            type="text"
            placeholder="Search Your History"
            className="text-xs text-gray-700 dark:text-gray-200 placeholder:text-gray-400 outline-none bg-transparent w-full"
          />
        </div>

        {chats?.length > 0 && <p className="mt-4 text-sm">Recent Chats</p>}

        <div className="flex-1 overflow-y-auto mt-3 text-sm space-y-3">
          {chats
            ?.filter((chat) => {
              if (!chat) return false;
              const text = chat.messages?.[0]?.content || chat.name || "";
              return text.toLowerCase().includes(search.toLowerCase());
            })
            .map((chat) => {
              if (!chat) return null;

              return (
                <div
                  key={chat._id}
                  onClick={() => {
                    navigate("/");
                    setSelectedChat(chat);
                    setIsMenuOpen(false);
                  }}
                  className="p-2 px-4 dark:bg-[#57317C]/10 border border-gray-300 dark:border-[#80609F]/15 rounded-md cursor-pointer flex justify-between group hover:scale-105"
                >
                  <div>
                    <p className="truncate w-full">
                      {chat.messages?.length > 0
                        ? chat.messages[0].content.slice(0, 32)
                        : chat.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {moment(chat.updatedAt).fromNow()}
                    </p>
                  </div>

                  <img
                    src={assets.bin_icon}
                    className="w-4 cursor-pointer block md:hidden md:group-hover:block not-dark:invert"
                    onClick={(e) =>
                      toast.promise(deleteChat(e, chat._id), {
                        loading: "Deleting...",
                      })
                    }
                  />
                </div>
              );
            })}
        </div>

        <div
          onClick={() => {
            navigate("/community");
            setIsMenuOpen(false);
          }}
          className="flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-105"
        >
          <img src={assets.gallery_icon} className="w-4.5 not-dark:invert" />
          <p className="text-sm">Community Images</p>
        </div>

        <div
          onClick={() => {
            navigate("/credits");
            setIsMenuOpen(false);
          }}
          className="flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-105"
        >
          <img src={assets.diamond_icon} className="w-4.5 not-dark:invert" />
          <div className="text-sm">
            <p>Credits : {user?.credits}</p>
            <p className="text-xs text-gray-400">
              Purchase credits to use SmartGpt
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md hover:scale-105 ">
          <div className="flex items-center gap-2 text-sm">
            <img
              src={
                theme === "dark" ? assets.theme_icon : assets.theme_icon_dark
              }
              className="w-4 not:dark:invert"
            />
            <p>Dark Mode</p>
          </div>
          <label className="relative inline-flex cursor-pointer">
            <input
              onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              type="checkbox"
              className="sr-only peer"
              checked={theme === "dark"}
            />
            <div className="w-9 h-5 bg-gray-400 rounded-full peer-checked:bg-purple-600 transition-all"></div>
            <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
          </label>
        </div>

        <div className="flex items-center gap-3 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md group">
          <img src={assets.user_icon} className="w-7 rounded-full" />
          <p className="flex-1 text-sm truncate">
            {user ? user.name : "Login your account"}
          </p>

          {user && (
            <img
              className="h-5 cursor-pointer block md:hidden md:group-hover:block"
              onClick={logout}
              src={
                theme === "dark" ? assets.logout_icon : assets.logout_icon_light
              }
            />
          )}
        </div>
        <div className="mt-auto">
          <p className="mt-6 text-[11px] text-center text-gray-400 dark:text-gray-500">
            Created by{" "}
            <span className="text-purple-500 font-medium">Suvojit Manna</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
