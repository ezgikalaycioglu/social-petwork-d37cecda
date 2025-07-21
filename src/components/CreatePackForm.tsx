import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, Users, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const CreatePackForm = () => {
  const [packName, setPackName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const uploadAvatar = async (packId: string): Promise<string | null> => {
    if (!avatarFile) return null;

    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${packId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('pet-photos')
      .upload(fileName, avatarFile);

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('pet-photos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !packName.trim()) return;

    setIsCreating(true);
    try {
      // Create the pack first
      const { data: pack, error: packError } = await supabase
        .from('packs')
        .insert({
          name: packName.trim(),
          description: description.trim() || null,
          privacy,
          created_by: user.id,
        })
        .select()
        .single();

      if (packError) throw packError;

      // Upload avatar if provided
      let coverImageUrl = null;
      if (avatarFile) {
        coverImageUrl = await uploadAvatar(pack.id);
        if (coverImageUrl) {
          const { error: updateError } = await supabase
            .from('packs')
            .update({ cover_image_url: coverImageUrl })
            .eq('id', pack.id);
          
          if (updateError) console.error('Error updating cover image:', updateError);
        }
      }

      // Add the creator as an admin member
      const { error: memberError } = await supabase
        .from('pack_members')
        .insert({
          pack_id: pack.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) throw memberError;

      toast({
        title: "Pack Created Successfully!",
        description: `${packName} is ready for friends to join.`,
        className: "bg-accent text-accent-foreground",
      });

      // Navigate to the pack preview to invite friends
      navigate(`/packs/${pack.id}`);
    } catch (error) {
      console.error('Error creating pack:', error);
      toast({
        title: "Error",
        description: "Failed to create pack. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
            Create Your Pack
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Start a community for pet owners to connect and share adventures
          </p>
        </div>

        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground p-8">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Pack Details
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Pack Avatar */}
              <div className="space-y-3">
                <Label className="text-lg font-medium">Pack Avatar</Label>
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={avatarPreview} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      <Camera className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" className="rounded-xl" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Image
                        </span>
                      </Button>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload a group photo or logo
                    </p>
                  </div>
                </div>
              </div>

              {/* Pack Name */}
              <div className="space-y-3">
                <Label htmlFor="pack-name" className="text-lg font-medium">
                  Pack Name *
                </Label>
                <Input
                  id="pack-name"
                  value={packName}
                  onChange={(e) => setPackName(e.target.value)}
                  placeholder="e.g., Downtown Dog Walkers"
                  className="h-12 text-lg rounded-xl border-2 focus:border-primary"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label htmlFor="description" className="text-lg font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell others what your pack is about - activities, location, type of pets welcome..."
                  rows={4}
                  className="text-lg rounded-xl border-2 focus:border-primary resize-none"
                />
              </div>

              {/* Privacy Settings */}
              <div className="space-y-4">
                <Label className="text-lg font-medium">Pack Privacy</Label>
                <RadioGroup
                  value={privacy}
                  onValueChange={(value) => setPrivacy(value as 'public' | 'private')}
                  className="space-y-4"
                >
                  <div className="flex items-start space-x-4 p-4 rounded-xl border-2 border-border hover:border-primary/50 transition-colors">
                    <RadioGroupItem value="public" id="public" className="mt-1" />
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-primary" />
                        <Label htmlFor="public" className="text-lg font-medium cursor-pointer">
                          Public Pack
                        </Label>
                      </div>
                      <p className="text-muted-foreground">
                        Anyone can find this pack and request to join. Great for growing your community!
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 rounded-xl border-2 border-border hover:border-primary/50 transition-colors">
                    <RadioGroupItem value="private" id="private" className="mt-1" />
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <Lock className="h-5 w-5 text-primary" />
                        <Label htmlFor="private" className="text-lg font-medium cursor-pointer">
                          Private Pack
                        </Label>
                      </div>
                      <p className="text-muted-foreground">
                        This pack is invite-only and cannot be found by searching. Perfect for close friends.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={isCreating || !packName.trim()}
                  className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isCreating ? 'Creating Pack...' : 'Create Pack & Invite Friends'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatePackForm;