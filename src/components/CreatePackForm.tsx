import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, Users, Lock, X } from 'lucide-react';
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
  const [errors, setErrors] = useState<{ packName?: string }>({});
  
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
    
    // Validate
    const newErrors: { packName?: string } = {};
    if (!packName.trim()) {
      newErrors.packName = 'Pack name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    if (!user) return;
    setErrors({});
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
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto">
        {/* Compact Header - Sticky & Safe-Area Aware */}
        <div className="sticky top-[var(--app-topbar-height,0px)] inset-x-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 px-4 py-2 pt-[max(8px,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-base font-semibold text-gray-900 truncate">
              Create your pack
            </h1>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-sm px-2 h-9 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              Cancel
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 space-y-4 pt-4 pb-24">
          {/* Pack Avatar Section */}
          <Card className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1">Pack Avatar</h2>
              <div className="flex items-center gap-4">
                <Avatar className="size-28 rounded-full border border-gray-200 bg-gray-50">
                  <AvatarImage src={avatarPreview} />
                  <AvatarFallback className="bg-gray-50 text-gray-400">
                    <Camera className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <label htmlFor="avatar-upload">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="h-9 rounded-full px-3 text-sm"
                      asChild
                    >
                      <span className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose image
                      </span>
                    </Button>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    aria-label="Upload pack avatar"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a group photo or logo
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Pack Name Section */}
          <Card className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 space-y-3">
            <div>
              <Label htmlFor="pack-name" className="text-sm font-semibold text-gray-900 mb-1">
                Pack Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pack-name"
                value={packName}
                onChange={(e) => {
                  setPackName(e.target.value);
                  if (errors.packName) setErrors({ ...errors, packName: undefined });
                }}
                placeholder="e.g., Downtown Dog Walkers"
                className={`h-11 text-sm rounded-xl mt-2 focus:ring-2 focus:ring-primary/30 ${
                  errors.packName ? 'border-red-300' : ''
                }`}
                required
                aria-invalid={!!errors.packName}
                aria-describedby={errors.packName ? 'pack-name-error' : undefined}
              />
              {errors.packName && (
                <p 
                  id="pack-name-error" 
                  className="text-xs text-red-600 mt-1"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.packName}
                </p>
              )}
            </div>
          </Card>

          {/* Description Section */}
          <Card className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 space-y-3">
            <div>
              <Label htmlFor="description" className="text-sm font-semibold text-gray-900 mb-1">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell others what your pack is about - activities, location, type of pets welcome..."
                rows={4}
                className="text-sm rounded-xl mt-2 resize-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </Card>

          {/* Privacy Section */}
          <Card className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Pack Privacy</h2>
              <RadioGroup
                value={privacy}
                onValueChange={(value) => setPrivacy(value as 'public' | 'private')}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <div 
                  className={`rounded-xl border p-3 hover:border-gray-300 transition-colors cursor-pointer ${
                    privacy === 'public' 
                      ? 'border-primary ring-1 ring-primary/20 bg-primary/5' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => setPrivacy('public')}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem 
                      value="public" 
                      id="public" 
                      className="mt-0.5" 
                      aria-checked={privacy === 'public'}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <Label htmlFor="public" className="text-sm font-semibold cursor-pointer">
                          Public Pack
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Anyone can find and join
                      </p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`rounded-xl border p-3 hover:border-gray-300 transition-colors cursor-pointer ${
                    privacy === 'private' 
                      ? 'border-primary ring-1 ring-primary/20 bg-primary/5' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => setPrivacy('private')}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem 
                      value="private" 
                      id="private" 
                      className="mt-0.5"
                      aria-checked={privacy === 'private'}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-primary" />
                        <Label htmlFor="private" className="text-sm font-semibold cursor-pointer">
                          Private Pack
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Invite-only
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </Card>
        </form>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 inset-x-0 bg-white/90 backdrop-blur px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] border-t border-gray-100 z-40">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !packName.trim()}
              onClick={handleSubmit}
              className="h-11 rounded-full px-5 text-sm font-medium bg-primary text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {isCreating ? 'Creating...' : 'Create Pack & Invite Friends'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePackForm;