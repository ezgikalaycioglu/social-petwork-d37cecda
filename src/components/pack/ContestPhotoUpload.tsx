import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Camera } from 'lucide-react';
import { useNativeCamera } from '@/hooks/useNativeCamera';
import { useHaptics } from '@/hooks/useHaptics';

interface ContestPhotoUploadProps {
  onPhotoSelected: (file: File | null) => void;
  selectedPhoto: File | null;
}

const ContestPhotoUpload: React.FC<ContestPhotoUploadProps> = ({
  onPhotoSelected,
  selectedPhoto
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { isNative, takePhoto, isCapturing } = useNativeCamera();
  const { successHaptic } = useHaptics();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB.');
      return;
    }

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onPhotoSelected(file);
  };

  const removePhoto = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onPhotoSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = async () => {
    // Try native camera first if available
    if (isNative) {
      const file = await takePhoto();
      if (file) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        onPhotoSelected(file);
        await successHaptic();
        return;
      }
    }
    // Fallback to file input
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Contest submission preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-border"
          />
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
            onClick={removePhoto}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={isCapturing}
          className="w-full h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
        >
          {isNative ? <Camera className="w-8 h-8 text-muted-foreground mb-2" /> : <Upload className="w-8 h-8 text-muted-foreground mb-2" />}
          <span className="text-sm text-muted-foreground">
            {isCapturing ? 'Opening camera...' : isNative ? 'Take a photo' : 'Click to select a photo'}
          </span>
        </button>
      )}

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          JPG, PNG or GIF (max 5MB)
        </p>
      </div>

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

export default ContestPhotoUpload;