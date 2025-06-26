
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, Users, Send } from 'lucide-react';

interface GroupWalkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

const GroupWalkModal: React.FC<GroupWalkModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: ''
  });

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

      const { error } = await supabase
        .from('events')
        .insert({
          event_type: 'group_walk',
          creator_id: userId,
          participants: [userId], // Creator is initially the only participant
          status: 'confirmed', // Group walks are auto-confirmed
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

      // Reset form
      setFormData({
        title: '',
        date: '',
        time: '',
        location: '',
        description: ''
      });

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Create Group Walk
          </DialogTitle>
          <DialogDescription>
            Organize a group walk for the pet community to join.
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
                'Creating...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Create Event
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
