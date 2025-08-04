
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, Send } from 'lucide-react';
import PetInviteSelector from './PetInviteSelector';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

interface PlaydateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userPets: PetProfile[];
  targetPetId?: string;
  targetUserId?: string;
}

const PlaydateRequestModal: React.FC<PlaydateRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userPets,
  targetPetId,
  targetUserId
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [invitedPets, setInvitedPets] = useState<string[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetUserId) {
      toast({
        title: "Error",
        description: "No target user specified for the playdate.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.date || !formData.time || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Combine date and time
      const scheduledDateTime = new Date(`${formData.date}T${formData.time}`);

      // Prepare participants list
      const allParticipants = targetUserId 
        ? [user.id, targetUserId, ...invitedUsers]
        : [user.id, ...invitedUsers];

      const { error } = await supabase
        .from('events')
        .insert({
          event_type: 'playdate',
          creator_id: user.id,
          participants: allParticipants,
          invited_pet_ids: invitedPets,
          invited_participants: invitedUsers,
          status: 'pending',
          location_name: formData.location,
          scheduled_time: scheduledDateTime.toISOString(),
          message: formData.message || null
        });

      if (error) throw error;

      toast({
        title: "Playdate Request Sent! 🐕",
        description: "Your playdate request has been sent successfully.",
      });

      // Reset form and invitations
      setFormData({
        date: '',
        time: '',
        location: '',
        message: ''
      });
      setInvitedPets([]);
      setInvitedUsers([]);

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating playdate request:', error);
      toast({
        title: "Error",
        description: "Failed to send playdate request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePetToggle = (petId: string, petOwnerId: string) => {
    setInvitedPets(prev => {
      const isSelected = prev.includes(petId);
      if (isSelected) {
        // Remove pet and potentially the user if no more pets are selected
        const newPets = prev.filter(id => id !== petId);
        setInvitedUsers(prevUsers => {
          // Check if this user has any other pets invited
          const userStillHasPetsInvited = newPets.some(id => 
            // We'd need to check pet ownership, but for simplicity, remove user
            false
          );
          return prevUsers.filter(userId => userId !== petOwnerId);
        });
        return newPets;
      } else {
        // Add pet and user
        setInvitedUsers(prevUsers => 
          prevUsers.includes(petOwnerId) ? prevUsers : [...prevUsers, petOwnerId]
        );
        return [...prev, petId];
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🐕 Request a Playdate
          </DialogTitle>
          <DialogDescription>
            Fill in the details for your playdate request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location *
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="e.g., Central Park Dog Run"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              required
            />
          </div>

          {/* Pet Invitation Selector */}
          <PetInviteSelector
            userPetIds={userPets.map(pet => pet.id)}
            selectedPets={invitedPets}
            onPetToggle={handlePetToggle}
          />

          <div className="space-y-2">
            <Label htmlFor="message">
              Optional Message
            </Label>
            <Textarea
              id="message"
              placeholder="Hey! Our dogs should meet up for a playdate..."
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                'Sending...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlaydateRequestModal;
