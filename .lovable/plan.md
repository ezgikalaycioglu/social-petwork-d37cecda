

## Fix: Exclude User's Own Pets from "Pets Nearby" Counter

### Problem
The pet counter badge shows "3 pets nearby" but this includes the user's own pets. The counter should only show other users' pets that are nearby.

### Root Cause
In `src/components/InteractiveMap.tsx`:
- Line 506 displays `nearbyPets.length` directly
- The `nearbyPets` state contains ALL pets with locations (including the current user's pets)
- No filtering is applied before displaying the count

### Solution
Filter out the current user's pets when displaying the counter, while still keeping them in `nearbyPets` for map rendering (since users should still see their own pets on the map).

### File to Modify
**`src/components/InteractiveMap.tsx`**

### Changes Required

1. **Store the current user ID** in state so it's available for filtering:
   ```tsx
   const [currentUserId, setCurrentUserId] = useState<string | null>(null);
   ```

2. **Update `fetchNearbyPets`** to save the user ID:
   ```tsx
   const { data: { user } } = await supabase.auth.getUser();
   if (user) {
     setCurrentUserId(user.id);
   }
   ```

3. **Calculate filtered count** for the display (around line 506):
   ```tsx
   // Calculate count of OTHER users' pets only
   const otherUsersPetsCount = nearbyPets.filter(
     pet => pet.user_id !== currentUserId
   ).length;
   ```

4. **Update the counter display** to use the filtered count:
   ```tsx
   <span className="text-xs sm:text-sm font-medium">{otherUsersPetsCount}</span>
   ```

### Summary
| What | Change |
|------|--------|
| Add state | `currentUserId` to track logged-in user |
| Filter pets | Exclude pets where `user_id === currentUserId` |
| Display | Show only other users' pet count in the badge |

This ensures users see an accurate count of **other pets** they can discover and potentially arrange playdates with, while still seeing all pets (including their own) on the map itself.

