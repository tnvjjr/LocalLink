
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, MessageSquare, Clock, User, Menu, X, Mountain, Leaf } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Header: React.FC = () => {
  const location = useLocation();
  const { user, username, signOut } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Handle scroll effect for transparent/solid header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-10 transition-all duration-300 ${
      scrolled ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className={`p-2 rounded-full ${scrolled ? 'bg-nature-leaf/10' : 'bg-white/20 backdrop-blur-sm'} 
              transition-colors duration-300 group-hover:bg-nature-leaf/20`}>
              <MapPin className="h-6 w-6 text-nature-forest animate-pulse" />
            </div>
            <span className={`font-nature font-bold text-xl ${
              scrolled ? 'text-nature-forest' : 'text-nature-forest'
            } transition-colors duration-300`}>LocalLink</span>
            <span className="text-sm font-medium bg-gradient-to-r from-nature-forest to-nature-leaf bg-clip-text text-transparent">
              Outdoor
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <nav className="flex space-x-2 mr-4">
              <Link 
                to="/nearby" 
                className={`px-4 py-2 rounded-md flex items-center transition-all duration-300 ${
                  location.pathname === '/nearby' 
                    ? 'bg-nature-forest text-white font-semibold shadow-md' 
                    : `${scrolled ? 'hover:bg-nature-leaf/10' : 'hover:bg-white/20'}`
                }`}
              >
                <MapPin className="mr-2 h-5 w-5" />
                <span>Nearby</span>
              </Link>
              
              <Link 
                to="/chat" 
                className={`px-4 py-2 rounded-md flex items-center transition-all duration-300 ${
                  location.pathname === '/chat' 
                    ? 'bg-nature-forest text-white font-semibold shadow-md' 
                    : `${scrolled ? 'hover:bg-nature-leaf/10' : 'hover:bg-white/20'}`
                }`}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                <span>Chat</span>
              </Link>
              
              <Link 
                to="/archive" 
                className={`px-4 py-2 rounded-md flex items-center transition-all duration-300 ${
                  location.pathname === '/archive' 
                    ? 'bg-nature-forest text-white font-semibold shadow-md' 
                    : `${scrolled ? 'hover:bg-nature-leaf/10' : 'hover:bg-white/20'}`
                }`}
              >
                <Clock className="mr-2 h-5 w-5" />
                <span>Archive</span>
              </Link>
            </nav>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full overflow-hidden">
                    <Avatar className="h-10 w-10 border-2 border-nature-leaf/20 transition-all hover:border-nature-leaf">
                      <AvatarFallback className="bg-gradient-forest text-white">
                        {username ? getInitials(username) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 nature-card">
                  <DropdownMenuLabel className="text-nature-forest">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-nature-leaf/10" />
                  <DropdownMenuItem asChild className="hover:bg-nature-leaf/10 cursor-pointer">
                    <Link to="/profile" className="w-full flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-nature-leaf/10 cursor-pointer">
                    <Link to="/settings" className="w-full flex items-center">
                      <Mountain className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-nature-leaf/10" />
                  <DropdownMenuItem onClick={signOut} className="hover:bg-red-50 cursor-pointer text-red-500">
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                asChild 
                variant="default" 
                className="bg-nature-forest hover:bg-nature-leaf text-white transition-colors"
              >
                <Link to="/auth">
                  <Leaf className="mr-2 h-4 w-4" />
                  Join Us
                </Link>
              </Button>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? 
              <X className={`h-6 w-6 ${scrolled ? 'text-nature-forest' : 'text-nature-forest'}`} /> : 
              <Menu className={`h-6 w-6 ${scrolled ? 'text-nature-forest' : 'text-nature-forest'}`} />
            }
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden animate-fade-in bg-white/95 backdrop-blur-md shadow-lg rounded-lg mt-2 border border-nature-leaf/10 overflow-hidden">
            <nav className="flex flex-col py-2">
              <Link 
                to="/nearby" 
                className={`px-4 py-3 flex items-center ${
                  location.pathname === '/nearby' 
                    ? 'bg-nature-leaf/20 text-nature-forest' 
                    : 'hover:bg-nature-leaf/10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <MapPin className="mr-3 h-5 w-5" />
                <span>Nearby Explorers</span>
              </Link>
              
              <Link 
                to="/chat" 
                className={`px-4 py-3 flex items-center ${
                  location.pathname === '/chat' 
                    ? 'bg-nature-leaf/20 text-nature-forest' 
                    : 'hover:bg-nature-leaf/10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <MessageSquare className="mr-3 h-5 w-5" />
                <span>Trail Chat</span>
              </Link>
              
              <Link 
                to="/archive" 
                className={`px-4 py-3 flex items-center ${
                  location.pathname === '/archive' 
                    ? 'bg-nature-leaf/20 text-nature-forest' 
                    : 'hover:bg-nature-leaf/10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Clock className="mr-3 h-5 w-5" />
                <span>Adventure Archive</span>
              </Link>
              
              {!user && (
                <Link
                  to="/auth"
                  className="mt-2 mx-4 mb-2 py-2 bg-gradient-forest text-white rounded-md flex items-center justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="mr-2 h-5 w-5" />
                  <span>Sign In</span>
                </Link>
              )}
              
              {user && (
                <>
                  <div className="border-t border-nature-leaf/10 my-2"></div>
                  <Link
                    to="/profile"
                    className="px-4 py-3 flex items-center hover:bg-nature-leaf/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="mr-3 h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="px-4 py-3 flex items-center hover:bg-nature-leaf/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Mountain className="mr-3 h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 flex items-center text-red-500 hover:bg-red-50"
                  >
                    <Leaf className="mr-3 h-5 w-5" />
                    <span>Log Out</span>
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
