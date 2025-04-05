
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type UserContextType = {
  userId: string;
  username: string;
  setUsername: (name: string) => void;
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [username, setUsernameState] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth listener and check for existing session
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setUserId(session?.user?.id || '');
        
        // Only handle profile fetching after a delay to avoid recursion
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setUserId(session?.user?.id || '');
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
        
        // Fallback to local storage for non-authenticated users
        const storedUserId = localStorage.getItem('proximichat-userId');
        const storedUsername = localStorage.getItem('proximichat-username');
        
        if (storedUserId) {
          setUserId(storedUserId);
        }
        
        if (storedUsername) {
          setUsernameState(storedUsername);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setUsernameState(data.username);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Store username in Supabase or local storage when it changes
  const handleSetUsername = async (name: string) => {
    if (name === username) return;
    
    setUsernameState(name);
    
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ username: name })
          .eq('id', user.id);
          
        if (error) throw error;
        
        toast.success('Username updated successfully!');
      } catch (error) {
        console.error('Error updating username:', error);
        toast.error('Failed to update username');
      }
    } else {
      // Fallback to local storage for non-authenticated users
      localStorage.setItem('proximichat-username', name);
      toast.success('Username set successfully!');
    }
  };

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
  };

  const value = {
    userId,
    username,
    setUsername: handleSetUsername,
    session,
    user,
    signOut,
    isLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
