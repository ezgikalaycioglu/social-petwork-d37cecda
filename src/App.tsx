
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
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
          <Route path="/settings" element={<UserSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
