
import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface BoopButtonProps {
  petId: string;
  currentBoopCount: number;
  onBoopUpdate: (newCount: number) => void;
  size?: 'sm' | 'default' | 'lg';
}

const BoopButton: React.FC<BoopButtonProps> = ({ 
  petId, 
  currentBoopCount, 
  onBoopUpdate,
  size = 'default'
}) => {
  const [isBooping, setIsBooping] = useState(false);
  const [hasBooped, setHasBooped] = useState(false);
  const { toast } = useToast();

  const handleBoop = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isBooping) return;

    setIsBooping(true);
    
    // Add haptic feedback if supported
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    try {
      const { data, error } = await supabase
        .from('pet_profiles')
        .update({ boop_count: currentBoopCount + 1 })
        .eq('id', petId)
        .select('boop_count')
        .single();

      if (error) throw error;

      onBoopUpdate(data.boop_count);
      setHasBooped(true);
      
      // Reset the booped state after animation
      setTimeout(() => setHasBooped(false), 1000);

    } catch (error) {
      console.error('Error booping pet:', error);
      toast({
        title: "Error",
        description: "Failed to boop this adorable pet. Please try again!",
        variant: "destructive",
      });
    } finally {
      setIsBooping(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8';
      case 'lg': return 'h-12 w-12';
      default: return 'h-10 w-10';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-3 h-3';
      case 'lg': return 'w-6 h-6';
      default: return 'w-4 h-4';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleBoop}
        disabled={isBooping}
        variant="ghost"
        size="sm"
        className={`
          ${getButtonSize()} 
          rounded-full transition-all duration-300 ease-out
          ${hasBooped ? 'scale-125 bg-pink-100' : 'hover:bg-pink-50'}
          ${isBooping ? 'animate-pulse' : ''}
        `}
      >
        <Heart 
          className={`
            ${getIconSize()} 
            transition-all duration-300
            ${hasBooped ? 'fill-pink-500 text-pink-500 scale-110' : 'text-pink-400'}
            ${isBooping ? 'animate-bounce' : ''}
          `} 
        />
      </Button>
      
      <span className={`
        text-sm font-medium transition-all duration-300
        ${hasBooped ? 'text-pink-600 scale-110' : 'text-gray-600'}
      `}>
        {currentBoopCount.toLocaleString()}
      </span>
      
      {hasBooped && (
        <div className="absolute pointer-events-none">
          <div className="animate-bounce text-pink-500 font-bold text-xs -translate-y-2">
            +1 Boop! 💕
          </div>
        </div>
      )}
    </div>
  );
};

export default BoopButton;
