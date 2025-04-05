
import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import ArchiveMap from '@/components/archive/ArchiveMap';
import { useChat } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Mountain } from 'lucide-react';

const ArchivePage: React.FC = () => {
  const { state } = useChat();
  const navigate = useNavigate();
  
  const hasArchivedConversations = state.conversations.some(conv => !conv.isActive);
  
  if (!hasArchivedConversations) {
    return (
      <PageContainer>
        <div className="container mx-auto px-4 py-12 max-w-md">
          <div className="nature-card p-8 text-center">
            <div className="mb-6">
              <div className="bg-nature-leaf/10 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mountain className="h-12 w-12 text-nature-forest animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-nature-forest">No Adventure Archives</h2>
            <p className="text-gray-600 mb-6">
              Your outdoor journey has just begun! Start chatting with nearby enthusiasts to create adventure memories.
            </p>
            <Button 
              onClick={() => navigate('/nearby')} 
              className="w-full outdoor-button group"
            >
              <MapPin className="h-4 w-4 mr-2 group-hover:animate-pulse" />
              Find Nearby Explorers
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer fullHeight>
      <div className="container mx-auto h-[calc(100vh-64px)]">
        <div className="h-full p-4">
          <div className="nature-card h-full overflow-hidden border border-nature-leaf/20">
            <div className="bg-gradient-to-r from-nature-leaf/20 to-nature-forest/20 p-3 border-b border-nature-leaf/10 flex items-center">
              <Clock className="h-5 w-5 text-nature-forest mr-2" />
              <h2 className="font-semibold text-nature-forest">Adventure Archives</h2>
              <p className="text-xs ml-auto text-nature-forest/70">Revisit your outdoor connections</p>
            </div>
            <ArchiveMap />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ArchivePage;
