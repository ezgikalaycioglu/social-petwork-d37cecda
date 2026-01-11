import { useCallback } from 'react';
import { despia, isDespiaNative } from '@/utils/despia';

interface UseHapticsReturn {
  isNative: boolean;
  lightHaptic: () => Promise<void>;
  successHaptic: () => Promise<void>;
  warningHaptic: () => Promise<void>;
  errorHaptic: () => Promise<void>;
}

/**
 * Hook for native haptic feedback via Despia SDK
 * Silently no-ops on web browsers
 */
export const useHaptics = (): UseHapticsReturn => {
  const isNative = isDespiaNative();

  const lightHaptic = useCallback(async () => {
    if (!isNative) return;
    await despia('lighthaptic://');
  }, [isNative]);

  const successHaptic = useCallback(async () => {
    if (!isNative) return;
    await despia('successhaptic://');
  }, [isNative]);

  const warningHaptic = useCallback(async () => {
    if (!isNative) return;
    await despia('warninghaptic://');
  }, [isNative]);

  const errorHaptic = useCallback(async () => {
    if (!isNative) return;
    await despia('errorhaptic://');
  }, [isNative]);

  return {
    isNative,
    lightHaptic,
    successHaptic,
    warningHaptic,
    errorHaptic,
  };
};
