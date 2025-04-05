
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, MessageSquare } from 'lucide-react';
import { useChat, Message } from '@/context/ChatContext';
import { useUser } from '@/context/UserContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import MessageInput from './MessageInput';

const ChatInterface: React.FC = () => {
  const { state, sendMessage, dispatch, endConversation } = useChat();
  const { userId, username } = useUser();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const activeConversation = state.conversations.find(
    conv => conv.id === state.activeConversationId
  );
  
  // Redirect if no active conversation
  useEffect(() => {
    if (!state.activeConversationId && state.conversations.length > 0) {
      // Find the most recent active conversation
      const activeConvs = state.conversations.filter(conv => conv.isActive);
      if (activeConvs.length > 0) {
        // Set the most recent one as active
        const mostRecent = activeConvs.reduce((prev, current) => 
          prev.startedAt > current.startedAt ? prev : current
        );
        dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: mostRecent.id });
      } else {
        navigate('/nearby');
      }
    } else if (!state.activeConversationId) {
      navigate('/nearby');
    }
  }, [state.activeConversationId, state.conversations, dispatch, navigate]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);
  
  const handleSendMessage = (content: string, imageUrl?: string) => {
    if (!state.activeConversationId || !username) return;
    
    // Send the message through the ChatContext
    sendMessage(state.activeConversationId, content, imageUrl);
  };
  
  const handleEndConversation = async () => {
    if (!state.activeConversationId) return;
    
    await endConversation(state.activeConversationId);
    toast.info('Conversation ended');
    navigate('/archive');
  };
  
  if (!activeConversation) {
    return <div className="p-8 text-center">Loading conversation...</div>;
  }
  
  const otherParticipant = activeConversation.participants.find(
    p => p.userId !== userId
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md animate-fade-in">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">
            Chat with {otherParticipant?.username || 'User'}
          </h2>
          <p className="text-xs text-gray-500">
            Started {new Date(activeConversation.startedAt).toLocaleTimeString()}
          </p>
        </div>
        {activeConversation.isActive ? (
          <Button variant="outline" size="sm" onClick={handleEndConversation}>
            End Chat
          </Button>
        ) : (
          <div className="flex items-center text-gray-500 text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            Chat ended
          </div>
        )}
      </div>
      
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeConversation.messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No messages yet</p>
            <p className="text-sm mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          activeConversation.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.userId === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                  message.userId === userId
                    ? 'bg-proximichat-primary text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="text-xs mb-1">
                  {message.userId === userId ? 'You' : message.username}
                </div>
                {message.content && (
                  <p className="break-words">{message.content}</p>
                )}
                {message.imageUrl && (
                  <div className="mt-2">
                    <img 
                      src={message.imageUrl} 
                      alt="Shared" 
                      className="rounded-md max-w-full max-h-60 object-contain" 
                    />
                  </div>
                )}
                <div className="text-xs mt-1 opacity-70 text-right">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="p-4 border-t border-gray-200">
        <MessageInput 
          onSendMessage={handleSendMessage} 
          disabled={!activeConversation.isActive} 
        />
      </div>
    </div>
  );
};

export default ChatInterface;
