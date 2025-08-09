import React from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from '../types/chat';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  return (
    <div
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`flex max-w-xs lg:max-w-md xl:max-w-lg ${
          message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
        } gap-3`}
      >
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            message.sender === 'user'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600'
          }`}
        >
          {message.sender === 'user' ? (
            <User size={20} className="text-white" />
          ) : (
            <Bot size={20} className="text-white" />
          )}
        </div>
        
        <div
          className={`rounded-2xl px-4 py-3 ${
            message.sender === 'user'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm'
              : 'bg-slate-700/50 text-slate-100 rounded-tl-sm border border-slate-600/30'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
          <p className="text-xs mt-2 opacity-70">
            {message.timestamp.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
};