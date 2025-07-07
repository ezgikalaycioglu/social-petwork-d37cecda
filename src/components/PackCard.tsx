
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import PackSettingsModal from '@/components/PackSettingsModal';

interface PackCardProps {
  pack: {
    id: string;
    name: string;
    description: string | null;
    cover_image_url: string | null;
    created_by: string;
    created_at: string;
    pack_members: Array<{
      id: string;
      user_id: string;
      role: string;
      joined_at: string;
    }>;
  };
  onUpdate: () => void;
}

const PackCard = ({ pack, onUpdate }: PackCardProps) => {
  const [isJoining, setIsJoining] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const isOwner = user?.id === pack.created_by;
  const isMember = pack.pack_members.some(member => member.user_id === user?.id);
  const memberCount = pack.pack_members.length;

  const handleJoinPack = async () => {
    if (!user) return;
    
    setIsJoining(true);
    try {
      const { error } = await supabase
        .from('pack_members')
        .insert({
          pack_id: pack.id,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: "Joined Pack",
        description: `You've successfully joined ${pack.name}!`,
      });
      onUpdate();
    } catch (error) {
      console.error('Error joining pack:', error);
      toast({
        title: "Error",
        description: "Failed to join pack. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeavePack = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('pack_members')
        .delete()
        .eq('pack_id', pack.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Left Pack",
        description: `You've left ${pack.name}.`,
      });
      onUpdate();
    } catch (error) {
      console.error('Error leaving pack:', error);
      toast({
        title: "Error",
        description: "Failed to leave pack. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        {pack.cover_image_url && (
          <div className="h-48 bg-cover bg-center rounded-t-lg" 
               style={{ backgroundImage: `url(${pack.cover_image_url})` }} />
        )}
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{pack.name}</CardTitle>
              <CardDescription className="mt-1">
                {pack.description || 'No description provided'}
              </CardDescription>
            </div>
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {memberCount} member{memberCount !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(pack.created_at).toLocaleDateString()}
              </div>
            </div>
            {isOwner && <Badge variant="secondary">Owner</Badge>}
          </div>
          
          <div className="flex space-x-2">
            {!isMember && !isOwner && (
              <Button
                onClick={handleJoinPack}
                disabled={isJoining}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {isJoining ? 'Joining...' : 'Join Pack'}
              </Button>
            )}
            {isMember && !isOwner && (
              <Button
                onClick={handleLeavePack}
                variant="outline"
                className="flex-1"
              >
                Leave Pack
              </Button>
            )}
            {isOwner && (
              <Button
                onClick={() => setShowSettings(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Manage Pack
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <PackSettingsModal
        pack={pack}
        open={showSettings}
        onOpenChange={setShowSettings}
        onUpdate={onUpdate}
      />
    </>
  );
};

export default PackCard;
