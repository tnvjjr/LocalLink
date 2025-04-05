
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useChat, ChatRequest } from '@/context/ChatContext';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const ChatRequestItem: React.FC<{ request: ChatRequest, isRecipient: boolean }> = ({ request, isRecipient }) => {
  const { acceptChatRequest, declineChatRequest } = useChat();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleAccept = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const conversationId = await acceptChatRequest(request.id);
      if (conversationId) {
        toast.success('Chat request accepted');
        navigate('/chat');
      } else {
        setError('Could not create conversation');
        toast.error('Could not create conversation');
      }
    } catch (error: any) {
      console.error('Error accepting chat request:', error);
      setError(error.message || 'Could not accept chat request');
      toast.error(error.message || 'Could not accept chat request');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDecline = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await declineChatRequest(request.id);
      toast.success('Chat request declined');
    } catch (error: any) {
      console.error('Error declining chat request:', error);
      setError(error.message || 'Could not decline chat request');
      toast.error(error.message || 'Could not decline chat request');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <h3 className="font-semibold">
          {isRecipient ? 'Chat Request From' : 'Chat Request To'} {isRecipient ? request.senderUsername : request.recipientUsername}
        </h3>
        <p className="text-sm text-gray-500">
          {new Date(request.createdAt).toLocaleString()}
        </p>
        <p className="mt-2 text-sm">
          Status: <span className={`font-semibold ${
            request.status === 'pending' ? 'text-yellow-600' :
            request.status === 'accepted' ? 'text-green-600' : 'text-red-600'
          }`}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </span>
        </p>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </CardContent>
      {isRecipient && request.status === 'pending' && (
        <CardFooter className="flex gap-2 pt-0">
          <Button 
            onClick={handleAccept} 
            disabled={isLoading}
            className="bg-locallink-primary hover:bg-locallink-primary/90"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Accept
          </Button>
          <Button 
            onClick={handleDecline} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Decline
          </Button>
        </CardFooter>
      )}
      {request.status === 'accepted' && request.conversationId && (
        <CardFooter className="pt-0">
          <Button onClick={() => navigate('/chat')} className="bg-locallink-primary hover:bg-locallink-primary/90">
            Go to Chat
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

const ChatRequestList: React.FC = () => {
  const { state, fetchChatRequests } = useChat();
  const { userId } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await fetchChatRequests();
      toast.success('Chat requests refreshed');
    } catch (error: any) {
      console.error('Error refreshing chat requests:', error);
      setError(error.message || 'Failed to refresh chat requests');
      toast.error(error.message || 'Failed to refresh chat requests');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch chat requests on component mount
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchChatRequests()
      .then(() => {
        console.log('Chat requests fetched successfully');
      })
      .catch(err => {
        console.error('Error in initial fetch of chat requests:', err);
        setError(err.message || 'Failed to load chat requests');
        toast.error(err.message || 'Failed to load chat requests');
      })
      .finally(() => {
        setIsLoading(false);
      });
    
    // Set up periodic refresh every 30 seconds instead of 15
    const interval = setInterval(() => {
      fetchChatRequests().catch(err => {
        console.error('Error in periodic fetch of chat requests:', err);
      });
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchChatRequests]);
  
  const pendingRequests = state.chatRequests.filter(req => req.status === 'pending');
  const otherRequests = state.chatRequests.filter(req => req.status !== 'pending');
  
  return (
    <div className="space-y-4">
      <Button 
        onClick={handleRefresh} 
        variant="outline" 
        className="mb-4"
        disabled={isLoading}
        aria-label="Refresh chat requests"
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Refresh Requests
      </Button>
      
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">{error}</p>
        <p className="text-sm mt-1 text-gray-600">Try refreshing or check your network connection.</p>
      </div>}
      
      {isLoading && state.chatRequests.length === 0 ? (
        <div className="text-center p-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading chat requests...</p>
        </div>
      ) : state.chatRequests.length === 0 ? (
        <div className="text-center p-4">
          <p>No chat requests found</p>
        </div>
      ) : (
        <>
          {pendingRequests.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3">Pending Requests</h2>
              {pendingRequests.map(request => (
                <ChatRequestItem 
                  key={request.id} 
                  request={request} 
                  isRecipient={request.recipientId === userId}
                />
              ))}
            </div>
          )}
          
          {otherRequests.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3">Other Requests</h2>
              {otherRequests.map(request => (
                <ChatRequestItem 
                  key={request.id} 
                  request={request} 
                  isRecipient={request.recipientId === userId}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatRequestList;
