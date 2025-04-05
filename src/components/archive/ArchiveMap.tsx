
import React from 'react';
import { useChat } from '@/context/ChatContext';
import { useUser } from '@/context/UserContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Trash2, MessageSquare } from 'lucide-react';
import GoogleMapComponent from './GoogleMapComponent';

const ArchiveMap: React.FC = () => {
  const { state, deleteConversation } = useChat();
  const { user } = useUser();
  
  // Filter to show only archived conversations
  const archivedConversations = state.conversations.filter(conv => !conv.isActive);
  
  const handleDeleteConversation = async (id: string) => {
    if (confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      await deleteConversation(id);
    }
  };
  
  const renderConversationList = () => {
    if (archivedConversations.length === 0) {
      return (
        <div className="py-8 text-center">
          <p className="text-gray-500">No archived conversations yet</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3 max-h-[500px] overflow-y-auto p-2">
        {archivedConversations.map(conv => {
          // Find the other participant (not the current user)
          const otherParticipant = conv.participants.find(p => p.userId !== user?.id);
          
          return (
            <Card key={conv.id} className="relative">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-proximichat-primary" />
                      Chat with {otherParticipant?.username || 'Unknown'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(conv.startedAt).toLocaleDateString()} • {conv.messages.length} messages
                    </p>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDeleteConversation(conv.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full md:flex-row md:gap-4">
      <div className="w-full md:w-1/3 bg-white p-4 rounded-lg shadow-md mb-4 md:mb-0">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Archived Conversations
        </h2>
        {renderConversationList()}
      </div>
      
      <div className="w-full md:w-2/3 bg-white rounded-lg shadow-md overflow-hidden">
        <GoogleMapComponent conversations={archivedConversations} />
      </div>
    </div>
  );
};

export default ArchiveMap;
