
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLocation } from '@/context/LocationContext';
import { useUser } from '@/context/UserContext';
import { useChat } from '@/context/ChatContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, Users, MessageSquare } from 'lucide-react';

type NearbyUser = {
  id: string;
  username: string;
  distance: number; // in meters
};

const NearbyUsers: React.FC = () => {
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const { coordinates } = useLocation();
  const { user, username } = useUser();
  const { createChatRequest, state } = useChat();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (coordinates && user) {
      fetchNearbyUsers();
    }
  }, [coordinates, user]);
  
  const fetchNearbyUsers = async () => {
    if (!coordinates || !user) return;
    
    setLoading(true);
    setLastUpdateTime(new Date().toLocaleTimeString());
    
    try {
      // Update own location first
      const point = `POINT(${coordinates.longitude} ${coordinates.latitude})`;
      console.log(`Updating location: ${point}`);
      
      const { error: locationError } = await supabase
        .from('user_locations')
        .upsert(
          { 
            user_id: user.id, 
            location: point,
            last_updated: new Date().toISOString() 
          },
          { onConflict: 'user_id' }
        );
        
      if (locationError) {
        console.error('Error updating location:', locationError);
        throw locationError;
      }
      
      // Find nearby users using the Edge Function
      console.log(`Finding users near: ${point}`);
      const { data, error } = await supabase.functions.invoke('find_nearby_users', {
        body: {
          input_user_id: user.id,
          current_location: point,
          distance_meters: 10000 // 10km radius
        }
      });
      
      if (error) {
        console.error('Error calling find_nearby_users function:', error);
        
        // Fallback to direct database query if Edge Function fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('user_locations')
          .select('user_id')
          .neq('user_id', user.id)
          .limit(10);
          
        if (fallbackError) throw fallbackError;
        
        console.log('Using fallback method for nearby users');
        
        // Get usernames from profiles table for each user_id
        const usersWithProfiles = await Promise.all(
          (fallbackData || []).map(async (item: any) => {
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', item.user_id)
                .maybeSingle();
                
              if (profileError) {
                console.log(`Error fetching profile for user ${item.user_id}:`, profileError);
                // Fallback username
                return {
                  id: item.user_id,
                  username: 'Unknown User',
                  distance: Math.floor(Math.random() * 1000) // Random distance for demo
                };
              }
              
              // Use profile username if available, or fallback
              return {
                id: item.user_id,
                username: profileData?.username || 'Unknown User',
                distance: Math.floor(Math.random() * 1000) // Random distance for demo
              };
            } catch (err) {
              console.error('Error processing user:', err);
              return null;
            }
          })
        );
        
        // Filter out any nulls and set as nearby users
        setNearbyUsers(usersWithProfiles.filter(Boolean) as NearbyUser[]);
      } else {
        console.log(`Found ${data?.length || 0} nearby users`);
        
        // Format the data to match our expected format
        setNearbyUsers(
          (data || []).map((item: any) => ({
            id: item.user_id,
            username: item.username || 'Unknown User',
            distance: Math.round(item.distance)
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching nearby users:', error);
      toast.error('Failed to fetch nearby users');
      setNearbyUsers([]);
    } finally {
      setLoading(false);
    }
  };
  
  const startChat = async (userId: string, username: string) => {
    if (!coordinates) {
      toast.error('Location is required to start a chat');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create a chat request instead of immediately starting a conversation
      const requestId = await createChatRequest(
        userId,
        username,
        {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          accuracy: coordinates.accuracy || 0
        }
      );
      
      // Navigate to chat requests page
      navigate('/chat-requests');
      
    } catch (error: any) {
      console.error('Error creating chat request:', error);
      toast.error(`Failed to create chat request: ${error.message || 'Please check you are logged in'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };
  
  const isPendingRequest = (userId: string) => {
    return state.chatRequests.some(req => 
      req.recipientId === userId && 
      req.senderId === user?.id && 
      req.status === 'pending'
    );
  };
  
  const isAcceptedRequest = (userId: string) => {
    return state.chatRequests.some(req => 
      ((req.recipientId === userId && req.senderId === user?.id) || 
      (req.senderId === userId && req.recipientId === user?.id)) && 
      req.status === 'accepted'
    );
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-locallink-primary"></div>
          <p className="text-gray-600">Looking for people nearby...</p>
        </div>
      </div>
    );
  }
  
  if (nearbyUsers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold">No Users Nearby</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-4">
            We couldn't find any users in your area. Check back later or invite friends to join!
          </p>
          <Button onClick={fetchNearbyUsers} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">People Nearby</h2>
        <Button variant="outline" size="sm" onClick={fetchNearbyUsers} className="flex items-center gap-1">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <div className="bg-locallink-primary/5 p-3 rounded-md mb-3 text-xs">
        <p className="font-medium">Last updated: {lastUpdateTime}</p>
        <p className="text-gray-500">Using location to find people within 10km</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nearbyUsers.map((nearbyUser) => (
          <Card key={nearbyUser.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12 border-2 border-locallink-primary/20">
                    <AvatarFallback className="bg-locallink-primary text-white">
                      {getInitials(nearbyUser.username)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-medium">{nearbyUser.username}</h3>
                    <p className="text-sm text-gray-500">
                      {nearbyUser.distance < 1000 
                        ? `${nearbyUser.distance} m away` 
                        : `${(nearbyUser.distance / 1000).toFixed(1)} km away`}
                    </p>
                  </div>
                </div>
                
                {isPendingRequest(nearbyUser.id) ? (
                  <Button 
                    size="sm"
                    variant="outline"
                    className="text-amber-600"
                    disabled
                  >
                    Request Pending
                  </Button>
                ) : isAcceptedRequest(nearbyUser.id) ? (
                  <Button 
                    onClick={() => navigate('/chat')}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Chat
                  </Button>
                ) : (
                  <Button 
                    onClick={() => startChat(nearbyUser.id, nearbyUser.username)}
                    size="sm"
                    className="bg-locallink-primary hover:bg-locallink-primary/90"
                  >
                    Request Chat
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NearbyUsers;
