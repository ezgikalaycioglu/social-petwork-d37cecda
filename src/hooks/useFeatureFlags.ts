import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FeatureFlags {
  business_section_enabled: boolean;
  pet_sitters_enabled: boolean;
  packs_enabled: boolean;
}

export const useFeatureFlags = () => {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_configurations')
        .select('key, value');

      if (error) {
        console.error('Error fetching feature flags:', error);
        // Return defaults if fetch fails
        return {
          business_section_enabled: false,
          pet_sitters_enabled: true,
          packs_enabled: true,
        } as FeatureFlags;
      }

      // Transform array into object with defaults
      const flags: FeatureFlags = {
        business_section_enabled: false,
        pet_sitters_enabled: true,
        packs_enabled: true,
      };
      
      data?.forEach((config) => {
        if (config.key in flags) {
          flags[config.key as keyof FeatureFlags] = config.value;
        }
      });

      return flags;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,
  });
};
