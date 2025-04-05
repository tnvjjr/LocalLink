
import React from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/context/LocationContext';
import { Card, CardContent } from '@/components/ui/card';

const LocationPermission: React.FC = () => {
  const { coordinates, loading, error, requestPermission } = useLocation();

  return (
    <Card className="bg-white shadow-md animate-fade-in">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <MapPin className="h-6 w-6 text-locallink-primary" />
          </div>
          
          <div className="flex-grow">
            <h3 className="text-lg font-medium mb-1">Location Access</h3>
            
            {!coordinates && !error && (
              <p className="text-gray-600 text-sm mb-2">
                Enable location to find nearby users
              </p>
            )}
            
            {error && (
              <p className="text-red-500 text-sm mb-2">
                {error}
              </p>
            )}
            
            {coordinates && (
              <div className="text-green-600 text-sm mb-2 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Location enabled
              </div>
            )}
          </div>
          
          <Button
            onClick={requestPermission}
            disabled={loading || !!coordinates}
            size="sm"
            variant={coordinates ? "outline" : "default"}
            className={coordinates ? "text-green-600 border-green-200" : ""}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading
              </div>
            ) : coordinates ? (
              'Location Active'
            ) : (
              'Enable Location'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationPermission;
