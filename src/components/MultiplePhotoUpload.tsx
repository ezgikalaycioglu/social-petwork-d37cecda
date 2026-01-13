
import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNativeCamera } from '@/hooks/useNativeCamera';
import { useHaptics } from '@/hooks/useHaptics';
import { Upload, X, Camera, RefreshCw } from 'lucide-react';

interface MultiplePhotoUploadProps {
  currentPhotos: string[];
  onPhotosUploaded: (urls: string[]) => void;
  bucketName: string;
  className?: string;
}

const MultiplePhotoUpload = ({ currentPhotos, onPhotosUploaded, bucketName, className }: MultiplePhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<string[]>(currentPhotos);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
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
          .from(bucketName)
          .upload(fileName, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newPhotos = [...photos, ...uploadedUrls];
      
      setPhotos(newPhotos);
      onPhotosUploaded(newPhotos);
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
    onPhotosUploaded(newPhotos);
    setSelectedPhotoIndex(null);
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
    onPhotosUploaded(newPhotos);
    setSelectedPhotoIndex(null);
    await triggerFileInput();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Button
        type="button"
        onClick={triggerFileInput}
        disabled={uploading || isCapturing}
        className="inline-flex items-center gap-2 px-4 h-10 rounded-full border border-green-200 bg-white text-green-700 hover:bg-green-50 focus:ring-2 focus:ring-green-300 disabled:opacity-50"
      >
        {isNative ? <Camera className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
        {uploading || isCapturing ? 'Uploading...' : isNative ? 'Take Photos' : 'Add Photos'}
      </Button>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {photos.map((photo, index) => (
            <div 
              key={index} 
              className={`relative aspect-square group ${selectedPhotoIndex === index ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedPhotoIndex(selectedPhotoIndex === index ? null : index)}
            >
              <img
                src={photo}
                alt={`Pet photo ${index + 1}`}
                className="w-full h-full object-cover rounded-lg cursor-pointer"
              />
              
              {/* Action buttons overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRetakePhoto(index);
                  }}
                  className="w-8 h-8 rounded-full bg-white text-green-700 hover:bg-green-50 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-300"
                  aria-label={`Retake photo ${index + 1}`}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(index);
                  }}
                  className="w-8 h-8 rounded-full bg-red-600 text-white hover:bg-red-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-300"
                  aria-label={`Remove photo ${index + 1}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Quick remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto(index);
                }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white hover:bg-red-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-300 md:hidden"
                aria-label={`Remove photo ${index + 1}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

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

export default MultiplePhotoUpload;
