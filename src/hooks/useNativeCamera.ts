import { useState, useCallback } from 'react';
import { despia, isDespiaNative, base64ToFile } from '@/utils/despia';

interface UseNativeCameraReturn {
  isNative: boolean;
  takePhoto: () => Promise<File | null>;
  pickFromLibrary: () => Promise<File | null>;
  isCapturing: boolean;
}

/**
 * Hook for native camera functionality via Despia SDK
 * Falls back gracefully on web browsers
 */
export const useNativeCamera = (): UseNativeCameraReturn => {
  const [isCapturing, setIsCapturing] = useState(false);
  const isNative = isDespiaNative();

  const takePhoto = useCallback(async (): Promise<File | null> => {
    if (!isNative) {
      console.log('[NativeCamera] Not in native environment, use file input instead');
      return null;
    }

    setIsCapturing(true);
    try {
      const result = await despia('camerapicker://', ['pickerbase64']);
      
      if (result?.pickerbase64) {
        const file = base64ToFile(result.pickerbase64, `photo-${Date.now()}.jpg`);
        return file;
      }
      return null;
    } catch (error) {
      console.error('[NativeCamera] Error taking photo:', error);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [isNative]);

  const pickFromLibrary = useCallback(async (): Promise<File | null> => {
    if (!isNative) {
      console.log('[NativeCamera] Not in native environment, use file input instead');
      return null;
    }

    setIsCapturing(true);
    try {
      const result = await despia('photolibrary://', ['pickerbase64']);
      
      if (result?.pickerbase64) {
        const file = base64ToFile(result.pickerbase64, `photo-${Date.now()}.jpg`);
        return file;
      }
      return null;
    } catch (error) {
      console.error('[NativeCamera] Error picking from library:', error);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [isNative]);

  return {
    isNative,
    takePhoto,
    pickFromLibrary,
    isCapturing,
  };
};
