import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';

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

      toast({
        title: "Success!",
        description: `${uploadedUrls.length} photo(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error('Error uploading photos:', error);
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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={photo}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
            />
            <Button
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
              onClick={() => removePhoto(index)}
              type="button"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
        
        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={triggerFileInput}
            disabled={uploading}
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">
              {uploading ? 'Uploading...' : 'Add Photo'}
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