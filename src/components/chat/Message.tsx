
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Message as MessageType } from '@/context/ChatContext';
import { format } from 'date-fns';

interface MessageProps {
  message: MessageType;
  isOwnMessage: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isOwnMessage }) => {
  const { username, content, timestamp, imageUrl } = message;
  const formattedTime = format(new Date(timestamp), 'h:mm a');
  const initials = username.slice(0, 2).toUpperCase();
  
  return (
    <div className={`flex gap-2 mb-4 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8 mt-1">
        <AvatarFallback className={isOwnMessage ? 'bg-blue-600 text-white' : 'bg-gray-400 text-white'}>
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex flex-col max-w-[75%] ${isOwnMessage ? 'items-end' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-medium ${isOwnMessage ? 'order-2' : ''}`}>
            {username}
          </span>
          <span className="text-xs text-gray-500">
            {formattedTime}
          </span>
        </div>
        
        <div
          className={`rounded-lg p-3 ${
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          {imageUrl && (
            <div className="mb-2">
              <img 
                src={imageUrl} 
                alt="Shared" 
                className="max-h-48 rounded-md object-contain" 
                onClick={() => window.open(imageUrl, '_blank')}
              />
            </div>
          )}
          
          {content && <p className="whitespace-pre-wrap break-words">{content}</p>}
        </div>
      </div>
    </div>
  );
};

export default Message;
