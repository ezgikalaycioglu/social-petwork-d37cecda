import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SearchRequest {
  petId: string;
  searchQuery: string;
  latitude?: number;
  longitude?: number;
  maxDistance?: number; // in kilometers, default 50
}

interface PetProfile {
  id: string;
  name: string;
  breed: string;
  age: number | null;
  latitude: number;
  longitude: number;
  personality_traits: string[] | null;
  profile_photo_url: string | null;
  bio: string | null;
  vaccination_status: string | null;
  user_id: string;
}

interface PetWithOwner extends PetProfile {
  owner_name: string | null;
  distance: number | null;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { petId, searchQuery, latitude, longitude, maxDistance = 50 }: SearchRequest = await req.json();

    if (!petId || !searchQuery) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: petId, searchQuery' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's existing friendships to exclude
    const { data: friendships } = await supabase
      .from('pet_friendships')
      .select('requester_pet_id, recipient_pet_id')
      .or(`requester_pet_id.eq.${petId},recipient_pet_id.eq.${petId}`);

    const excludedPetIds = new Set([petId]);
    friendships?.forEach(f => {
      excludedPetIds.add(f.requester_pet_id === petId ? f.recipient_pet_id : f.requester_pet_id);
    });

    // Search for pets by name only
    const { data: searchResults, error: searchError } = await supabase
      .from('pet_profiles')
      .select('*')
      .neq('id', petId)
      .eq('is_available', true)
      .ilike('name', `%${searchQuery}%`)
      .limit(20);

    if (searchError) {
      console.error('Error searching pets:', searchError);
      return new Response(
        JSON.stringify({ error: 'Failed to search pets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profiles for owner names
    const userIds = [...new Set(searchResults?.map(pet => pet.user_id) || [])];
    const { data: userProfiles } = await supabase
      .from('user_profiles')
      .select('id, display_name')
      .in('id', userIds);

    // Create a map for quick lookup
    const userProfileMap = new Map(userProfiles?.map(profile => [profile.id, profile.display_name]) || []);

    // Transform results and calculate distances
    const results: PetWithOwner[] = [];

    for (const pet of searchResults || []) {
      // Skip if already friends or user's own pet
      if (excludedPetIds.has(pet.id)) continue;

      results.push({
        id: pet.id,
        name: pet.name,
        breed: pet.breed,
        age: pet.age,
        latitude: pet.latitude,
        longitude: pet.longitude,
        personality_traits: pet.personality_traits,
        profile_photo_url: pet.profile_photo_url,
        bio: pet.bio,
        vaccination_status: pet.vaccination_status,
        user_id: pet.user_id,
        owner_name: userProfileMap.get(pet.user_id) || null,
        distance: null
      });
    }

    // Sort by distance if available, otherwise by name
    results.sort((a, b) => {
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      return a.name.localeCompare(b.name);
    });

    console.log(`Found ${results.length} search results for query: "${searchQuery}"`);

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-pet-friends function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});