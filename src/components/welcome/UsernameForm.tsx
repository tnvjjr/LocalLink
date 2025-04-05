
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

const UsernameForm: React.FC = () => {
  const { username, setUsername } = useUser();
  const [inputValue, setInputValue] = useState(username || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim().length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }
    
    if (inputValue.trim().length > 20) {
      toast.error('Username must be less than 20 characters');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await setUsername(inputValue.trim());
      toast.success('Username set successfully!');
    } catch (error) {
      toast.error('Failed to update username');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white shadow-md animate-fade-in">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Users className="h-6 w-6 text-locallink-accent" />
          </div>
          
          <div className="flex-grow">
            <h3 className="text-lg font-medium mb-1">Set Username</h3>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mt-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={username || "Enter username"}
                className="max-w-xs"
              />
              
              <Button 
                type="submit" 
                disabled={isSubmitting || inputValue === username}
                size="sm"
              >
                {isSubmitting ? 'Saving...' : username ? 'Update' : 'Set Username'}
              </Button>
            </form>
            
            {username && (
              <p className="mt-2 text-sm text-green-600">
                Current: <span className="font-semibold">{username}</span>
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsernameForm;
