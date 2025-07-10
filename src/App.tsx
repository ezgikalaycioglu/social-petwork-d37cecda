
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
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
import Events from "./pages/Events";
import PetAdventures from "./pages/PetAdventures";
import Deals from "./pages/Deals";
import BusinessDashboard from "./pages/BusinessDashboard";
import ChangelogPage from "./pages/ChangelogPage";
import Packs from "./pages/Packs";

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
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/changelog" element={<ChangelogPage />} />
                
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
                <Route path="/pet-map" element={
                  <ProtectedRoute>
                    <PetMap />
                  </ProtectedRoute>
                } />
                <Route path="/events" element={
                  <ProtectedRoute>
                    <Events />
                  </ProtectedRoute>
                } />
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
                <Route path="/packs" element={
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
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
