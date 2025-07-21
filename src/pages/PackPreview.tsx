import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Share2, 
  UserPlus, 
  Check, 
  Clock,
  Settings,
  Crown,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PackMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

interface Pack {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  privacy: string;
  created_by: string;
  created_at: string;
  pack_members: PackMember[];
}

const PackPreview = () => {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [actionState, setActionState] = useState<'idle' | 'loading' | 'success'>('idle');

  const { data: pack, isLoading } = useQuery({
    queryKey: ['pack-preview', packId],
    queryFn: async () => {
      if (!packId) throw new Error('Pack ID is required');
      
      const { data, error } = await supabase
        .from('packs')
        .select(`
          *,
          pack_members (
            id,
            user_id,
            role,
            joined_at
          )
        `)
        .eq('id', packId)
        .single();

      if (error) throw error;
      return data as Pack;
    },
  });

  const joinPackMutation = useMutation({
    mutationFn: async () => {
      if (!user || !packId) throw new Error('User and pack ID required');
      
      const { error } = await supabase
        .from('pack_members')
        .insert({
          pack_id: packId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setActionState('success');
      queryClient.invalidateQueries({ queryKey: ['pack-preview', packId] });
      toast({
        title: "Welcome to the pack! 🎉",
        description: `You've successfully joined ${pack?.name}`,
        className: "bg-accent text-accent-foreground",
      });
    },
    onError: (error) => {
      console.error('Error joining pack:', error);
      toast({
        title: "Error",
        description: "Failed to join pack. Please try again.",
        variant: "destructive",
      });
      setActionState('idle');
    },
  });

  const handleJoinAction = () => {
    setActionState('loading');
    joinPackMutation.mutate();
  };

  const handleShareInvite = () => {
    const inviteUrl = `${window.location.origin}/packs/${packId}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Invite link copied!",
      description: "Share this link with friends to invite them to the pack.",
      className: "bg-accent text-accent-foreground",
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary-light to-background p-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-80 bg-muted rounded-3xl"></div>
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!pack) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary-light to-background p-4 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Pack not found</h2>
            <Button onClick={() => navigate('/packs')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Packs
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const isUserMember = pack.pack_members.some(member => member.user_id === user?.id);
  const isOwner = user?.id === pack.created_by;
  const memberCount = pack.pack_members.length;
  
  // Get user's role if they're a member
  const userMember = pack.pack_members.find(member => member.user_id === user?.id);
  const userRole = userMember?.role;

  const getActionButton = () => {
    if (isUserMember) {
      return (
        <div className="space-y-4">
          <Button
            onClick={() => navigate(`/packs/${packId}/chat`)}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg"
          >
            Open Pack Chat
          </Button>
          
          <div className="flex space-x-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="flex-1 h-12 rounded-xl border-2"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Invite Friends
                </Button>
              </SheetTrigger>
              <SheetContent className="rounded-l-3xl">
                <SheetHeader>
                  <SheetTitle>Invite Friends to {pack.name}</SheetTitle>
                </SheetHeader>
                <div className="pt-6 space-y-4">
                  <Button 
                    onClick={handleShareInvite}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Share2 className="h-4 w-4 mr-3" />
                    Copy Invite Link
                  </Button>
                  {/* Friend list would go here */}
                  <p className="text-sm text-muted-foreground">
                    Share the invite link with friends to let them join {pack.name}
                  </p>
                </div>
              </SheetContent>
            </Sheet>

            {(isOwner || userRole === 'admin') && (
              <Button
                onClick={() => navigate(`/packs/${packId}/settings`)}
                variant="outline"
                size="lg"
                className="h-12 px-4 rounded-xl border-2"
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      );
    }

    const buttonText = pack.privacy === 'private' ? 'Accept Invitation' : 
                     actionState === 'success' ? 'Request Sent' :
                     actionState === 'loading' ? 'Joining...' : 'Join Pack';
    
    const buttonIcon = actionState === 'success' ? <Check className="h-5 w-5 mr-2" /> :
                      actionState === 'loading' ? <Clock className="h-5 w-5 mr-2 animate-spin" /> :
                      <UserPlus className="h-5 w-5 mr-2" />;

    return (
      <Button
        onClick={handleJoinAction}
        disabled={actionState !== 'idle'}
        size="lg"
        className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg disabled:opacity-70"
      >
        {buttonIcon}
        {buttonText}
      </Button>
    );
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'moderator':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary-light to-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <Button 
            onClick={() => navigate('/packs')}
            variant="ghost"
            className="rounded-xl hover:bg-white/80"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Packs
          </Button>

          {/* Pack Header */}
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
            {/* Cover Image */}
            <div className="relative h-64 bg-gradient-to-br from-primary/30 to-accent/30">
              {pack.cover_image_url ? (
                <img 
                  src={pack.cover_image_url} 
                  alt={pack.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Avatar className="h-32 w-32 border-8 border-white shadow-2xl">
                    <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
                      {pack.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              
              {/* Privacy Badge */}
              <Badge 
                className={`absolute top-4 right-4 ${
                  pack.privacy === 'private' 
                    ? 'bg-coral text-coral-foreground' 
                    : 'bg-accent text-accent-foreground'
                }`}
              >
                {pack.privacy === 'private' ? 'Private' : 'Public'}
              </Badge>
            </div>

            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Pack Info */}
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold text-foreground tracking-tight">
                    {pack.name}
                  </h1>
                  
                  <div className="flex items-center space-x-6 text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span className="font-medium">{memberCount}</span>
                      <span>{memberCount === 1 ? 'member' : 'members'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Created {new Date(pack.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {pack.description && (
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {pack.description}
                    </p>
                  )}
                </div>

                {/* Members Preview */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">Members</h3>
                  <div className="flex -space-x-3">
                    {pack.pack_members.slice(0, 5).map((member) => (
                      <div key={member.id} className="relative">
                        <Avatar className="h-12 w-12 border-4 border-white shadow-md">
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                            {member.user_id.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {getRoleIcon(member.role) && (
                          <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md">
                            {getRoleIcon(member.role)}
                          </div>
                        )}
                      </div>
                    ))}
                    {memberCount > 5 && (
                      <div className="h-12 w-12 rounded-full border-4 border-white bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground shadow-md">
                        +{memberCount - 5}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {getActionButton()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PackPreview;