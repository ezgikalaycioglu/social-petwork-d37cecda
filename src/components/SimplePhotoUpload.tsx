import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNativeCamera } from '@/hooks/useNativeCamera';
import { useHaptics } from '@/hooks/useHaptics';
import { Upload, X, Camera, RefreshCw } from 'lucide-react';

interface SimplePhotoUploadProps {
  onPhotosChange: (urls: string[]) => void;
  maxPhotos?: number;
  className?: string;
}

const SimplePhotoUpload = ({ onPhotosChange, maxPhotos = 8, className }: SimplePhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isNative, takePhoto, isCapturing } = useNativeCamera();
  const { successHaptic, errorHaptic } = useHaptics();

  const uploadPhotos = async (files: FileList) => {
    try {
      setUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to upload photos.",
          variant: "destructive",
        });
        return;
      }

      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('pet-photos')
          .upload(fileName, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('pet-photos')
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newPhotos = [...photos, ...uploadedUrls].slice(0, maxPhotos);
      
      setPhotos(newPhotos);
      onPhotosChange(newPhotos);
      await successHaptic();

      toast({
        title: "Success!",
        description: `${uploadedUrls.length} photo(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error('Error uploading photos:', error);
      await errorHaptic();
      toast({
        title: "Upload Failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxPhotos - photos.length;
    if (files.length > remainingSlots) {
      toast({
        title: "Too Many Files",
        description: `You can only upload ${remainingSlots} more photo(s).`,
        variant: "destructive",
      });
      return;
    }

    // Validate file types and sizes
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not an image file.`,
          variant: "destructive",
        });
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} is larger than 5MB.`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      const fileList = new DataTransfer();
      validFiles.forEach(file => fileList.items.add(file));
      uploadPhotos(fileList.files);
    }
  };

  const removePhoto = (indexToRemove: number) => {
    const newPhotos = photos.filter((_, index) => index !== indexToRemove);
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);
  };

  const triggerFileInput = async () => {
    // Try native camera first if available
    if (isNative) {
      const file = await takePhoto();
      if (file) {
        const fileList = new DataTransfer();
        fileList.items.add(file);
        await uploadPhotos(fileList.files);
        return;
      }
    }
    // Fallback to file input
    fileInputRef.current?.click();
  };

  const handleRetakePhoto = async (index: number) => {
    // Remove the photo at index and trigger new capture
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);
    await triggerFileInput();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative aspect-square group">
            <img
              src={photo}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
            />
            
            {/* Action buttons overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full w-8 h-8 p-0 bg-white hover:bg-green-50"
                onClick={() => handleRetakePhoto(index)}
                type="button"
                aria-label={`Retake photo ${index + 1}`}
              >
                <RefreshCw className="w-4 h-4 text-green-700" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="rounded-full w-8 h-8 p-0"
                onClick={() => removePhoto(index)}
                type="button"
                aria-label={`Remove photo ${index + 1}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Quick remove button for mobile */}
            <Button
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0 md:hidden"
              onClick={() => removePhoto(index)}
              type="button"
              aria-label={`Remove photo ${index + 1}`}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
        
        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={triggerFileInput}
            disabled={uploading || isCapturing}
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
          >
            {isNative ? <Camera className="w-8 h-8 text-gray-400 mb-2" /> : <Upload className="w-8 h-8 text-gray-400 mb-2" />}
            <span className="text-sm text-gray-500">
              {uploading || isCapturing ? 'Uploading...' : isNative ? 'Take Photo' : 'Add Photo'}
            </span>
          </button>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          JPG, PNG or GIF (max 5MB each) • {photos.length}/{maxPhotos} photos
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default SimplePhotoUpload;
