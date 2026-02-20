import React, { useEffect, useState, useRef } from "react";
import { assets } from "../assets/assets";
import moment from "moment";
import Markdown from "react-markdown";
import prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";

const Message = ({ message }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef(null);

  /* ================= Typing Animation ================= */
  useEffect(() => {
    const content = String(message.content || "");

    if (message.role !== "assistant" || message.isImage || !message.isNew) {
      setDisplayedText(content);
      return;
    }

    let index = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      if (index < content.length) {
        setDisplayedText((prev) => prev + content.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [message]);

  /* ================= Prism Highlight ================= */
  useEffect(() => {
    setTimeout(() => {
      prism.highlightAll();
    }, 0);
  }, [displayedText]);

  /* ================= Auto Scroll ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [displayedText, message]);

  /* ================= Copy ================= */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  /* ================= Share ================= */
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Shared Message",
          text: message.content,
        });
      } else {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        alert("Sharing not supported. Message copied instead!");
      }
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  return (
    <div className="animate-fadeIn px-3 sm:px-6">
      {message.role === "user" ? (
        <div className="flex items-start justify-end my-4 gap-3 group">
          <div
            className="relative flex flex-col gap-2
            px-4 py-3 pr-12
            sm:px-5 sm:py-4 sm:pr-14
            rounded-2xl
            max-w-[92%] sm:max-w-2xl
            bg-gradient-to-br from-indigo-100 to-purple-100
            dark:from-purple-900/40 dark:to-indigo-900/40
            border border-indigo-200/50 dark:border-purple-500/30
            shadow-md transition hover:shadow-lg"
          >
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2
              opacity-100 sm:opacity-0
              sm:group-hover:opacity-100
              transition p-1.5 rounded-lg
              bg-white/70 dark:bg-gray-800/70"
            >
              {copied ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <rect x="3" y="3" width="13" height="13" rx="2" ry="2" />
                </svg>
              )}
            </button>

            <p className="text-sm sm:text-base text-gray-800 dark:text-gray-100 break-words">
              {message.content}
            </p>

            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {message.timestamp && moment(message.timestamp).fromNow()}
            </span>
          </div>

          <img
            src={assets.user_icon}
            alt="user"
            className="w-8 h-8 rounded-full shadow-md"
          />
        </div>
      ) : (
        <div className="flex items-start my-4 gap-3 group">
          <div
            className="relative flex flex-col gap-3
            px-4 py-3 pr-14
            sm:px-5 sm:py-4 sm:pr-16
            max-w-[92%] sm:max-w-2xl
            rounded-2xl
            backdrop-blur-lg
            bg-white/70 dark:bg-gray-900/70
            border border-gray-200/60 dark:border-purple-500/20
            shadow-lg transition hover:shadow-xl"
          >
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg
              bg-gray-200/70 dark:bg-gray-800/70
              hover:bg-gray-300 dark:hover:bg-gray-700 transition"
              >
                {copied ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <rect x="3" y="3" width="13" height="13" rx="2" ry="2" />
                  </svg>
                )}
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="p-1.5 rounded-lg
              bg-gray-200/70 dark:bg-gray-800/70
              hover:bg-gray-300 dark:hover:bg-gray-700 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            </div>

            {message.isImage ? (
              <img
                src={message.content}
                alt="generated"
                className="rounded-xl shadow-md max-w-xs sm:max-w-md"
              />
            ) : (
              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words">
                <Markdown>{displayedText}</Markdown>
              </div>
            )}

            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              {message.timestamp && moment(message.timestamp).fromNow()}
            </span>
          </div>
        </div>
      )}

      {/* Invisible bottom anchor */}
      <div ref={bottomRef} />
    </div>
  );
};

export default Message;
