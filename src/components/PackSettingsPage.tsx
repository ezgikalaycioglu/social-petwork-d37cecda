import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// UI Components
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Icons
import { 
  Edit, 
  Users, 
  UserPlus, 
  Share, 
  Bell, 
  BellOff, 
  Search, 
  Settings, 
  Flag, 
  LogOut, 
  Trash2,
  Crown,
  Shield,
  MoreVertical,
  MessageCircle,
  Copy,
  ChevronRight,
  X
} from 'lucide-react';

interface PackMember {
  id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user_profile?: {
    id: string;
    display_name: string | null;
    email: string | null;
  };
}

interface Pack {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  created_by: string;
  privacy: string;
}

const PackSettingsPage = () => {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for dialogs and sheets
  const [editInfoOpen, setEditInfoOpen] = useState(false);
  const [memberListOpen, setMemberListOpen] = useState(false);
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [muteDialogOpen, setMuteDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<PackMember | null>(null);
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);

  // Form state
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  // Settings state
  const [editInfoPermission, setEditInfoPermission] = useState<'all' | 'admins'>('all');
  const [sendMessagesPermission, setSendMessagesPermission] = useState<'all' | 'admins'>('all');

  // Fetch pack data
  const { data: pack, isLoading: packLoading } = useQuery({
    queryKey: ['pack', packId],
    queryFn: async () => {
      if (!packId) throw new Error('Pack ID is required');
      const { data, error } = await supabase
        .from('packs')
        .select('*')
        .eq('id', packId)
        .single();
      
      if (error) throw error;
      return data as Pack;
    },
    enabled: !!packId,
  });

  // Fetch pack members
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['pack-members', packId],
    queryFn: async () => {
      if (!packId) return [];
      
      const { data: packMembers, error: membersError } = await supabase
        .from('pack_members')
        .select('*')
        .eq('pack_id', packId)
        .order('joined_at', { ascending: true });
      
      if (membersError) throw membersError;
      
      if (!packMembers?.length) return [];

      const userIds = packMembers.map(member => member.user_id);
      const { data: userProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, display_name, email')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;

      return packMembers.map(member => ({
        ...member,
        user_profile: userProfiles?.find(profile => profile.id === member.user_id)
      })) as PackMember[];
    },
    enabled: !!packId,
  });

  // Get current user's membership
  const currentUserMembership = members.find(member => member.user_id === user?.id);
  const isAdmin = currentUserMembership?.role === 'admin' || pack?.created_by === user?.id;
  const isCreator = pack?.created_by === user?.id;

  // Update pack info mutation
  const updatePackMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      if (!packId) throw new Error('Pack ID is required');
      const { error } = await supabase
        .from('packs')
        .update({ name: name.trim(), description: description.trim() || null })
        .eq('id', packId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pack', packId] });
      toast({ title: "Pack Updated", description: "Pack information has been updated successfully." });
      setEditInfoOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update pack information.", variant: "destructive" });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('pack_members')
        .delete()
        .eq('id', memberId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pack-members', packId] });
      toast({ title: "Member Removed", description: "Member has been removed from the pack." });
      setRemoveMemberDialogOpen(false);
      setSelectedMember(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove member.", variant: "destructive" });
    },
  });

  // Leave pack mutation
  const leavePackMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserMembership) throw new Error('User membership not found');
      const { error } = await supabase
        .from('pack_members')
        .delete()
        .eq('id', currentUserMembership.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Left Pack", description: "You have left the pack successfully." });
      navigate('/packs');
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to leave pack.", variant: "destructive" });
    },
  });

  // Delete pack mutation
  const deletePackMutation = useMutation({
    mutationFn: async () => {
      if (!packId) throw new Error('Pack ID is required');
      const { error } = await supabase
        .from('packs')
        .delete()
        .eq('id', packId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Pack Deleted", description: "The pack has been deleted permanently." });
      navigate('/packs');
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete pack.", variant: "destructive" });
    },
  });

  const handleEditInfo = () => {
    if (!pack) return;
    setEditName(pack.name);
    setEditDescription(pack.description || '');
    setEditInfoOpen(true);
  };

  const handleUpdateInfo = () => {
    updatePackMutation.mutate({ name: editName, description: editDescription });
  };

  const handleShareInviteLink = () => {
    const inviteLink = `${window.location.origin}/packs/${packId}/invite`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      toast({ title: "Invite Link Copied", description: "Pack invite link has been copied to clipboard." });
    });
  };

  const handleMemberAction = (member: PackMember, action: 'profile' | 'message' | 'remove' | 'toggle-admin') => {
    setSelectedMember(member);
    
    switch (action) {
      case 'profile':
        // Navigate to member's profile
        toast({ title: "Feature Coming Soon", description: "Profile viewing will be available soon." });
        break;
      case 'message':
        // Navigate to direct message
        toast({ title: "Feature Coming Soon", description: "Direct messaging will be available soon." });
        break;
      case 'remove':
        setRemoveMemberDialogOpen(true);
        break;
      case 'toggle-admin':
        // Toggle admin status
        toast({ title: "Feature Coming Soon", description: "Admin management will be available soon." });
        break;
    }
  };

  const getMemberDisplayName = (member: PackMember) => {
    return member.user_profile?.display_name || 
           member.user_profile?.email?.split('@')[0] || 
           'Unknown User';
  };

  if (packLoading || membersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pack settings...</p>
        </div>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Pack not found</p>
          <Button onClick={() => navigate('/packs')}>Return to Packs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/packs/${packId}`)}>
            <X className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Pack Settings</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Main Info Section */}
        <div className="px-6 py-8 text-center bg-white">
          <div className="relative inline-block mb-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={pack.cover_image_url || undefined} alt={pack.name} />
              <AvatarFallback className="text-2xl">
                {pack.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isAdmin && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 p-0"
                onClick={handleEditInfo}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <h2 className="text-xl font-bold mb-2">{pack.name}</h2>
          {pack.description && (
            <p className="text-muted-foreground text-sm mb-4">{pack.description}</p>
          )}
          
          {isAdmin && (
            <Button variant="ghost" size="sm" onClick={handleEditInfo} className="text-primary">
              <Edit className="w-4 h-4 mr-2" />
              Edit Pack Info
            </Button>
          )}
        </div>

        <Separator />

        {/* Member List Section */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{members.length} Members</h3>
            <Sheet open={memberListOpen} onOpenChange={setMemberListOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-primary">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Pack Members</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {getMemberDisplayName(member).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{getMemberDisplayName(member)}</p>
                          <div className="flex items-center space-x-2">
                            {member.role === 'admin' && (
                              <Badge variant="default" className="text-xs">
                                <Crown className="w-3 h-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                            {member.user_id === pack.created_by && (
                              <Badge variant="secondary" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                Creator
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {member.user_id !== user?.id && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMemberAction(member, 'message')}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                          {isAdmin && member.user_id !== pack.created_by && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMemberAction(member, 'remove')}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Show first 5 members */}
          <div className="space-y-2">
            {members.slice(0, 5).map((member) => (
              <div key={member.id} className="flex items-center space-x-3 p-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-sm">
                    {getMemberDisplayName(member).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{getMemberDisplayName(member)}</p>
                </div>
                {member.role === 'admin' && (
                  <Badge variant="default" className="text-xs">
                    Admin
                  </Badge>
                )}
              </div>
            ))}
            {members.length > 5 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                and {members.length - 5} more...
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Action Menu Section */}
        <div className="px-6 py-4 space-y-4">
          {isAdmin && (
            <Button
              variant="ghost"
              className="w-full justify-start h-12"
              onClick={() => setAddMembersOpen(true)}
            >
              <UserPlus className="w-5 h-5 mr-3" />
              Add Members
            </Button>
          )}

          {isAdmin && (
            <Button
              variant="ghost"
              className="w-full justify-start h-12"
              onClick={handleShareInviteLink}
            >
              <Share className="w-5 h-5 mr-3" />
              Share Invite Link
            </Button>
          )}

          <Button
            variant="ghost"
            className="w-full justify-start h-12"
            onClick={() => setMuteDialogOpen(true)}
          >
            <BellOff className="w-5 h-5 mr-3" />
            Mute Notifications
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start h-12"
            onClick={() => navigate(`/packs/${packId}`)}
          >
            <Search className="w-5 h-5 mr-3" />
            Search Chat
          </Button>
        </div>

        {/* Pack Permissions Section (Admin Only) */}
        {isAdmin && (
          <>
            <Separator />
            <div className="px-6 py-4">
              <h3 className="font-semibold mb-4">Pack Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Edit Pack Info</p>
                    <p className="text-sm text-muted-foreground">Who can edit pack name and description</p>
                  </div>
                  <Switch
                    checked={editInfoPermission === 'all'}
                    onCheckedChange={(checked) => 
                      setEditInfoPermission(checked ? 'all' : 'admins')
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Send Messages</p>
                    <p className="text-sm text-muted-foreground">Who can send messages</p>
                  </div>
                  <Switch
                    checked={sendMessagesPermission === 'all'}
                    onCheckedChange={(checked) => 
                      setSendMessagesPermission(checked ? 'all' : 'admins')
                    }
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Danger Zone Section */}
        <div className="px-6 py-4 space-y-4">
          <h3 className="font-semibold text-destructive">Danger Zone</h3>
          
          <Button
            variant="ghost"
            className="w-full justify-start h-12 text-muted-foreground"
            onClick={() => toast({ title: "Feature Coming Soon", description: "Report functionality will be available soon." })}
          >
            <Flag className="w-5 h-5 mr-3" />
            Report Pack
          </Button>

          {isCreator ? (
            <Button
              variant="destructive"
              className="w-full justify-start h-12"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="w-5 h-5 mr-3" />
              Delete Pack
            </Button>
          ) : (
            <Button
              variant="destructive"
              className="w-full justify-start h-12"
              onClick={() => setExitDialogOpen(true)}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Exit Pack
            </Button>
          )}
        </div>

        <div className="h-20"></div> {/* Bottom spacing */}
      </div>

      {/* Edit Info Dialog */}
      <Dialog open={editInfoOpen} onOpenChange={setEditInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pack Info</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pack-name">Pack Name</Label>
              <Input
                id="pack-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter pack name"
              />
            </div>
            <div>
              <Label htmlFor="pack-description">Description</Label>
              <Textarea
                id="pack-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Enter pack description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditInfoOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateInfo}
              disabled={updatePackMutation.isPending}
              className="bg-[#7A5FFF] hover:bg-[#6B4FEF] text-white"
            >
              {updatePackMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mute Dialog */}
      <Dialog open={muteDialogOpen} onOpenChange={setMuteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mute Notifications</DialogTitle>
            <DialogDescription>
              How long would you like to mute notifications for this pack?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              8 Hours
            </Button>
            <Button variant="outline" className="w-full justify-start">
              1 Week
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Forever
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMuteDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={removeMemberDialogOpen} onOpenChange={setRemoveMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedMember ? getMemberDisplayName(selectedMember) : ''} from this pack?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveMemberDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedMember && removeMemberMutation.mutate(selectedMember.id)}
              disabled={removeMemberMutation.isPending}
            >
              {removeMemberMutation.isPending ? 'Removing...' : 'Remove Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit Pack Dialog */}
      <Dialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit Pack</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave "{pack.name}"? You won't be able to see messages or participate unless someone adds you back.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExitDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => leavePackMutation.mutate()}
              disabled={leavePackMutation.isPending}
            >
              {leavePackMutation.isPending ? 'Leaving...' : 'Exit Pack'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Pack Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Pack</DialogTitle>
            <DialogDescription>
              This will permanently delete "{pack.name}" for everyone. All messages, media, and member information will be lost forever. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => deletePackMutation.mutate()}
              disabled={deletePackMutation.isPending}
            >
              {deletePackMutation.isPending ? 'Deleting...' : 'Delete Pack'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackSettingsPage;