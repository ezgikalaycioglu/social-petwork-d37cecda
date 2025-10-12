
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, Users, Send } from 'lucide-react';
import PetInviteSelector from './PetInviteSelector';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

interface Event {
  id: string;
  title: string | null;
  scheduled_time: string;
  location_name: string;
  message: string | null;
  invited_pet_ids?: string[];
  invited_participants?: string[];
}

interface GroupWalkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  userPets: PetProfile[];
  editEvent?: Event | null;
}

const GroupWalkModal: React.FC<GroupWalkModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
  userPets,
  editEvent
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [invitedPets, setInvitedPets] = useState<string[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: ''
  });

  // Pre-fill form when editing
  React.useEffect(() => {
    if (editEvent && isOpen) {
      const eventDate = new Date(editEvent.scheduled_time);
      setFormData({
        title: editEvent.title || '',
        date: eventDate.toISOString().split('T')[0],
        time: eventDate.toTimeString().slice(0, 5),
        location: editEvent.location_name,
        description: editEvent.message || ''
      });
      setInvitedPets(editEvent.invited_pet_ids || []);
      setInvitedUsers(editEvent.invited_participants || []);
    } else if (!isOpen) {
      // Reset when closing
      setFormData({
        title: '',
        date: '',
        time: '',
        location: '',
        description: ''
      });
      setInvitedPets([]);
      setInvitedUsers([]);
    }
  }, [editEvent, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Combine date and time
      const scheduledDateTime = new Date(`${formData.date}T${formData.time}`);

      // Prepare participants list
      const allParticipants = [userId, ...invitedUsers];

      if (editEvent) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update({
            participants: allParticipants,
            invited_pet_ids: invitedPets,
            invited_participants: invitedUsers,
            location_name: formData.location,
            scheduled_time: scheduledDateTime.toISOString(),
            title: formData.title,
            message: formData.description || null
          })
          .eq('id', editEvent.id);

        if (error) throw error;

        toast({
          title: "Event Updated! 🚶",
          description: "Your event has been updated successfully.",
        });
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert({
            event_type: 'group_walk',
            creator_id: userId,
            participants: allParticipants,
            invited_pet_ids: invitedPets,
            invited_participants: invitedUsers,
            status: 'pending',
            location_name: formData.location,
            scheduled_time: scheduledDateTime.toISOString(),
            title: formData.title,
            message: formData.description || null
          });

        if (error) throw error;

        toast({
          title: "Group Walk Created! 🚶",
          description: "Your group walk has been created successfully.",
        });
      }

      // Reset form and invitations
      setFormData({
        title: '',
        date: '',
        time: '',
        location: '',
        description: ''
      });
      setInvitedPets([]);
      setInvitedUsers([]);

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating group walk:', error);
      toast({
        title: "Error",
        description: "Failed to create group walk. Please try again.",
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
            <Users className="w-5 h-5" />
            {editEvent ? 'Edit Group Walk' : 'Create Group Walk'}
          </DialogTitle>
          <DialogDescription>
            {editEvent ? 'Update the details of your group walk.' : 'Organize a group walk for the pet community to join.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Event Title *
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Saturday Morning Pack Walk"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

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
              Location/Route *
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="e.g., Central Park - Meet at main entrance"
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
            <Label htmlFor="description">
              Walk Description
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of the walk, route, and what to expect..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
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
                editEvent ? 'Updating...' : 'Creating...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {editEvent ? 'Update Event' : 'Create Event'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GroupWalkModal;
