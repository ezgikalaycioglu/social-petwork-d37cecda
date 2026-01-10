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

interface PetWithOwner extends Omit<PetProfile, 'user_id'> {
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

// Sanitize search query to prevent injection attacks
function sanitizeSearchQuery(query: string): string {
  // Trim whitespace
  let sanitized = query.trim();
  
  // Limit length to prevent DoS
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }
  
  // Remove SQL special characters that could be used for injection
  // Only allow alphanumeric, spaces, hyphens, and underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-_]/g, '');
  
  return sanitized;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { petId, searchQuery, latitude, longitude, maxDistance = 50 }: SearchRequest = await req.json();

    // Validate required fields
    if (!petId || !searchQuery) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: petId, searchQuery' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate petId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(petId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid petId format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize search query
    const sanitizedQuery = sanitizeSearchQuery(searchQuery);
    if (sanitizedQuery.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid search query' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user owns this pet
    const { data: userPet, error: petError } = await supabase
      .from('pet_profiles')
      .select('id, user_id')
      .eq('id', petId)
      .eq('user_id', user.id)
      .single();

    if (petError || !userPet) {
      return new Response(
        JSON.stringify({ error: 'Pet not found or you do not own this pet' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's existing friendships to exclude
    const { data: friendships } = await supabase
      .from('pet_friendships')
      .select('requester_pet_id, recipient_pet_id')
      .or(`requester_pet_id.eq.${petId},recipient_pet_id.eq.${petId}`);

    const excludedPetIds = new Set([petId]);
    friendships?.forEach(f => {
      excludedPetIds.add(f.requester_pet_id === petId ? f.recipient_pet_id : f.requester_pet_id);
    });

    // Search for pets by username OR name using parameterized query pattern
    // The sanitized query is safe to use with ilike
    const searchPattern = `%${sanitizedQuery}%`;
    
    const { data: searchResults, error: searchError } = await supabase
      .from('pet_profiles')
      .select('id, name, breed, age, latitude, longitude, personality_traits, profile_photo_url, bio, vaccination_status, user_id, pet_username')
      .neq('id', petId)
      .neq('user_id', user.id) // Exclude user's own pets
      .or(`pet_username.ilike.${searchPattern},name.ilike.${searchPattern}`)
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
    const { data: userProfiles } = userIds.length > 0 
      ? await supabase
          .from('user_profiles')
          .select('id, display_name')
          .in('id', userIds)
      : { data: [] };

    // Create a map for quick lookup
    const userProfileMap = new Map(userProfiles?.map(profile => [profile.id, profile.display_name]) || []);

    // Transform results and calculate distances
    const results: PetWithOwner[] = [];

    for (const pet of searchResults || []) {
      // Skip if already friends or user's own pet
      if (excludedPetIds.has(pet.id)) continue;

      // Calculate distance if coordinates are available
      let distance: number | null = null;
      if (latitude !== undefined && longitude !== undefined && pet.latitude && pet.longitude) {
        distance = calculateDistance(latitude, longitude, pet.latitude, pet.longitude);
      }

      // Exclude user_id from the response for privacy
      const { user_id, pet_username, ...petData } = pet;

      results.push({
        ...petData,
        owner_name: userProfileMap.get(user_id) || null,
        distance
      });
    }

    // Sort by distance if available, otherwise by name
    results.sort((a, b) => {
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      return a.name.localeCompare(b.name);
    });

    console.log(`User ${user.id} found ${results.length} search results for query: "${sanitizedQuery}"`);

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
