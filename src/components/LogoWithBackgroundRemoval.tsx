
import { useState, useEffect } from 'react';
import { removeBackground, loadImage } from '../utils/backgroundRemoval';

interface LogoWithBackgroundRemovalProps {
  originalImageSrc: string;
  alt: string;
  width?: string;
  height?: string;
  className?: string;
}

const LogoWithBackgroundRemoval = ({ 
  originalImageSrc, 
  alt, 
  width = "96", 
  height = "96", 
  className = "w-24 h-24" 
}: LogoWithBackgroundRemovalProps) => {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processImage = async () => {
      setIsProcessing(true);
      setError(null);
      
      try {
        // Fetch the original image
        const response = await fetch(originalImageSrc);
        const blob = await response.blob();
        
        // Load image
        const imageElement = await loadImage(blob);
        
        // Remove background
        const processedBlob = await removeBackground(imageElement);
        
        // Create URL for the processed image
        const url = URL.createObjectURL(processedBlob);
        setProcessedImageUrl(url);
      } catch (err) {
        console.error('Error processing image:', err);
        setError('Failed to process image');
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();

    // Cleanup function to revoke object URL
    return () => {
      if (processedImageUrl) {
        URL.revokeObjectURL(processedImageUrl);
      }
    };
  }, [originalImageSrc]);

  if (isProcessing) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    // Fallback to original image if processing fails
    return (
      <img 
        src={originalImageSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  }

  return (
    <img 
      src={processedImageUrl || originalImageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
};

export default LogoWithBackgroundRemoval;
