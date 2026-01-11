/**
 * Despia Native SDK Integration
 * 
 * This utility provides a unified interface for native device features
 * when running in the Despia native app wrapper. Falls back gracefully
 * when running in a standard web browser.
 */

// Check if running in Despia native environment
export const isDespiaNative = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return navigator.userAgent.includes('despia');
};

// Type definitions for Despia commands
export type DespiaCommand = 
  | 'camerapicker://'
  | 'photolibrary://'
  | 'lighthaptic://'
  | 'successhaptic://'
  | 'warninghaptic://'
  | 'errorhaptic://'
  | 'backgroundlocationon://'
  | 'backgroundlocationoff://'
  | 'getonesignalplayerid://';

export type DespiaWatchVar = 
  | 'pickerbase64'
  | 'onesignalplayerid'
  | 'backgroundlatitude'
  | 'backgroundlongitude';

interface DespiaResult {
  pickerbase64?: string;
  onesignalplayerid?: string;
  backgroundlatitude?: string;
  backgroundlongitude?: string;
}

/**
 * Execute a Despia native command
 * 
 * @param command - The Despia command to execute
 * @param watchVars - Variables to watch for the result
 * @returns The result from Despia, or null if not in native environment
 */
export const despia = async (
  command: DespiaCommand, 
  watchVars?: DespiaWatchVar[]
): Promise<DespiaResult | null> => {
  if (!isDespiaNative()) {
    console.log('[Despia] Web fallback - command not executed:', command);
    return null;
  }

  try {
    // Dynamic import for native environment only
    const { default: despiaSDK } = await import('despia-native');
    const result = await despiaSDK(command, watchVars);
    console.log('[Despia] Command executed:', command, result);
    return result;
  } catch (error) {
    console.error('[Despia] Error executing command:', command, error);
    return null;
  }
};

/**
 * Convert base64 image data to a File object for upload
 */
export const base64ToFile = (base64: string, filename: string = 'photo.jpg'): File => {
  const arr = base64.split(',');
  const mime = arr[0]?.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1] || base64);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};
