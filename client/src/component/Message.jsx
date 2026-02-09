import React, { useEffect } from "react";
import { assets } from "../assets/assets";
import moment from "moment";
import Markdown from "react-markdown";
import prism from "prismjs";

const Message = ({ message }) => {
  useEffect(() => {
    prism.highlightAll();
  }, [message.content]);
  return (
    <div className="animate-fadeIn">
      {message.role === "user" ? (
        <div className="flex items-start justify-end my-5 gap-3 group">
          <div className="flex flex-col gap-2 p-3 px-4 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-purple-900/40 dark:to-indigo-900/40 border border-indigo-200/50 dark:border-purple-500/30 hover:border-indigo-300 dark:hover:border-purple-500/50 rounded-2xl max-w-2xl shadow-md hover:shadow-lg dark:hover:shadow-purple-500/20 transition-all duration-200 transform hover:scale-100 group-hover:translate-y-0">
            <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
              {message.content}
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {moment(message.timestamp).fromNow()}{" "}
            </span>
          </div>
          <img
            src={assets.user_icon}
            className="w-8 h-8 rounded-full shadow-md border border-indigo-300/50 dark:border-purple-500/50 flex-shrink-0 object-cover"
          />
        </div>
      ) : (
        <div className="inline-flex flex-col gap-2 p-3 px-4 max-w-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/60 dark:to-purple-950/60 border border-gray-200/50 dark:border-purple-500/30 hover:border-gray-300 dark:hover:border-purple-500/50 rounded-2xl my-5 shadow-md hover:shadow-lg dark:hover:shadow-purple-500/20 transition-all duration-200 group">
          {message.isImage ? (
            <img
              src={message.content}
              className="w-full max-w-md mt-2 rounded-xl shadow-md border border-gray-200 dark:border-purple-500/30 hover:shadow-lg transition-shadow duration-200 object-cover"
            />
          ) : (
            <div className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed reset-tw prose prose-sm dark:prose-invert max-w-none">
              <Markdown>{message.content}</Markdown>
            </div>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {moment(message.timestamp).fromNow()}
          </span>
        </div>
      )}
    </div>
  );
};

export default Message;
