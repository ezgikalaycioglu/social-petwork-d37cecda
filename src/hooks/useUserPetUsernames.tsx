import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

export const useUserPetUsernames = () => {
  const [petUsernames, setPetUsernames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserPetUsernames();
  }, []);

  const fetchUserPetUsernames = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setPetUsernames([]);
        return;
      }

      const { data: pets, error } = await supabase
        .from('pet_profiles')
        .select('pet_username')
        .eq('user_id', user.id);

      if (error) throw error;

      const usernames = pets?.map(pet => pet.pet_username).filter(Boolean) || [];
      setPetUsernames(usernames);
    } catch (error) {
      console.error('Error fetching pet usernames:', error);
      setPetUsernames([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    petUsernames,
    loading,
    refetch: fetchUserPetUsernames
  };
};