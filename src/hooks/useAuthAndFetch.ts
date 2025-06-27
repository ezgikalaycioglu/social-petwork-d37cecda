
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseAuthAndFetchOptions {
  redirectPath?: string;
  onSuccess?: (userId: string) => Promise<void>;
}

export const useAuthAndFetch = ({ redirectPath = '/auth', onSuccess }: UseAuthAndFetchOptions = {}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  const checkAuthAndFetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Önce üst seviye objeleri güvenli bir şekilde al
      const { data, error: authError } = await supabase.auth.getUser(); 

      console.log("Auth response:", { data, authError });

      // 2. Hata varsa veya kullanıcı bilgisi (data.user) yoksa kontrol et
      // data?.user kullanımı, 'data' null ise hata vermesini engeller (optional chaining)
      if (authError || !data?.user) {
        console.error('Authentication error or no user:', authError?.message || 'No user found');
        navigate(redirectPath);
        return null; // Return null to indicate no user
      }

      // 3. Artık 'user' objesinin varlığından eminiz, şimdi kullanabiliriz.
      const { user } = data;

      setUserEmail(user.email || '');

      // 4. Call the success callback if provided
      if (onSuccess) {
        await onSuccess(user.id);
      }

      return user;

    } catch (outerError) {
      // Bu catch bloğu, kodunuzdaki diğer beklenmedik hataları yakalar (örn: onSuccess içindeki bir hata)
      console.error('Caught an unexpected error during auth/fetch process:', outerError);
      toast({
        title: "An Unexpected Error Occurred",
        description: "Please try logging in again.",
        variant: "destructive",
      });
      navigate(redirectPath);
      return null;
    } finally {
      // Bu blok her zaman çalışır (return kullanılsa bile)
      setLoading(false); 
    }
  }, [navigate, toast, redirectPath, onSuccess]);

  return {
    checkAuthAndFetchData,
    loading,
    userEmail,
    setLoading,
    setUserEmail
  };
};
