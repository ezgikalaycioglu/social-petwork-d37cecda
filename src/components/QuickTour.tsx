import React, { useState, useEffect, useMemo } from 'react';
import { X, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFeatureFlags, type FeatureFlags } from '@/hooks/useFeatureFlags';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetElement: string;
  arrowPosition: 'top' | 'bottom' | 'left' | 'right';
  featureFlag?: keyof FeatureFlags;
}

const tourSteps: TourStep[] = [
  {
    id: 'dashboard',
    title: 'Welcome to Dashboard!',
    description: 'This is your central hub! Here you can post updates about your pets, view posts from your pet\'s friends, and discover all the new pets joining the community.',
    targetElement: '[data-tour="dashboard"]',
    arrowPosition: 'top'
  },
  {
    id: 'social',
    title: 'Pet Social',
    description: 'Connect with other pets! Manage friendship requests for your pet, plan fun events, and see your pet\'s friends on the map.',
    targetElement: '[data-tour="social"]',
    arrowPosition: 'top'
  },
  {
    id: 'sitters',
    title: 'Pet Sitters',
    description: 'Need a helping paw? You can register yourself as a pet sitter to offer your services, or easily find a trusted pet sitter for your beloved companion.',
    targetElement: '[data-tour="sitters"]',
    arrowPosition: 'top',
    featureFlag: 'pet_sitters_enabled'
  },
  {
    id: 'business',
    title: 'Business',
    description: 'For our business partners! Register your business to offer exclusive discount codes to pet owners, and also gain access to special deals from other businesses.',
    targetElement: '[data-tour="business"]',
    arrowPosition: 'top',
    featureFlag: 'business_section_enabled'
  },
  {
    id: 'packs',
    title: 'Packs',
    description: 'Create your pack! Form groups with your pet\'s best friends, or join existing packs to connect with like-minded pet owners and their companions.',
    targetElement: '[data-tour="packs"]',
    arrowPosition: 'top',
    featureFlag: 'packs_enabled'
  },
  {
    id: 'profile',
    title: 'Profile',
    description: 'Your personal space! Here you can create and manage your pets\' profiles, and adjust all your other account settings.',
    targetElement: '[data-tour="profile"]',
    arrowPosition: 'top'
  }
];

interface QuickTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const QuickTour: React.FC<QuickTourProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: featureFlags, isLoading: flagsLoading } = useFeatureFlags();

  const filteredTourSteps = useMemo(() => {
    if (!featureFlags) return tourSteps;
    
    return tourSteps.filter(step => {
      // If step has no feature flag requirement, always include it
      if (!step.featureFlag) return true;
      
      // Otherwise, check if the feature is enabled
      return featureFlags[step.featureFlag] === true;
    });
  }, [featureFlags]);

  useEffect(() => {
    updateTargetPosition();
  }, [currentStep]);

  const updateTargetPosition = () => {
    const targetElement = document.querySelector(filteredTourSteps[currentStep]?.targetElement);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setTargetPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
    }
  };

  const handleNext = () => {
    if (currentStep < filteredTourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const completeTour = async () => {
    try {
      await markTourAsCompleted();
      onComplete();
      toast({
        title: "Tour completed!",
        description: "Welcome to PawCult! Start exploring and connecting with other pet owners.",
      });
    } catch (error) {
      console.error('Error completing tour:', error);
      onComplete();
    }
  };

  const handleSkip = async () => {
    try {
      await markTourAsCompleted();
      onSkip();
      toast({
        title: "Tour skipped",
        description: "You can always explore the features at your own pace!",
      });
    } catch (error) {
      console.error('Error skipping tour:', error);
      onSkip();
    }
  };

  const markTourAsCompleted = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ tour_completed: true })
      .eq('id', user.id);

    if (error) {
      throw error;
    }
  };

  if (flagsLoading || filteredTourSteps.length === 0) {
    return null;
  }

  const currentTourStep = filteredTourSteps[currentStep];
  const progress = ((currentStep + 1) / filteredTourSteps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      {/* Highlight overlay for target element */}
      <div
        className="absolute border-4 border-primary rounded-lg shadow-lg animate-pulse"
        style={{
          top: targetPosition.top - 4,
          left: targetPosition.left - 4,
          width: targetPosition.width + 8,
          height: targetPosition.height + 8,
          pointerEvents: 'none'
        }}
      />

      {/* Arrow pointing to target element */}
      <div
        className="absolute z-10"
        style={{
          top: targetPosition.top - 32,
          left: targetPosition.left + targetPosition.width / 2 - 12,
        }}
      >
        <div className="w-6 h-6 bg-primary rotate-45 transform origin-center border-2 border-white" />
        <ArrowRight className="absolute top-1 left-1 w-4 h-4 text-white -rotate-45" />
      </div>

      {/* Tour content card */}
      <div className="absolute bottom-24 left-4 right-4 z-20">
        <Card className="shadow-2xl border-2 border-primary/20">
          <CardContent className="p-6">
            {/* Progress indicator */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Step {currentStep + 1} of {filteredTourSteps.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step content */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3 text-foreground">
                {currentTourStep.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {currentTourStep.description}
              </p>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="px-6"
              >
                Skip Tutorial
              </Button>
              
              <Button
                onClick={handleNext}
                className="px-6 bg-primary hover:bg-primary/90"
              >
                {currentStep === filteredTourSteps.length - 1 ? 'Finish' : 'Next'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuickTour;