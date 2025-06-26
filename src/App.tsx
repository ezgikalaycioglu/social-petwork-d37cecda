
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import analyticsService from "@/services/AnalyticsService";
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

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize analytics service
    analyticsService.init();

    // Set up authentication state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Track login event
          analyticsService.trackEvent('User Logged In', {
            user_id: session.user.id,
            email: session.user.email || undefined,
          });

          // Identify user for analytics
          try {
            // Fetch user profile data for richer analytics
            const { data: userProfile } = await supabase
              .from('user_profiles')
              .select('display_name, city, neighborhood')
              .eq('id', session.user.id)
              .single();

            // Get user's pet count
            const { count: petCount } = await supabase
              .from('pet_profiles')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', session.user.id);

            analyticsService.identifyUser(session.user.id, {
              $email: session.user.email || undefined,
              $name: userProfile?.display_name || undefined,
              $created: session.user.created_at,
              pet_count: petCount || 0,
              city: userProfile?.city || undefined,
              neighborhood: userProfile?.neighborhood || undefined,
              user_type: 'pet_owner',
            });
          } catch (error) {
            // Fallback identification with minimal data
            analyticsService.identifyUser(session.user.id, {
              $email: session.user.email || undefined,
              $created: session.user.created_at,
              user_type: 'pet_owner',
            });
          }
        } else if (event === 'SIGNED_OUT') {
          // Track logout and reset analytics
          analyticsService.trackEvent('User Logged Out');
          analyticsService.reset();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/create-pet-profile" element={<CreatePetProfile />} />
            <Route path="/my-pets" element={<MyPets />} />
            <Route path="/edit-pet-profile/:petId" element={<EditPetProfile />} />
            <Route path="/pet-social" element={<PetSocial />} />
            <Route path="/pet-map" element={<PetMap />} />
            <Route path="/events" element={<Events />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/business-dashboard" element={<BusinessDashboard />} />
            <Route path="/pet-adventures/:petId" element={<PetAdventures />} />
            <Route path="/settings" element={<UserSettings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
