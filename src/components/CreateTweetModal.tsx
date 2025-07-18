import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PhotoUpload from "@/components/PhotoUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera, Send } from "lucide-react";

interface CreateTweetModalProps {
  isOpen: boolean;
  onClose: () => void;
  pets: Array<{
    id: string;
    name: string;
    profile_photo_url?: string;
  }>;
  onTweetCreated: () => void;
}

export const CreateTweetModal: React.FC<CreateTweetModalProps> = ({
  isOpen,
  onClose,
  pets,
  onTweetCreated,
}) => {
  const [content, setContent] = useState('');
  const [selectedPetId, setSelectedPetId] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim() || !selectedPetId) {
      toast({
        title: "Error",
        description: "Please write content and select a pet",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('pet_tweets')
        .insert({
          content: content.trim(),
          pet_id: selectedPetId,
          owner_id: user.id,
          photo_url: photoUrl || null,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Tweet posted",
      });

      setContent('');
      setSelectedPetId('');
      setPhotoUrl('');
      onTweetCreated();
      onClose();
    } catch (error) {
      console.error('Error creating tweet:', error);
      toast({
        title: "Error",
        description: "Error posting tweet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            New Tweet
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pb-4">
          <Select value={selectedPetId} onValueChange={setSelectedPetId}>
            <SelectTrigger>
              <SelectValue placeholder="Which pet is tweeting?" />
            </SelectTrigger>
            <SelectContent>
              {pets.map((pet) => (
                <SelectItem key={pet.id} value={pet.id}>
                  {pet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            placeholder="What's happening? (e.g., Going out for a walk! 🐕)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] sm:min-h-[100px] resize-none"
            maxLength={280}
          />

          <div className="text-right text-sm text-muted-foreground">
            {content.length}/280
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Camera className="h-4 w-4" />
              Add Photo (Optional)
            </div>
            <PhotoUpload
              currentPhotoUrl={photoUrl}
              onPhotoUploaded={setPhotoUrl}
              bucketName="pet-photos"
              className="h-24 sm:h-32"
            />
          </div>

          <div className="flex gap-2 pt-6 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !content.trim() || !selectedPetId}
              className="flex-1"
            >
              {isLoading ? "Posting..." : "Tweet"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};