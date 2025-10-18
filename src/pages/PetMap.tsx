
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PawPrint, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CreatePetProfileForm from '@/components/CreatePetProfileForm';
import InteractiveMap from '@/components/InteractiveMap';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

const PetMap = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      console.log('Checking authentication...');
      
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Auth error:', userError);
        throw userError;
      }
      
      if (!currentUser) {
        console.log('No user found, redirecting to auth');
        navigate('/auth');
        return;
      }

      console.log('User authenticated:', currentUser.id);
      setUser(currentUser);
      await fetchUserPets(currentUser.id);
    } catch (error) {
      console.error('Error checking auth:', error);
      toast({
        title: "Authentication Error",
        description: "Please log in to access the pet map.",
        variant: "destructive",
      });
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPets = async (userId: string) => {
    try {
      console.log('Fetching user pets for:', userId);
      
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pets:', error);
        throw error;
      }

      console.log('Fetched pets:', data);
      setPets(data || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
      toast({
        title: "Error",
        description: "Failed to load your pets.",
        variant: "destructive",
      });
    }
  };

  const handleLocationPermissionChange = (granted: boolean) => {
    // Location permission changes are handled by the icon tooltip on mobile
    // No toasts needed here
  };

  const handlePetCreated = async () => {
    setIsCreateModalOpen(false);
    if (user) {
      await fetchUserPets(user.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <PawPrint className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading pet map...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <PawPrint className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access the pet map.</p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            🗺️ Pet Map
          </h1>
          <p className="text-gray-600 mt-1">
            Find pets near you and share your location when ready to play!
          </p>
        </div>

        {pets.length === 0 ? (
          <div className="text-center py-12">
            <PawPrint className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No pets yet!</h2>
            <p className="text-gray-600 mb-6">Create a pet profile first to use the pet map.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Create Pet Profile
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between bg-white/50 border-blue-300 text-blue-900 hover:bg-white/70">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">i</span>
                      </div>
                      Privacy Notice
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <p className="text-sm text-blue-800">
                    Your location will only be shared with others when you toggle "Ready to Play" ON. You can turn it off anytime to stop sharing your location.
                    <br /><br />
                    <strong>Important Note:</strong> When you switch "Ready to Play" OFF, our application will stop actively receiving and storing your location information in our database. 
                    However, the location access permission you previously granted to our application (through your browser or device settings) will remain active until you manually revoke it.
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Interactive Map */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <InteractiveMap 
                userPets={pets}
                onLocationPermissionChange={handleLocationPermissionChange}
                showLocationToasts={true}
              />
            </div>

            {/* Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">🟢 Ready to Play</h3>
                <p className="text-sm text-green-800">
                  Toggle this ON to share your location and appear on the map for other pet owners to see.
                </p>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-medium text-orange-900 mb-2">🐾 Find Friends</h3>
                <p className="text-sm text-orange-800">
                  Click on pet markers to see their profiles and connect with nearby pet owners.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Pet Profile Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create New Pet Profile</DialogTitle>
            <p className="text-muted-foreground">Add a new furry friend to your family</p>
          </DialogHeader>
          <CreatePetProfileForm onSuccess={handlePetCreated} showHeader={false} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PetMap;
