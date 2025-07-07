
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PawPrint } from 'lucide-react';
import Layout from '@/components/Layout';
import PetMapInterface from '@/components/PetMapInterface';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

export interface PetMapFilters {
  readyToPlay: boolean;
  petSizes: string[];
  personalities: string[];
  openForAdoption: boolean;
  searchQuery: string;
}

const PetMap = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filters, setFilters] = useState<PetMapFilters>({
    readyToPlay: false,
    petSizes: [],
    personalities: [],
    openForAdoption: false,
    searchQuery: ''
  });

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
    if (granted) {
      toast({
        title: "Location Enabled",
        description: "You can now find pets near you and share your location!",
      });
    } else {
      toast({
        title: "Location Disabled",
        description: "Enable location access for the full pet map experience.",
        variant: "destructive",
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

  if (!user) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                🗺️ Pet Discovery Map
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Find amazing pets near you, schedule playdates, and join the local pet community!
              </p>
            </div>

            {pets.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                  <PawPrint className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                  <h2 className="text-2xl font-semibold text-gray-700 mb-4">Create Your First Pet Profile</h2>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Start your pet's social journey by creating a profile. Once you have a pet profile, 
                    you can discover other pets, schedule playdates, and join the community!
                  </p>
                  <button
                    onClick={() => navigate('/create-pet-profile')}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Create Pet Profile
                  </button>
                </div>
              </div>
            ) : (
              <PetMapInterface 
                userPets={pets}
                onLocationPermissionChange={handleLocationPermissionChange}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PetMap;
