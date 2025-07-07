
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Trash2, UserMinus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface PackSettingsModalProps {
  pack: {
    id: string;
    name: string;
    description: string | null;
    created_by: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const PackSettingsModal = ({ pack, open, onOpenChange, onUpdate }: PackSettingsModalProps) => {
  const [name, setName] = useState(pack.name);
  const [description, setDescription] = useState(pack.description || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const { data: members, refetch: refetchMembers } = useQuery({
    queryKey: ['pack-members', pack.id],
    queryFn: async () => {
      // First get pack members
      const { data: packMembers, error: membersError } = await supabase
        .from('pack_members')
        .select('*')
        .eq('pack_id', pack.id);
      
      if (membersError) throw membersError;
      
      if (!packMembers || packMembers.length === 0) {
        return [];
      }

      // Then get user profiles for those members
      const userIds = packMembers.map(member => member.user_id);
      const { data: userProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, display_name, email')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;

      // Combine the data
      return packMembers.map(member => ({
        ...member,
        user_profile: userProfiles?.find(profile => profile.id === member.user_id) || null
      }));
    },
    enabled: open,
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('packs')
        .update({
          name: name.trim(),
          description: description.trim() || null,
        })
        .eq('id', pack.id);

      if (error) throw error;

      toast({
        title: "Pack Updated",
        description: "Pack details have been updated successfully.",
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating pack:', error);
      toast({
        title: "Error",
        description: "Failed to update pack. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePack = async () => {
    if (!confirm('Are you sure you want to delete this pack? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('packs')
        .delete()
        .eq('id', pack.id);

      if (error) throw error;

      toast({
        title: "Pack Deleted",
        description: "The pack has been deleted successfully.",
      });
      onOpenChange(false);
      onUpdate();
    } catch (error) {
      console.error('Error deleting pack:', error);
      toast({
        title: "Error",
        description: "Failed to delete pack. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this pack?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('pack_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Member Removed",
        description: `${memberName} has been removed from the pack.`,
      });
      refetchMembers();
      onUpdate();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pack Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Pack Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <Button
              type="submit"
              disabled={isUpdating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUpdating ? 'Updating...' : 'Update Pack'}
            </Button>
          </form>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Members ({members?.length || 0})</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {member.user_profile?.display_name || 
                       member.user_profile?.email || 
                       'Unknown User'}
                    </span>
                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                      {member.role}
                    </Badge>
                  </div>
                  {member.user_id !== pack.created_by && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(
                        member.id, 
                        member.user_profile?.display_name || 
                        member.user_profile?.email || 
                        'User'
                      )}
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3 text-red-600">Danger Zone</h3>
            <Button
              onClick={handleDeletePack}
              disabled={isDeleting}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete Pack'}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              This will permanently delete the pack and remove all members.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PackSettingsModal;
