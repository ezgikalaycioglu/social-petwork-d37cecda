-- Remove is_available field from pet_profiles table
-- This field is being removed because all pets should be discoverable by default

-- Step 1: Drop RLS policies that depend on is_available
DROP POLICY IF EXISTS "Authenticated users can discover pets" ON pet_profiles;

-- Step 2: Drop the index that uses is_available
DROP INDEX IF EXISTS idx_pet_profiles_available_location;

-- Step 3: Drop the column
ALTER TABLE pet_profiles DROP COLUMN IF EXISTS is_available;

-- Step 4: Recreate the RLS policy without is_available dependency
-- Allow authenticated users to discover all pets with location data
CREATE POLICY "Authenticated users can discover pets"
ON pet_profiles FOR SELECT
TO authenticated
USING (
  latitude IS NOT NULL 
  AND longitude IS NOT NULL
  OR user_id = auth.uid()
);

-- Step 5: Create a new index for location queries
CREATE INDEX IF NOT EXISTS idx_pet_profiles_location 
ON pet_profiles(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;