
import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useNativeCamera } from '@/hooks/useNativeCamera';
import { useHaptics } from '@/hooks/useHaptics';
import { Camera, Upload, X } from 'lucide-react';

interface PhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUploaded: (url: string) => void;
  bucketName: string;
  className?: string;
}

const PhotoUpload = ({ currentPhotoUrl, onPhotoUploaded, bucketName, className }: PhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentPhotoUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isNative, takePhoto, isCapturing } = useNativeCamera();
  const { successHaptic, errorHaptic } = useHaptics();

  const uploadPhoto = async (file: File) => {
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

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      setPreviewUrl(publicUrl);
      onPhotoUploaded(publicUrl);
      await successHaptic();

      toast({
        title: "Success!",
        description: "Photo uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      await errorHaptic();
      toast({
        title: "Upload Failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    uploadPhoto(file);
  };

  const removePhoto = () => {
    setPreviewUrl('');
    onPhotoUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = async () => {
    // Try native camera first if available
    if (isNative) {
      const file = await takePhoto();
      if (file) {
        uploadPhoto(file);
        return;
      }
    }
    // Fallback to file input
    fileInputRef.current?.click();
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative w-32 h-32">
        <Avatar
          className="w-32 h-32 border-0 cursor-pointer transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
          onClick={triggerFileInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              triggerFileInput();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={previewUrl ? 'Change photo' : 'Upload photo'}
          title={previewUrl ? 'Change photo' : 'Upload photo'}
        >
          <AvatarImage src={previewUrl} alt="Pet photo" className="object-cover" />
          <AvatarFallback className="bg-green-50 text-green-600">
            <Camera className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>
        
        {previewUrl && (
          <button
            type="button"
            onClick={removePhoto}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-600 text-white hover:bg-red-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label="Remove photo"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <Button
        type="button"
        onClick={triggerFileInput}
        disabled={uploading || isCapturing}
        className="mt-4 inline-flex items-center gap-2 px-4 h-10 rounded-full border border-green-200 bg-white text-green-700 hover:bg-green-50 focus:ring-2 focus:ring-green-300 disabled:opacity-50"
      >
        {isNative ? <Camera className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
        {uploading || isCapturing ? 'Uploading...' : previewUrl ? 'Change Photo' : isNative ? 'Take Photo' : 'Upload Photo'}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default PhotoUpload;
