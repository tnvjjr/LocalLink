import React from 'react';
import Header from './Header';
import { MapPin } from 'lucide-react';

type PageContainerProps = {
  children: React.ReactNode;
  fullHeight?: boolean;
};

const PageContainer: React.FC<PageContainerProps> = ({ children, fullHeight = false }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`flex-1 ${fullHeight ? 'pt-16 pb-0' : 'pt-24 pb-8'}`}>
        {children}
      </main>
      
      {!fullHeight && (
        <footer className="bg-nature-forest py-8 text-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <MapPin className="h-6 w-6 mr-2" />
                <span className="font-nature font-bold text-xl">LocalLink</span>
                <span className="text-sm ml-2 font-semibold text-nature-leaf">Outdoor</span>
              </div>
              
              <div className="text-sm text-white/70">
                &copy; {new Date().getFullYear()} LocalLink Outdoor. Connect with nature lovers.
                <div className="mt-2">
                  Created by Evan Zhou, Sathvik Haridasu, Vijay Shrivarshan Vijayaraja, and Vikky Mutchukota
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default PageContainer;
