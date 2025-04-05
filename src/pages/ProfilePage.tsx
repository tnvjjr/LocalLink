
import React, { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/context/UserContext';
import { MessageSquare, Users, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type UserStats = {
  conversationsCount: number;
  usersMetCount: number;
  locationsVisitedCount: number;
  averageMessageCount: number;
  totalChatsDuration: number;
  isLoading: boolean;
};

const ProfilePage: React.FC = () => {
  const { user, username } = useUser();
  const [stats, setStats] = useState<UserStats>({
    conversationsCount: 0,
    usersMetCount: 0,
    locationsVisitedCount: 0,
    averageMessageCount: 0,
    totalChatsDuration: 0,
    isLoading: true
  });
  
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        // Get conversation count
        const { data: conversations, error: convError } = await supabase
          .from('conversations')
          .select('id, created_at');
          
        if (convError) throw convError;
        
        // Get users met (unique users chatted with)
        const { data: participantsData, error: partError } = await supabase
          .from('conversation_participants')
          .select('conversation_id, user_id');
          
        if (partError) throw partError;
        
        // Get messages for average calculation
        const { data: messages, error: msgError } = await supabase
          .from('messages')
          .select('id, conversation_id')
          .eq('user_id', user.id);
          
        if (msgError) throw msgError;
        
        // Get unique locations
        const { data: locations, error: locError } = await supabase
          .from('conversations')
          .select('location');
          
        if (locError) throw locError;
        
        // Compute unique users met
        const uniqueUsers = new Set<string>();
        participantsData?.forEach(participant => {
          if (participant.user_id !== user.id) {
            uniqueUsers.add(participant.user_id);
          }
        });
        
        // Compute unique locations
        const uniqueLocations = new Set<string>();
        locations?.forEach(loc => {
          // Assuming location is a string or can be converted to one
          if (loc.location) uniqueLocations.add(String(loc.location));
        });
        
        // Calculate average messages per conversation
        const messagesByConversation = messages?.reduce((acc: Record<string, number>, msg) => {
          if (!acc[msg.conversation_id]) acc[msg.conversation_id] = 0;
          acc[msg.conversation_id]++;
          return acc;
        }, {}) || {};
        
        const totalMessages = Object.values(messagesByConversation).reduce((sum, count) => sum + count, 0);
        const avgMessages = conversations?.length ? totalMessages / conversations.length : 0;
        
        setStats({
          conversationsCount: conversations?.length || 0,
          usersMetCount: uniqueUsers.size,
          locationsVisitedCount: uniqueLocations.size,
          averageMessageCount: Math.round(avgMessages * 10) / 10, // Round to 1 decimal place
          totalChatsDuration: 0, // To be calculated if we had duration data
          isLoading: false
        });
        
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    fetchUserStats();
  }, [user]);
  
  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };
  
  if (!user) return null;
  
  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24 border-2 border-locallink-primary/20">
                    <AvatarFallback className="bg-locallink-primary text-white text-2xl">
                      {username ? getInitials(username) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle>{username}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Member since</span>
                    <span className="font-medium">
                      {new Date(user.created_at || '').toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="font-medium flex items-center">
                      <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                      Active
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Tabs defaultValue="stats" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="stats">Statistics</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="stats">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5 text-locallink-primary"/>
                        <CardTitle className="text-lg">Conversations</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {stats.isLoading ? '...' : stats.conversationsCount}
                      </div>
                      <p className="text-sm text-gray-500">Total chats initiated</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-locallink-secondary"/>
                        <CardTitle className="text-lg">People Met</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {stats.isLoading ? '...' : stats.usersMetCount}
                      </div>
                      <p className="text-sm text-gray-500">Unique users chatted with</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-locallink-accent"/>
                        <CardTitle className="text-lg">Locations</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {stats.isLoading ? '...' : stats.locationsVisitedCount}
                      </div>
                      <p className="text-sm text-gray-500">Places you've chatted from</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-blue-500"/>
                        <CardTitle className="text-lg">Engagement</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {stats.isLoading ? '...' : stats.averageMessageCount}
                      </div>
                      <p className="text-sm text-gray-500">Avg. messages per conversation</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="activity">
                <Card>
                  <CardContent className="pt-6">
                    {stats.isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-locallink-primary"></div>
                      </div>
                    ) : stats.conversationsCount > 0 ? (
                      <div className="space-y-4">
                        <p>Your recent activity will be shown here.</p>
                        {/* Activity content would go here */}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No activity recorded yet.</p>
                        <p className="mt-2">Start a conversation to see your activity here!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ProfilePage;
