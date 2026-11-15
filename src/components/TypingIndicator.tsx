import React from "react";
import { Agent } from "../types/chat";
import { DynamicLucideIcon } from "./DynamicLucideIcon";

interface TypingIndicatorProps {
  agent?: Agent;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ agent }) => {
  return (
    <div className="flex w-full justify-end my-2.5">
      <div className="flex max-w-[80%] gap-2.5 sm:gap-3 flex-row-reverse items-center">
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#191919] text-[#FAFAFA] dark:bg-[#242424] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 aspect-square shadow-sm border border-[#E0E0E0] dark:border-[#353535]"
          style={{
            width: "2.25rem",
            height: "2.25rem",
            minWidth: "2.25rem",
            minHeight: "2.25rem",
            aspectRatio: "1 / 1",
          }}
        >
          <DynamicLucideIcon name={agent?.avatarIcon} size={18} />
        </div>
        <div className="bg-[#FFFFFF] dark:bg-[#242424] rounded-2xl rounded-tl-sm px-4 py-3 border border-[#E0E0E0] dark:border-[#353535] shadow-sm">
          <div className="flex space-x-2 space-x-reverse items-center">
            <div className="w-2 h-2 bg-[#676767] dark:bg-[#A4A4A4] rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-[#676767] dark:bg-[#A4A4A4] rounded-full animate-bounce"
              style={{ animationDelay: "0.15s" }}
            ></div>
            <div
              className="w-2 h-2 bg-[#676767] dark:bg-[#A4A4A4] rounded-full animate-bounce"
              style={{ animationDelay: "0.3s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
