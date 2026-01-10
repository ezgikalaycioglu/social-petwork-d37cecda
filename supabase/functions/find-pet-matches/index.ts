import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MatchRequest {
  petId: string;
  latitude: number;
  longitude: number;
  radius?: number; // in kilometers, default 5
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
  boop_count: number;
  user_id: string;
}

interface MatchedPet extends Omit<PetProfile, 'user_id'> {
  compatibilityScore: number;
  distance: number;
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

// Calculate compatibility score based on various factors
function calculateCompatibilityScore(userPet: PetProfile, candidatePet: PetProfile, distance: number): number {
  let score = 0;

  // 1. Age compatibility (20 points)
  if (userPet.age && candidatePet.age) {
    const ageDiff = Math.abs(userPet.age - candidatePet.age);
    if (ageDiff <= 1) score += 20;
    else if (ageDiff <= 2) score += 15;
    else if (ageDiff <= 3) score += 10;
    else if (ageDiff <= 5) score += 5;
  } else {
    score += 10; // neutral score if age unknown
  }

  // 2. Personality traits compatibility (30 points)
  const userTraits = userPet.personality_traits || [];
  const candidateTraits = candidatePet.personality_traits || [];
  
  if (userTraits.length > 0 && candidateTraits.length > 0) {
    const commonTraits = userTraits.filter(trait => candidateTraits.includes(trait));
    const compatibilityRatio = commonTraits.length / Math.max(userTraits.length, candidateTraits.length);
    score += Math.floor(compatibilityRatio * 30);
  } else {
    score += 15; // neutral score if traits unknown
  }

  // 3. Energy level and play style (30 points)
  // Infer energy level from personality traits
  const highEnergyTraits = ['playful', 'energetic', 'active', 'bouncy', 'hyperactive'];
  const calmTraits = ['calm', 'gentle', 'relaxed', 'quiet', 'peaceful'];
  
  const userEnergyLevel = getEnergyLevel(userTraits, highEnergyTraits, calmTraits);
  const candidateEnergyLevel = getEnergyLevel(candidateTraits, highEnergyTraits, calmTraits);
  
  const energyDiff = Math.abs(userEnergyLevel - candidateEnergyLevel);
  if (energyDiff <= 1) score += 30;
  else if (energyDiff <= 2) score += 20;
  else score += 10;

  // 4. Size/breed compatibility (20 points)
  const breedScore = calculateBreedCompatibility(userPet.breed, candidatePet.breed);
  score += breedScore;

  // 5. Distance penalty (subtract points based on distance)
  const distancePenalty = Math.min(distance * 2, 10); // max 10 point penalty
  score = Math.max(0, score - distancePenalty);

  return Math.min(100, score);
}

function getEnergyLevel(traits: string[], highEnergyTraits: string[], calmTraits: string[]): number {
  const highCount = traits.filter(trait => highEnergyTraits.includes(trait.toLowerCase())).length;
  const calmCount = traits.filter(trait => calmTraits.includes(trait.toLowerCase())).length;
  
  if (highCount > calmCount) return 3; // high energy
  if (calmCount > highCount) return 1; // low energy
  return 2; // medium energy
}

function calculateBreedCompatibility(breed1: string, breed2: string): number {
  // Simplified breed compatibility
  const smallBreeds = ['chihuahua', 'yorkshire', 'pomeranian', 'maltese', 'pug', 'french bulldog'];
  const mediumBreeds = ['beagle', 'cocker spaniel', 'border collie', 'australian shepherd'];
  const largeBreeds = ['golden retriever', 'labrador', 'german shepherd', 'rottweiler'];
  
  const getBreedSize = (breed: string) => {
    const lowerBreed = breed.toLowerCase();
    if (smallBreeds.some(b => lowerBreed.includes(b))) return 'small';
    if (mediumBreeds.some(b => lowerBreed.includes(b))) return 'medium';
    if (largeBreeds.some(b => lowerBreed.includes(b))) return 'large';
    return 'unknown';
  };

  const size1 = getBreedSize(breed1);
  const size2 = getBreedSize(breed2);

  if (size1 === size2) return 20;
  if ((size1 === 'small' && size2 === 'medium') || (size1 === 'medium' && size2 === 'small')) return 15;
  if ((size1 === 'medium' && size2 === 'large') || (size1 === 'large' && size2 === 'medium')) return 15;
  if (size1 === 'unknown' || size2 === 'unknown') return 10;
  return 5; // small with large
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

    const { petId, latitude, longitude, radius = 5 }: MatchRequest = await req.json();

    // Validate required fields
    if (!petId || latitude === undefined || longitude === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: petId, latitude, longitude' }),
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

    // Validate latitude and longitude are valid numbers
    if (typeof latitude !== 'number' || typeof longitude !== 'number' ||
        latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return new Response(
        JSON.stringify({ error: 'Invalid latitude or longitude values' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate radius
    const safeRadius = Math.min(Math.max(1, radius), 100); // Limit radius between 1 and 100 km

    // Get user's pet profile and verify ownership
    const { data: userPet, error: userPetError } = await supabase
      .from('pet_profiles')
      .select('*')
      .eq('id', petId)
      .eq('user_id', user.id)
      .single();

    if (userPetError || !userPet) {
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

    // Query for nearby pets within radius (RLS will apply)
    const { data: nearbyPets, error: petsError } = await supabase
      .from('pet_profiles')
      .select('id, name, breed, age, latitude, longitude, personality_traits, profile_photo_url, bio, vaccination_status, boop_count, user_id')
      .neq('id', petId)
      .neq('user_id', user.id) // Exclude user's own pets
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (petsError) {
      console.error('Error fetching pets:', petsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch pets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter pets by distance and calculate compatibility scores
    const matches: MatchedPet[] = [];

    for (const pet of nearbyPets || []) {
      // Skip if already friends or user's own pet
      if (excludedPetIds.has(pet.id)) continue;

      const distance = calculateDistance(latitude, longitude, pet.latitude, pet.longitude);
      
      // Only include pets within radius
      if (distance <= safeRadius) {
        const compatibilityScore = calculateCompatibilityScore(userPet, pet, distance);
        
        // Exclude user_id from the response for privacy
        const { user_id, ...petWithoutUserId } = pet;
        
        matches.push({
          ...petWithoutUserId,
          compatibilityScore,
          distance: Math.round(distance * 10) / 10 // round to 1 decimal
        });
      }
    }

    // Sort by compatibility score (highest first) and limit to top 10
    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    const topMatches = matches.slice(0, 10);

    console.log(`User ${user.id} found ${matches.length} potential matches, returning top ${topMatches.length}`);

    return new Response(
      JSON.stringify({ matches: topMatches }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in find-pet-matches function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
