
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from '@/context/UserContext';
import { LocationProvider } from '@/context/LocationContext';
import { ChatProvider } from '@/context/ChatContext';
import WelcomePage from "./pages/WelcomePage";
import NearbyPage from "./pages/NearbyPage";
import ChatPage from "./pages/ChatPage";
import ChatRequestsPage from "./pages/ChatRequestsPage";
import ArchivePage from "./pages/ArchivePage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import AuthRequired from "./components/auth/AuthRequired";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner theme="light" className="nature-card" />
      <BrowserRouter>
        <UserProvider>
          <LocationProvider>
            <ChatProvider>
              <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/nearby" element={
                  <AuthRequired>
                    <NearbyPage />
                  </AuthRequired>
                } />
                <Route path="/chat" element={
                  <AuthRequired>
                    <ChatPage />
                  </AuthRequired>
                } />
                <Route path="/chat-requests" element={
                  <AuthRequired>
                    <ChatRequestsPage />
                  </AuthRequired>
                } />
                <Route path="/archive" element={
                  <AuthRequired>
                    <ArchivePage />
                  </AuthRequired>
                } />
                <Route path="/profile" element={
                  <AuthRequired>
                    <ProfilePage />
                  </AuthRequired>
                } />
                <Route path="/settings" element={
                  <AuthRequired>
                    <SettingsPage />
                  </AuthRequired>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ChatProvider>
          </LocationProvider>
        </UserProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
