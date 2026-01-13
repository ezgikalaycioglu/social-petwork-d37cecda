import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Camera, RefreshCw } from 'lucide-react';
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

  const handleRetake = async () => {
    // Clear current and trigger new capture
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onPhotoSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    await triggerFileInput();
  };

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative group">
          <img
            src={previewUrl}
            alt="Contest submission preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-border"
          />
          
          {/* Action buttons overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full w-10 h-10 p-0 bg-white hover:bg-green-50"
              onClick={handleRetake}
              aria-label="Retake photo"
            >
              <RefreshCw className="w-4 h-4 text-green-700" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="rounded-full w-10 h-10 p-0"
              onClick={removePhoto}
              aria-label="Remove photo"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Quick remove button for mobile */}
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0 md:hidden"
            onClick={removePhoto}
            aria-label="Remove photo"
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

      {/* Retake button below image on mobile */}
      {previewUrl && (
        <div className="flex justify-center gap-2 md:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRetake}
            disabled={isCapturing}
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retake
          </Button>
        </div>
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
