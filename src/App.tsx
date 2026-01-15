
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { ReadyToPlayProvider } from "@/contexts/ReadyToPlayContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ComingSoon from "./pages/ComingSoon";
import CreatePetProfile from "./pages/CreatePetProfile";
import MyPets from "./pages/MyPets";
import EditPetProfile from "./pages/EditPetProfile";
import PetSocial from "./pages/PetSocial";
import UserSettings from "./pages/UserSettings";
import PetMap from "./pages/PetMap";
import NotFound from "./pages/NotFound";

import PetAdventures from "./pages/PetAdventures";
import Deals from "./pages/Deals";
import BusinessDashboard from "./pages/BusinessDashboard";
import Business from "./pages/Business";
import BusinessProfile from "./pages/BusinessProfile";
import ChangelogPage from "./pages/ChangelogPage";
import Packs from "./pages/Packs";
import PackDetails from "./pages/PackDetails";
import PackDiscovery from "./pages/PackDiscovery";
import PackPreview from "./pages/PackPreview";
import CreatePackForm from "./components/CreatePackForm";
import FindFriends from "./pages/FindFriends";
import BecomeSitter from "./pages/BecomeSitter";
import PetSitters from "./pages/PetSitters";
import SitterProfile from "./pages/SitterProfile";
import PublicSitterProfile from "./pages/PublicSitterProfile";
import SitterAvailability from "./pages/SitterAvailability";
import Discover from "./pages/Discover";
import Social from "./pages/Social";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import Notifications from "./pages/Notifications";
import PackSettingsPage from "./components/PackSettingsPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ChildSafety from "./pages/ChildSafety";
import DeleteAccount from "./pages/DeleteAccount";
import DeleteData from "./pages/DeleteData";
import Beta from "./pages/Beta";
import CommunityGuidelines from "./pages/CommunityGuidelines";
import Contact from "./pages/Contact";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import ReviewBooking from "./pages/ReviewBooking";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <NotificationsProvider>
            <ReadyToPlayProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <AppRoutes />
              </TooltipProvider>
            </ReadyToPlayProvider>
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const AppRoutes = () => {
  const { data: featureFlags } = useFeatureFlags();
  
  return (
    <Layout>
      <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/child-safety" element={<ChildSafety />} />
                <Route path="/changelog" element={<ChangelogPage />} />
                <Route path="/delete-account" element={<DeleteAccount />} />
                <Route path="/delete-data" element={<DeleteData />} />
                <Route path="/beta" element={<Beta />} />
                <Route path="/community-guidelines" element={<CommunityGuidelines />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/coming-soon" element={
                  <ProtectedRoute>
                    <ComingSoon />
                  </ProtectedRoute>
                } />
                <Route path="/create-pet-profile" element={
                  <ProtectedRoute>
                    <CreatePetProfile />
                  </ProtectedRoute>
                } />
                <Route path="/my-pets" element={
                  <ProtectedRoute>
                    <MyPets />
                  </ProtectedRoute>
                } />
                <Route path="/edit-pet-profile/:petId" element={
                  <ProtectedRoute>
                    <EditPetProfile />
                  </ProtectedRoute>
                } />
                <Route path="/pet-social" element={
                  <ProtectedRoute>
                    <PetSocial />
                  </ProtectedRoute>
                } />
                <Route path="/find-friends" element={
                  <ProtectedRoute>
                    <FindFriends />
                  </ProtectedRoute>
                } />
                <Route path="/pet-map" element={
                  <ProtectedRoute>
                    <PetMap />
                  </ProtectedRoute>
                } />
                <Route path="/events" element={
                  <ProtectedRoute>
                    <PetMap />
                  </ProtectedRoute>
                } />
                
                {/* Business routes - conditionally rendered based on feature flag */}
                {featureFlags?.business_section_enabled && (
                  <>
                    <Route path="/business" element={
                      <ProtectedRoute>
                        <Business />
                      </ProtectedRoute>
                    } />
                    <Route path="/business/:businessId" element={<BusinessProfile />} />
                    <Route path="/deals" element={
                      <ProtectedRoute>
                        <Deals />
                      </ProtectedRoute>
                    } />
                    <Route path="/business-dashboard" element={
                      <ProtectedRoute>
                        <BusinessDashboard />
                      </ProtectedRoute>
                    } />
                  </>
                )}
                
                <Route path="/packs" element={
                  <ProtectedRoute>
                    <Navigate to="/packs/discover" replace />
                  </ProtectedRoute>
                } />
                <Route path="/packs/discover" element={
                  <ProtectedRoute>
                    <PackDiscovery />
                  </ProtectedRoute>
                } />
                <Route path="/packs/create" element={
                  <ProtectedRoute>
                    <CreatePackForm />
                  </ProtectedRoute>
                } />
                <Route path="/packs/:packId" element={
                  <ProtectedRoute>
                    <PackPreview />
                  </ProtectedRoute>
                } />
                <Route path="/packs/:packId/settings" element={
                  <ProtectedRoute>
                    <PackSettingsPage />
                  </ProtectedRoute>
                } />
                <Route path="/packs-old" element={
                  <ProtectedRoute>
                    <Packs />
                  </ProtectedRoute>
                } />
                <Route path="/pet-adventures/:petId" element={
                  <ProtectedRoute>
                    <PetAdventures />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <UserSettings />
                  </ProtectedRoute>
                } />
                <Route path="/discover" element={
                  <ProtectedRoute>
                    <Discover />
                  </ProtectedRoute>
                } />
                <Route path="/social" element={
                  <ProtectedRoute>
                    <Social />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/create-post" element={
                  <ProtectedRoute>
                    <CreatePost />
                  </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                } />
                <Route path="/become-sitter" element={
                  <ProtectedRoute>
                    <BecomeSitter />
                  </ProtectedRoute>
                } />
                <Route path="/sitter-availability" element={
                  <ProtectedRoute>
                    <Navigate to="/pet-sitters?tab=availability" replace />
                  </ProtectedRoute>
                } />
                <Route path="/pet-sitters" element={<PetSitters />} />
                <Route path="/find-sitter" element={<Navigate to="/pet-sitters" replace />} />
                <Route path="/my-bookings" element={<Navigate to="/pet-sitters" replace />} />
                <Route path="/sitter/:sitterId" element={<SitterProfile />} />
                <Route path="/sitter/profile/:sitterId" element={<PublicSitterProfile />} />
                
                {/* Messages routes */}
                <Route path="/messages" element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } />
                <Route path="/messages/:conversationId" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
                <Route path="/review/:bookingId" element={
                  <ProtectedRoute>
                    <ReviewBooking />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
  );
};

export default App;
