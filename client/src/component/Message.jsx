import { useEffect, useState, useRef } from "react";
import { assets } from "../assets/assets";
import moment from "moment";
import Markdown from "react-markdown";
import prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import toast from "react-hot-toast";

const Message = ({ message }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const bottomRef = useRef(null);

  const wordRefs = useRef([]);

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
      toast.success("Copied! 📋");
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  /* ================= Speak ================= */
  const handleSpeak = (text) => {
    if (!text) return;

    window.speechSynthesis.cancel();

    if (speaking) {
      setSpeaking(false);
      setCurrentWordIndex(-1);
      toast.success("Speaker Off...🔇", { icon: "❌" });
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;

    const words = text.split(" ");

    let fallbackInterval = null;
    let usedBoundary = false;

    utterance.onboundary = (event) => {
      if (event.name === "word") {
        usedBoundary = true;

        const charIndex = event.charIndex;
        const wordIndex = text.substring(0, charIndex).split(" ").length - 1;

        setCurrentWordIndex(wordIndex);
      }
    };

    //  Start fallback ONLY if boundary not working
    utterance.onstart = () => {
      setSpeaking(true);

      setTimeout(() => {
        if (!usedBoundary) {
          let i = 0;

          fallbackInterval = setInterval(() => {
            setCurrentWordIndex(i++);
            if (i >= words.length) {
              clearInterval(fallbackInterval);
            }
          }, 400);
        }
      }, 500);
    };

    utterance.onend = () => {
      setSpeaking(false);
      setCurrentWordIndex(-1);
      if (fallbackInterval) clearInterval(fallbackInterval);
    };

    utterance.onerror = () => {
      setSpeaking(false);
      setCurrentWordIndex(-1);
      if (fallbackInterval) clearInterval(fallbackInterval);
    };

    //  MOBILE FIX: ensure voices are loaded
    const speakNow = () => {
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = speakNow;
    } else {
      speakNow();
    }
    toast.success("Speaker On...🔊");
  };

  useEffect(() => {
    if (!speaking) return;

    const el = wordRefs.current[currentWordIndex];

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentWordIndex, speaking]);

  useEffect(() => {
    // Force load voices (mobile bug fix)
    window.speechSynthesis.getVoices();

    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }, []);

  /* ================= Share ================= */
  const handleShare = async () => {
    try {
      // ================= IMAGE SHARE =================
      if (message.isImage) {
        const response = await fetch(message.content);
        const blob = await response.blob();

        const file = new File([blob], "image.png", {
          type: blob.type || "image/png",
        });

        // Check support
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Shared Image",
          });
          toast.success("Image share Successfully! 🖼️");
        } else {
          toast.error("Image sharing not supported on this device ❌");
        }
      }

      // ================= TEXT SHARE =================
      else {
        if (navigator.share) {
          await navigator.share({
            title: "Shared Message",
            text: message.content,
          });
          toast.success("Text share Successfully! 🔗");
        } else {
          await navigator.clipboard.writeText(message.content);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
          alert("Sharing not supported. Text copied instead!");
        }
      }
    } catch (err) {
      toast.error("Share failed", err);
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
              {/* copy */}
              {!message.isImage && (
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-gray-200/70 dark:bg-gray-800/70 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
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
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <rect x="3" y="3" width="13" height="13" rx="2" />
                    </svg>
                  )}
                </button>
              )}

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

              {/* Speak */}
              {!message.isImage && (
                <button
                  onClick={() => handleSpeak(message.content)}
                  className="p-1.5 rounded-lg bg-gray-200/70 dark:bg-gray-800/70 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
                >
                  {!speaking ? (
                    <svg
                      className="w-4 h-4 text-gray-700 dark:text-gray-300"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M11 5L6 9H2V15H6L11 19V5Z"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M15.54 8.46C16.47 9.39 17 10.66 17 12C17 13.33 16.47 14.6 15.54 15.54"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-gray-700 dark:text-gray-300"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M11 5L6 9H2V15H6L11 19V5Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M23 9L17 15M17 9L23 15"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>

            {message.isImage ? (
              <img
                src={message.content}
                alt="generated"
                className="rounded-xl shadow-md max-w-xs sm:max-w-md"
              />
            ) : (
              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words">
                {speaking ? (
                  <div className="flex flex-wrap gap-1">
                    {displayedText.split(" ").map((word, i) => (
                      <span
                        key={i}
                        ref={(el) => (wordRefs.current[i] = el)}
                        className={
                          i === currentWordIndex
                            ? "bg-[#649dff] text-black px-1 rounded"
                            : ""
                        }
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                ) : (
                  <Markdown>{displayedText}</Markdown>
                )}
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
