
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './UserContext';
import { toast } from 'sonner';

// Define message type
export type Message = {
  id: string;
  userId: string;
  username: string;
  content: string | null;
  imageUrl?: string | null;
  timestamp: number;
};

// Define conversation type
export type Conversation = {
  id: string;
  participants: {
    userId: string;
    username: string;
  }[];
  messages: Message[];
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  startedAt: number;
  endedAt: number | null;
  isActive: boolean;
};

// Define chat request type
export type ChatRequest = {
  id: string;
  senderId: string;
  senderUsername: string;
  recipientId: string;
  recipientUsername: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
  conversationId?: string | null;
};

// Define state type
type ChatState = {
  conversations: Conversation[];
  activeConversationId: string | null;
  chatRequests: ChatRequest[];
};

// Define action types
type ChatAction = 
  | { type: 'ADD_CONVERSATION', payload: Conversation }
  | { type: 'ADD_MESSAGE', payload: { conversationId: string, message: Message } }
  | { type: 'SET_ACTIVE_CONVERSATION', payload: string | null }
  | { type: 'END_CONVERSATION', payload: string }
  | { type: 'DELETE_CONVERSATION', payload: string }
  | { type: 'LOAD_CONVERSATIONS', payload: Conversation[] }
  | { type: 'LOAD_CHAT_REQUESTS', payload: ChatRequest[] }
  | { type: 'ADD_CHAT_REQUEST', payload: ChatRequest }
  | { type: 'UPDATE_CHAT_REQUEST', payload: ChatRequest };

// Initial state
const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  chatRequests: [],
};

// Reducer function
const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: [...state.conversations, action.payload],
        activeConversationId: action.payload.id,
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map(conv => 
          conv.id === action.payload.conversationId 
            ? { 
                ...conv, 
                messages: [...conv.messages.filter(m => m.id !== action.payload.message.id), action.payload.message]
              }
            : conv
        ),
      };
    case 'SET_ACTIVE_CONVERSATION':
      return {
        ...state,
        activeConversationId: action.payload,
      };
    case 'END_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conv => 
          conv.id === action.payload 
            ? { ...conv, isActive: false, endedAt: Date.now() }
            : conv
        ),
        activeConversationId: null,
      };
    case 'DELETE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter(conv => conv.id !== action.payload),
        activeConversationId: state.activeConversationId === action.payload ? null : state.activeConversationId,
      };
    case 'LOAD_CONVERSATIONS':
      return {
        ...state,
        conversations: action.payload,
      };
    case 'LOAD_CHAT_REQUESTS':
      return {
        ...state,
        chatRequests: action.payload,
      };
    case 'ADD_CHAT_REQUEST':
      return {
        ...state,
        chatRequests: [...state.chatRequests, action.payload],
      };
    case 'UPDATE_CHAT_REQUEST':
      return {
        ...state,
        chatRequests: state.chatRequests.map(req => 
          req.id === action.payload.id ? action.payload : req
        ),
      };
    default:
      return state;
  }
};

