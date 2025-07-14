import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AIContentCreator } from "./AIContentCreator";

interface AIContentCreatorModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  petId: string;
  petName: string;
  imageLabels?: string[];
  onCaptionGenerated?: (caption: string) => void;
}

export const AIContentCreatorModal = ({
  isOpen,
  onOpenChange,
  petId,
  petName,
  imageLabels,
  onCaptionGenerated
}: AIContentCreatorModalProps) => {
  const [generatedCaption, setGeneratedCaption] = useState<string>("");

  const handleCaptionGenerated = (caption: string) => {
    setGeneratedCaption(caption);
    onCaptionGenerated?.(caption);
  };

  const handleUseCaption = () => {
    if (generatedCaption) {
      onCaptionGenerated?.(generatedCaption);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AI Content Creator</DialogTitle>
          <DialogDescription>
            Generate a fun caption for your pet's post using AI
          </DialogDescription>
        </DialogHeader>
        
        <AIContentCreator
          petId={petId}
          petName={petName}
          imageLabels={imageLabels}
          onCaptionGenerated={handleCaptionGenerated}
        />
        
        {generatedCaption && (
          <div className="flex gap-2 pt-4">
            <Button onClick={handleUseCaption} className="flex-1">
              Use This Caption
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};