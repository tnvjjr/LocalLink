
import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { MapPin, MessageSquare, Clock, User, Mountain, Leaf, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useUser();
  
  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero section */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
          <div className="flex-1 text-left">
            <div className="mb-2">
              <span className="inline-block bg-nature-leaf/10 text-nature-forest px-4 py-1 rounded-full text-sm font-semibold animate-pulse">
                Connect with Nature Lovers
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-6 text-shimmer leading-tight">
              Discover Outdoor <br/> Connections Nearby
            </h1>
            <p className="text-xl text-gray-700 mb-8 animate-fade-in">
              LocalLink connects you with outdoor enthusiasts in your area. Chat while hiking, biking, or exploring the wilderness together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {session ? (
                <Button 
                  onClick={() => navigate('/nearby')} 
                  className="outdoor-button group"
                >
                  <MapPin className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                  Find Nearby Explorers
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => navigate('/auth')} 
                    className="outdoor-button group"
                  >
                    <User className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                    Join the Adventure
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth?tab=signup')} 
                    variant="outline"
                    className="border-nature-leaf text-nature-forest hover:text-nature-leaf hover:border-nature-forest transition-colors"
                  >
                    Create Account
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <div className="bg-gradient-to-br from-nature-leaf/20 to-nature-sky/20 rounded-2xl p-6 shadow-xl overflow-hidden">
                <div className="relative z-10">
                  <img 
                    src="/locallink-hero.svg" 
                    alt="LocalLink illustration" 
                    className="w-full h-auto animate-float"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                  <div className="absolute top-5 left-10 animate-float" style={{animationDelay: '0.5s'}}>
                    <Leaf size={20} />
                  </div>
                  <div className="absolute top-20 right-10 animate-float" style={{animationDelay: '1.2s'}}>
                    <Leaf size={24} />
                  </div>
                  <div className="absolute bottom-10 left-20 animate-float" style={{animationDelay: '0.8s'}}>
                    <Leaf size={16} />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-3 shadow-lg animate-pulse">
                <div className="bg-nature-forest rounded-full w-16 h-16 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-2 text-center text-nature-forest animate-fade-in">Explore the Outdoors Together</h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">Find like-minded outdoor enthusiasts and create meaningful connections through shared adventures</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="nature-card transform transition-all duration-300 hover:scale-105 hover:-rotate-1">
              <div className="h-32 bg-gradient-forest flex items-center justify-center">
                <MapPin className="h-16 w-16 text-white animate-pulse" />
              </div>
              <div className="p-8">
                <h3 className="text-xl font-semibold mb-3 text-nature-forest">Discover Trails Together</h3>
                <p className="text-gray-600">
                  Find and connect with outdoor enthusiasts in your area to explore new trails and adventures.
                </p>
              </div>
            </div>
            
            <div className="nature-card transform transition-all duration-300 hover:scale-105">
              <div className="h-32 bg-gradient-sunset flex items-center justify-center">
                <MessageSquare className="h-16 w-16 text-white animate-pulse" />
              </div>
              <div className="p-8">
                <h3 className="text-xl font-semibold mb-3 text-nature-forest">Share Wilderness Tips</h3>
                <p className="text-gray-600">
                  Exchange knowledge about local flora, fauna, and hidden spots with fellow nature lovers.
                </p>
              </div>
            </div>
            
            <div className="nature-card transform transition-all duration-300 hover:scale-105 hover:rotate-1">
              <div className="h-32 bg-gradient-mountain flex items-center justify-center">
                <Mountain className="h-16 w-16 text-white animate-pulse" />
              </div>
              <div className="p-8">
                <h3 className="text-xl font-semibold mb-3 text-nature-forest">Map Your Adventures</h3>
                <p className="text-gray-600">
                  Track your outdoor conversations and revisit amazing locations you discovered together.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Testimonial section */}
        <div className="mt-20 leaf-bg rounded-2xl p-10">
          <h2 className="text-3xl font-bold mb-8 text-center text-nature-forest">Trail Stories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/70 backdrop-blur p-6 rounded-xl shadow-sm border border-nature-leaf/20 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <p className="text-gray-600 mb-4 italic">
                "LocalLink helped me find a group of mountain bikers in my area. We now meet every weekend for new trails and adventures!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 nature-icon-bg">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-nature-forest">Sarah K.</p>
                  <p className="text-sm text-gray-500">Mountain Biker</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur p-6 rounded-xl shadow-sm border border-nature-leaf/20 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <p className="text-gray-600 mb-4 italic">
                "When hiking in a new national park, I connected with a local guide who showed me hidden waterfalls and amazing viewpoints!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 nature-icon-bg">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-nature-forest">Mike T.</p>
                  <p className="text-sm text-gray-500">Hiker & Photographer</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 mb-10 text-center">
          <div className="bg-gradient-forest rounded-2xl py-14 px-6 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-[10%] animate-float">
                <Sun className="h-16 w-16 text-white" />
              </div>
              <div className="absolute bottom-10 right-[10%] animate-float" style={{animationDelay: '1.5s'}}>
                <Leaf className="h-24 w-24 text-white" />
              </div>
              <div className="absolute top-[40%] right-[25%] animate-float" style={{animationDelay: '1s'}}>
                <Mountain className="h-20 w-20 text-white" />
              </div>
            </div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold mb-4 text-white">Ready to explore the outdoors?</h2>
              <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                Join our community of outdoor enthusiasts today and start making meaningful connections in nature.
              </p>
              <Button 
                onClick={() => navigate(session ? '/nearby' : '/auth')} 
                size="lg"
                className="bg-white text-nature-forest hover:bg-white/90 hover:scale-105 transition-all"
              >
                {session ? 'Find Nearby Explorers' : 'Join the Adventure'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default WelcomePage;
