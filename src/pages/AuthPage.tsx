
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/context/UserContext';
import PageContainer from '@/components/layout/PageContainer';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useUser();
  const location = useRouterLocation();
  
  // Get the tab query parameter
  const queryParams = new URLSearchParams(location.search);
  const defaultTab = queryParams.get('tab') === 'signup' ? 'signup' : 'signin';

  // Redirect if already logged in
  if (session) {
    return <Navigate to="/" replace />;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (username.length < 3) {
        toast.error("Username must be at least 3 characters long");
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          }
        }
      });
      
      if (error) throw error;
      
      toast.success("Account created! Please check your email to verify your account");
      
      // Navigate to welcome page
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || "Error creating account");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success("Welcome back! You have been successfully logged in");
      
      // Navigate to welcome page
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || "Error signing in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="container mx-auto flex justify-center items-center min-h-[calc(100vh-8rem)] py-8 px-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-locallink-primary rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-locallink-primary">Welcome to LocalLink</CardTitle>
            <CardDescription>Connect with people nearby, chat anonymously</CardDescription>
          </CardHeader>
          
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-gray-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a href="#" className="text-xs text-locallink-primary hover:underline">
                        Forgot password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-gray-300"
                    />
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col">
                  <Button 
                    type="submit" 
                    className="w-full mb-4 bg-locallink-primary hover:bg-locallink-primary/90" 
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  <p className="text-sm text-center text-gray-500">
                    Don't have an account? {' '}
                    <button 
                      type="button"
                      onClick={() => {
                        const element = document.querySelector('[data-state="inactive"][value="signup"]');
                        if (element && element instanceof HTMLElement) {
                          element.click();
                        }
                      }}
                      className="text-locallink-primary hover:underline font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-gray-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="border-gray-300"
                    />
                    <p className="text-xs text-gray-500">
                      This is how other users will see you. Min. 3 characters.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-gray-300"
                    />
                    <p className="text-xs text-gray-500">
                      Use at least 6 characters, including letters and numbers.
                    </p>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col">
                  <Button 
                    type="submit" 
                    className="w-full mb-4 bg-locallink-primary hover:bg-locallink-primary/90" 
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                  <p className="text-sm text-center text-gray-500">
                    Already have an account? {' '}
                    <button
                      type="button"
                      onClick={() => {
                        const element = document.querySelector('[data-state="inactive"][value="signin"]');
                        if (element && element instanceof HTMLElement) {
                          element.click();
                        }
                      }}
                      className="text-locallink-primary hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </PageContainer>
  );
};

export default AuthPage;
