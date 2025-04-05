
import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import ChatRequestList from '@/components/chat/ChatRequestList';
import { MessageSquare } from 'lucide-react';

const ChatRequestsPage: React.FC = () => {
  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="nature-card">
          <div className="bg-gradient-to-r from-nature-leaf/20 to-nature-forest/20 p-4 border-b border-nature-leaf/10 flex items-center">
            <MessageSquare className="h-5 w-5 text-nature-forest mr-2" />
            <h1 className="text-xl font-semibold text-nature-forest">Trail Connection Requests</h1>
          </div>
          <div className="p-4">
            <ChatRequestList />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ChatRequestsPage;
