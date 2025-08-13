
import { useSecureDiscoverPets } from '@/hooks/useSecureDiscoverPets';

interface UseDiscoverPetsProps {
  userPetIds: string[];
  onFriendRequestSent: () => void;
}

export const useDiscoverPets = ({ userPetIds, onFriendRequestSent }: UseDiscoverPetsProps) => {
  // Redirect to secure implementation
  return useSecureDiscoverPets({ userPetIds, onFriendRequestSent });
};
