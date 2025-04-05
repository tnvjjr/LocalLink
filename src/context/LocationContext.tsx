
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './UserContext';

// Define types for location data
type Coordinates = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

type LocationContextType = {
  coordinates: Coordinates | null;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
};

// Create context
const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const { user } = useUser();

  // Clean up geolocation watcher when component unmounts
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Update location in Supabase when coordinates change and user is logged in
  useEffect(() => {
    if (coordinates && user) {
      updateLocationInDatabase(coordinates);
    }
  }, [coordinates, user]);

  const updateLocationInDatabase = async (coords: Coordinates) => {
    if (!user) return;
    
    try {
      // Convert to PostgreSQL/PostGIS point format
      const point = `POINT(${coords.longitude} ${coords.latitude})`;
      
      const { error } = await supabase
        .from('user_locations')
        .upsert(
          { 
            user_id: user.id, 
            location: point,
            last_updated: new Date().toISOString() 
          },
          { onConflict: 'user_id' }
        );
        
      if (error) throw error;
    } catch (err) {
      console.error('Error updating location in database:', err);
    }
  };

  const requestPermission = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      // Request permission and start watching position
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`Location received: lat ${latitude}, lng ${longitude}, accuracy ${accuracy}m`);
          setCoordinates({ latitude, longitude, accuracy });
          setLoading(false);
        },
        (err) => {
          let errorMessage = 'Unknown error occurred';
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'You denied the request for geolocation';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case err.TIMEOUT:
              errorMessage = 'The request to get your location timed out';
              break;
          }
          
          console.error(`Geolocation error: ${errorMessage}`);
          setError(errorMessage);
          setLoading(false);
          toast.error(errorMessage);
        },
        { 
          enableHighAccuracy: true, 
          maximumAge: 10000, 
          timeout: 5000 
        }
      );

      setWatchId(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error(`Location permission error: ${errorMessage}`);
      setError(errorMessage);
      setLoading(false);
      toast.error(errorMessage);
    }
  };

  const value = {
    coordinates,
    loading,
    error,
    requestPermission,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
