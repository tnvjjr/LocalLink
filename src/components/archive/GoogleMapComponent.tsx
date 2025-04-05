
import React, { useEffect, useRef, useState } from 'react';
import { Conversation } from '@/context/ChatContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';

interface GoogleMapComponentProps {
  conversations: Conversation[];
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({ conversations }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [googleMapKey, setGoogleMapKey] = useState<string>('');
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const { user } = useUser();
  
  // Load Google Maps
  useEffect(() => {
    // Check if key is in localStorage
    const storedKey = localStorage.getItem('googleMapsApiKey');
    if (storedKey) {
      setGoogleMapKey(storedKey);
      loadGoogleMapsScript(storedKey);
    }
  }, []);
  
  // Handle map initialization
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !googleMapKey) return;
    
    const initMap = () => {
      // Default center (San Francisco)
      const defaultCenter = { lat: 37.7749, lng: -122.4194 };
      
      // Create the map
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 10,
        center: defaultCenter,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });
      
      setMap(mapInstance);
    };
    
    window.initMap = initMap;
    
    // If the Google Maps API is already loaded, initialize the map
    if (window.google && window.google.maps) {
      initMap();
    }
  }, [mapLoaded, googleMapKey]);
  
  // Add markers for conversations
  useEffect(() => {
    if (!map || !conversations.length) return;
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    // Create bounds object to fit all markers
    const bounds = new window.google.maps.LatLngBounds();
    
    // Create new markers
    const newMarkers = conversations.map(conv => {
      // Find the other participant (not the current user)
      const otherParticipant = conv.participants.find(p => p.userId !== user?.id);
      
      const position = { 
        lat: conv.location.latitude, 
        lng: conv.location.longitude 
      };
      
      // Extend bounds
      bounds.extend(position);
      
      // Create and configure marker
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: `Chat with ${otherParticipant?.username || 'Unknown'}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#4f46e5',
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: '#ffffff',
          scale: 8,
        },
      });
      
      // Create info window for each marker
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">Chat with ${otherParticipant?.username || 'Unknown'}</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">
              ${new Date(conv.startedAt).toLocaleDateString()} • ${conv.messages.length} messages
            </p>
          </div>
        `,
      });
      
      // Add click listener
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
      
      return marker;
    });
    
    // Set new markers
    setMarkers(newMarkers);
    
    // Fit map to markers if there are any
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
      
      // Set minimum zoom level
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 15) {
          map.setZoom(15);
        }
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [map, conversations, user]);
  
  const loadGoogleMapsScript = (apiKey: string) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  };
  
  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!googleMapKey) {
      toast.error('Please enter a Google Maps API key');
      return;
    }
    
    // Save API key to localStorage
    localStorage.setItem('googleMapsApiKey', googleMapKey);
    
    // Load Google Maps script
    loadGoogleMapsScript(googleMapKey);
  };
  
  if (!googleMapKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <h3 className="text-lg font-semibold mb-4">Google Maps API Key Required</h3>
        <p className="text-gray-600 mb-4 text-center">
          To view conversation locations on a map, you need to enter a Google Maps API key.
          You can get one from the <a href="https://console.cloud.google.com/google/maps-apis/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a>.
        </p>
        
        <form onSubmit={handleApiKeySubmit} className="w-full max-w-md">
          <div className="flex gap-2">
            <input
              type="text"
              value={googleMapKey}
              onChange={(e) => setGoogleMapKey(e.target.value)}
              placeholder="Enter Google Maps API Key"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </div>
    );
  }
  
  return (
    <div className="h-full">
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
};

export default GoogleMapComponent;
