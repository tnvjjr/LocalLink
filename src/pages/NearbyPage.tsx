
import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import NearbyUsers from '@/components/nearby/NearbyUsers';
import { useLocation } from '@/context/LocationContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, Mountain, Compass } from 'lucide-react';

const NearbyPage: React.FC = () => {
  const { coordinates, requestPermission } = useLocation();
  const navigate = useNavigate();
  
  if (!coordinates) {
    return (
      <PageContainer>
        <div className="container mx-auto px-4 py-12 max-w-md">
          <div className="nature-card p-8 text-center">
            <div className="mb-6">
              <div className="bg-nature-leaf/10 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <Compass className="h-12 w-12 text-nature-forest animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-nature-forest">Share Your Trail Location</h2>
            <p className="text-gray-600 mb-6">
              To discover nearby outdoor enthusiasts, we need access to your location.
            </p>
            <div className="space-y-3">
              <Button onClick={requestPermission} className="w-full outdoor-button group">
                <MapPin className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Enable Location
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')} 
                className="w-full border-nature-leaf text-nature-forest hover:bg-nature-leaf/10"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-4 max-w-md">
        <div className="bg-gradient-to-r from-nature-leaf/10 to-nature-forest/10 rounded-lg shadow-md p-4 mb-4 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="bg-white/70 backdrop-blur-sm p-2 rounded-full mr-3 animate-pulse">
              <MapPin className="h-5 w-5 text-nature-forest" />
            </div>
            <div>
              <h3 className="font-medium text-sm text-nature-forest">Your Trail Location</h3>
              <p className="text-xs text-gray-600">
                Lat: {coordinates.latitude.toFixed(6)}, Lng: {coordinates.longitude.toFixed(6)}
              </p>
              <p className="text-xs text-gray-500">
                Accuracy: ±{Math.round(coordinates.accuracy)}m
              </p>
            </div>
          </div>
          <div className="mt-3 text-xs text-nature-forest/70 italic">
            Connecting you with hikers, campers, and outdoor enthusiasts nearby...
          </div>
        </div>
        
        <div className="nature-card">
          <div className="p-4 bg-gradient-to-r from-nature-leaf/20 to-nature-forest/20 border-b border-nature-leaf/10 flex items-center">
            <Mountain className="h-5 w-5 text-nature-forest mr-2" />
            <h2 className="font-semibold text-nature-forest">Outdoor Enthusiasts Nearby</h2>
          </div>
          <NearbyUsers />
        </div>
      </div>
    </PageContainer>
  );
};

export default NearbyPage;
