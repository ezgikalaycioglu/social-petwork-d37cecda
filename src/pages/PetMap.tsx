
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PawPrint } from 'lucide-react';
import Layout from '@/components/Layout';
import InteractiveMap from '@/components/InteractiveMap';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

const PetMap = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      await fetchUserPets(user.id);
    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPets = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
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
    if (granted) {
      toast({
        title: "Location Enabled",
        description: "You can now find pets near you and share your location!",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <PawPrint className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-gray-600">Loading pet map...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
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
                onClick={() => navigate('/create-pet-profile')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Create Pet Profile
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Privacy Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">Privacy Notice</h3>
                    <p className="text-sm text-blue-800">
                      Your location will only be shared with others when you toggle "Ready to Play" ON. 
                      You can turn it off anytime to stop sharing your location.
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Map */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <InteractiveMap 
                  userPets={pets}
                  onLocationPermissionChange={handleLocationPermissionChange}
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
      </div>
    </Layout>
  );
};

export default PetMap;