// Create context
type ChatContextType = {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  createChatRequest: (recipientId: string, recipientUsername: string, location: { latitude: number, longitude: number, accuracy?: number }) => Promise<string>;
  acceptChatRequest: (requestId: string) => Promise<string | null>;
  declineChatRequest: (requestId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, imageUrl?: string) => Promise<void>;
  endConversation: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchChatRequests: () => Promise<void>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { user, userId, username } = useUser();

  // Subscribe to real-time updates when authenticated
  useEffect(() => {
    let messagesSubscription: any = null;
    let chatRequestsSubscription: any = null;
    let conversationsSubscription: any = null;

    if (user) {
      // Subscribe to messages
      messagesSubscription = supabase
        .channel('public:messages')
        .on('postgres_changes', 
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          }, 
          (payload) => {
            const newMessage = payload.new as any;
            
            // Find the conversation for this message
            const conversation = state.conversations.find(
              c => c.id === newMessage.conversation_id
            );
            
            if (conversation) {
              // Don't add messages that are already in our state (avoid duplicates)
              // Using id as the unique identifier
              const msgExists = conversation.messages.some(m => m.id === newMessage.id);
              
              if (!msgExists) {
                // Skip our own temporary messages that might have a different id
                const tempMsgExists = conversation.messages.some(
                  m => m.userId === newMessage.user_id && 
                      m.content === newMessage.content && 
                      m.id.startsWith('temp-')
                );
                
                if (!tempMsgExists) {
                  dispatch({
                    type: 'ADD_MESSAGE',
                    payload: {
                      conversationId: newMessage.conversation_id,
                      message: {
                        id: newMessage.id,
                        userId: newMessage.user_id || '',
                        username: newMessage.username,
                        content: newMessage.content,
                        imageUrl: newMessage.image_url,
                        timestamp: new Date(newMessage.timestamp).getTime(),
                      }
                    }
                  });
                }
              }
            } else {
              // If we don't have the conversation yet, fetch all conversations
              fetchConversations();
            }
          }
        )
        .subscribe();
        
      // Subscribe to chat requests
      chatRequestsSubscription = supabase
        .channel('public:chat_requests')
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_requests',
          },
          (payload) => {
            // Handle chat request updates for all events
            fetchChatRequests();
            
            // Show notification for new chat request if recipient
            if (payload.eventType === 'INSERT' && (payload.new as any).recipient_id === user.id) {
              toast.info('New chat request received');
            }
          }
        )
        .subscribe();

      // Subscribe to conversations for status changes
      conversationsSubscription = supabase
        .channel('public:conversations')
        .on('postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'conversations',
          },
          (payload) => {
            // Refresh conversations when any conversation is updated (like ended)
            fetchConversations();
          }
        )
        .subscribe();
        
      // Fetch conversations and chat requests on mount
      fetchConversations();
      fetchChatRequests();
    }

    // Cleanup subscriptions
    return () => {
      if (messagesSubscription) {
        supabase.removeChannel(messagesSubscription);
      }
      if (chatRequestsSubscription) {
        supabase.removeChannel(chatRequestsSubscription);
      }
      if (conversationsSubscription) {
        supabase.removeChannel(conversationsSubscription);
      }
    };
  }, [user]);
  
  // Fetch user's conversations
  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      // Get all conversation IDs the user is part of
      const { data: participations, error: participationsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (participationsError) {
        console.error('Error fetching participations:', participationsError);
        throw participationsError;
      }
      
      if (!participations || participations.length === 0) {
        console.log('No conversations found for user');
        return;
      }
      
      const conversationIds = participations.map(p => p.conversation_id);
      
      // Get conversation details
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds);

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        throw conversationsError;
      }
      
      // For each conversation, get participants and messages
      const populatedConversations: Conversation[] = await Promise.all(
        conversations.map(async (conv: any) => {
          // Get participants
          const { data: participants, error: participantsError } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.id);

          if (participantsError) {
            console.error('Error fetching participants:', participantsError);
            throw participantsError;
          }
          
          // For each participant, get their username from profiles table
          const participantsWithUsernames = await Promise.all(
            participants.map(async (participant: any) => {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', participant.user_id)
                .single();
                
              if (profileError) {
                console.log(`Could not find profile for user ${participant.user_id}, using fallback.`);
                // Fallback for users without profiles
                return {
                  userId: participant.user_id,
                  username: participant.user_id === user.id ? username : 'Unknown User'
                };
              }
              
              return {
                userId: participant.user_id,
                username: profileData?.username || 'Unknown User'
              };
            })
          );
          
          // Get messages
          const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('timestamp', { ascending: true });

          if (messagesError) {
            console.error('Error fetching messages:', messagesError);
            throw messagesError;
          }
          
          // Extract location coordinates from PostGIS point
          const locationStr = conv.location as any;
          let latitude = 0, longitude = 0;
          // Set accuracy from the database, defaulting to 0 if not available
          let accuracy = conv.location_accuracy !== undefined ? conv.location_accuracy : 0;
          
          // Parse the POINT(lng lat) format
          if (typeof locationStr === 'string' && locationStr.startsWith('POINT')) {
            const coordsMatch = locationStr.match(/POINT\(([^ ]+) ([^)]+)\)/);
            if (coordsMatch && coordsMatch.length >= 3) {
              longitude = parseFloat(coordsMatch[1]);
              latitude = parseFloat(coordsMatch[2]);
            }
          }
          
          return {
            id: conv.id,
            participants: participantsWithUsernames,
            messages: (messages || []).map((msg: any) => ({
              id: msg.id,
              userId: msg.user_id || '',
              username: msg.username,
              content: msg.content,
              imageUrl: msg.image_url,
              timestamp: new Date(msg.timestamp).getTime(),
            })),
            location: { latitude, longitude, accuracy },
            startedAt: new Date(conv.started_at).getTime(),
            endedAt: conv.ended_at ? new Date(conv.ended_at).getTime() : null,
            isActive: conv.is_active,
          };
        })
      );
      
      dispatch({ type: 'LOAD_CONVERSATIONS', payload: populatedConversations });
      
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    }
  };

  // Fetch user's chat requests
  const fetchChatRequests = async () => {
    if (!user) return;
    
    try {
      // Get all chat requests involving the user
      const { data: requests, error: requestsError } = await supabase
        .from('chat_requests')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (requestsError) {
        console.error('Error fetching chat requests:', requestsError);
        throw requestsError;
      }
      
      if (!requests || requests.length === 0) {
        dispatch({ type: 'LOAD_CHAT_REQUESTS', payload: [] });
        return;
      }
      
      // For each request, get usernames
      const populatedRequests: ChatRequest[] = await Promise.all(
        requests.map(async (req: any) => {
          let senderUsername = 'Unknown User';
          let recipientUsername = 'Unknown User';
          
          try {
            // Get sender username
            const { data: senderData } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', req.sender_id)
              .single();
            
            if (senderData) {
              senderUsername = senderData.username;
            }
          } catch (senderError) {
            console.log(`Could not find profile for sender ${req.sender_id}`);
          }
          
          try {
            // Get recipient username
            const { data: recipientData } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', req.recipient_id)
              .single();
              
            if (recipientData) {
              recipientUsername = recipientData.username;
            }
          } catch (recipientError) {
            console.log(`Could not find profile for recipient ${req.recipient_id}`);
          }
          
          return {
            id: req.id,
            senderId: req.sender_id,
            senderUsername,
            recipientId: req.recipient_id,
            recipientUsername,
            status: req.status,
            createdAt: new Date(req.created_at).getTime(),
            conversationId: req.conversation_id
          };
        })
      );
      
      dispatch({ type: 'LOAD_CHAT_REQUESTS', payload: populatedRequests });
      
    } catch (error) {
      console.error('Error fetching chat requests:', error);
      toast.error('Failed to load chat requests');
    }
  };

  // Create a new chat request
  const createChatRequest = async (
    recipientId: string, 
    recipientUsername: string, 
    location: { latitude: number, longitude: number, accuracy?: number }
  ): Promise<string> => {
    if (!user || !username) {
      throw new Error('You must be logged in to create a chat request');
    }
    
    try {
      // Check if there's already a pending request
      const { data: existingRequests, error: checkError } = await supabase
        .from('chat_requests')
        .select('id')
        .eq('sender_id', user.id)
        .eq('recipient_id', recipientId)
        .eq('status', 'pending');
        
      if (checkError) {
        console.error('Error checking existing requests:', checkError);
        throw checkError;
      }
      
      // If there's already a pending request, return its ID
      if (existingRequests && existingRequests.length > 0) {
        toast.info('Chat request already sent');
        return existingRequests[0].id;
      }
      
      // Create chat request
      const { data: requestData, error: requestError } = await supabase
        .from('chat_requests')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          status: 'pending'
        })
        .select()
        .single();

      if (requestError) {
        console.error('Error creating chat request:', requestError);
        throw new Error(`Failed to send chat request: ${requestError.message}`);
      }
      
      if (!requestData) throw new Error('Failed to create chat request');
      
      // Display success message
      toast.success('Chat request sent');
      
      // Add to local state
      const newRequest: ChatRequest = {
        id: requestData.id,
        senderId: user.id,
        senderUsername: username,
        recipientId: recipientId,
        recipientUsername: recipientUsername,
        status: 'pending',
        createdAt: Date.now(),
      };
      
      dispatch({ type: 'ADD_CHAT_REQUEST', payload: newRequest });
      
      return requestData.id;
      
    } catch (error: any) {
      console.error('Error creating chat request:', error);
      toast.error(`Failed to send chat request: ${error.message}`);
      throw error;
    }
  };

  // Accept a chat request
  const acceptChatRequest = async (requestId: string): Promise<string | null> => {
    if (!user || !username) {
      throw new Error('You must be logged in to accept a chat request');
    }
    
    try {
      // Find the request to get sender info
      const request = state.chatRequests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Chat request not found');
      }
      
      // Create conversation first without attempting to use the location_accuracy field
      // since it doesn't exist in the actual database schema
      const point = `POINT(0 0)`; // Placeholder point, will be updated later
      
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .insert({
          location: point,
          is_active: true,
          started_at: new Date().toISOString()
          // Removed the location_accuracy field that doesn't exist in the database
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        throw new Error(`Failed to create conversation: ${convError.message}`);
      }
      
      if (!convData) throw new Error('Failed to create conversation');
      
      const conversationId = convData.id;
      
      // First, update the chat request status to accepted and set the conversation ID
      const { error: updateError } = await supabase
        .from('chat_requests')
        .update({ 
          status: 'accepted',
          conversation_id: conversationId,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating chat request:', updateError);
        throw new Error(`Failed to update chat request status: ${updateError.message}`);
      }
      
      // Add recipient (current user)
      const { error: recipientError } = await supabase
        .from('conversation_participants')
        .insert({ 
          conversation_id: conversationId, 
          user_id: user.id 
        });
        
      if (recipientError) {
        console.error('Error adding recipient:', recipientError);
        throw new Error(`Failed to add yourself to conversation: ${recipientError.message}`);
      }
      
      // Then add the sender
      const { error: senderError } = await supabase
        .from('conversation_participants')
        .insert({ 
          conversation_id: conversationId, 
          user_id: request.senderId 
        });

      if (senderError) {
        console.error('Error adding sender:', senderError);
        throw new Error(`Failed to add sender to conversation: ${senderError.message}`);
      }
      
      // Fetch the updated conversations and chat requests
      await fetchConversations();
      await fetchChatRequests();
      
      toast.success('Chat request accepted');
      
      // Return the conversation ID
      return conversationId;
      
    } catch (error: any) {
      console.error('Error accepting chat request:', error);
      toast.error(`Error accepting chat request: ${error.message}`);
      throw error; // Re-throw the error for proper handling
    }
  };

  // Decline a chat request
  const declineChatRequest = async (requestId: string): Promise<void> => {
    if (!user) {
      throw new Error('You must be logged in to decline a chat request');
    }
    
    try {
      // Update the chat request status
      const { error: updateError } = await supabase
        .from('chat_requests')
        .update({ 
          status: 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating chat request:', updateError);
        throw new Error(`Failed to decline chat request: ${updateError.message}`);
      }
      
      // Update local state
      const request = state.chatRequests.find(r => r.id === requestId);
      if (request) {
        dispatch({ 
          type: 'UPDATE_CHAT_REQUEST', 
          payload: { ...request, status: 'declined' } 
        });
      }
      
      toast.success('Chat request declined');
      
    } catch (error: any) {
      console.error('Error declining chat request:', error);
      toast.error(`Failed to decline chat request: ${error.message}`);
    }
  };

  // Send a message
  const sendMessage = async (conversationId: string, content: string, imageUrl?: string) => {
    if (!user || !username) {
      throw new Error('You must be logged in to send a message');
    }
    
    try {
      // Create a local message object with a temporary ID
      const tempMessageId = `temp-${Date.now()}`;
      const timestamp = new Date();
      
      // Create the message object that will be added locally
      const newMessage: Message = {
        id: tempMessageId,
        userId: userId,
        username,
        content: content || null,
        imageUrl: imageUrl || null,
        timestamp: timestamp.getTime(),
      };
      
      // Immediately add the message to the local state for instant feedback
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          conversationId,
          message: newMessage
        }
      });
      
      // Then send the message to the server
      const messageData = {
        conversation_id: conversationId,
        user_id: userId,
        username,
        content: content || null,
        image_url: imageUrl || null,
      };
      
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select('id, timestamp')
        .single();

      if (error) throw error;
      
      // Replace the temporary message with the confirmed one
      if (data) {
        const confirmedMessage: Message = {
          ...newMessage,
          id: data.id,
          timestamp: new Date(data.timestamp).getTime(),
        };
        
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            conversationId,
            message: confirmedMessage
          }
        });
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // End a conversation
  const endConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ 
          is_active: false,
          ended_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) throw error;
      
      // Update local state
      dispatch({ type: 'END_CONVERSATION', payload: conversationId });
      
    } catch (error) {
      console.error('Error ending conversation:', error);
      toast.error('Failed to end conversation');
    }
  };

  // Delete a conversation
  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
      
      dispatch({ type: 'DELETE_CONVERSATION', payload: conversationId });
      toast.success('Conversation deleted successfully');
      
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  return (
    <ChatContext.Provider value={{ 
      state, 
      dispatch, 
      createChatRequest,
      acceptChatRequest,
      declineChatRequest,
      sendMessage, 
      endConversation,
      deleteConversation,
      fetchConversations,
      fetchChatRequests
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
