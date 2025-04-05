
import React, { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import { useLocation } from '@/context/LocationContext';

const SettingsPage: React.FC = () => {
  const { username, setUsername } = useUser();
  const { requestPermission } = useLocation();
  const [inputValue, setInputValue] = useState(username || '');
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isLocationPrecise, setIsLocationPrecise] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim().length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }
    
    if (inputValue.trim().length > 20) {
      toast.error('Username must be less than 20 characters');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      await setUsername(inputValue.trim());
      toast.success('Username updated successfully!');
    } catch (error) {
      console.error('Error updating username:', error);
      toast.error('Failed to update username');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleRefreshLocation = () => {
    requestPermission();
    toast.success('Refreshing location...');
  };
  
  const handleToggleNotifications = () => {
    setIsNotificationsEnabled(!isNotificationsEnabled);
    toast.success(`Notifications ${!isNotificationsEnabled ? 'enabled' : 'disabled'}`);
  };
  
  const handleToggleLocationPrecision = () => {
    setIsLocationPrecise(!isLocationPrecise);
    toast.success(`Precise location ${!isLocationPrecise ? 'enabled' : 'disabled'}`);
  };
  
  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-6">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account information
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleUpdateUsername}>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Enter a username"
                    />
                    <p className="text-sm text-gray-500">
                      This is how other users will see you
                    </p>
                  </div>
                  
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? 'Updating...' : 'Update Username'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Location Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Location Settings</CardTitle>
              <CardDescription>
                Manage how your location is used
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <Label className="text-base">Precise Location</Label>
                  <p className="text-sm text-gray-500">
                    Enable for more accurate matching with nearby users
                  </p>
                </div>
                <Switch 
                  checked={isLocationPrecise}
                  onCheckedChange={handleToggleLocationPrecision}
                />
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-base">Update Location</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Refresh your location if you've moved or if there are issues
                </p>
                <Button variant="outline" onClick={handleRefreshLocation}>
                  Refresh Location
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications about new messages and nearby users
                  </p>
                </div>
                <Switch 
                  checked={isNotificationsEnabled}
                  onCheckedChange={handleToggleNotifications}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Data</CardTitle>
              <CardDescription>
                Manage your data and privacy settings
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  LocalLink respects your privacy. We only store data necessary for the app to function.
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" className="text-red-500">
                Delete Account
              </Button>
              <Button variant="outline">
                Export Data
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;
