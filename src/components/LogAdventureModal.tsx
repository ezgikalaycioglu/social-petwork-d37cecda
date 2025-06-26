
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { X, Upload, Calendar, MapPin } from 'lucide-react';
import MultiplePhotoUpload from './MultiplePhotoUpload';

interface LogAdventureModalProps {
  petId: string;
  petName: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface PetOption {
  id: string;
  name: string;
  profile_photo_url: string | null;
}

const LogAdventureModal = ({ petId, petName, onClose, onSuccess }: LogAdventureModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    adventureDate: new Date().toISOString().split('T')[0],
    description: '',
    photos: [] as string[],
    taggedPets: [] as string[]
  });
  const [availablePets, setAvailablePets] = useState<PetOption[]>([]);
  const [selectedTaggedPets, setSelectedTaggedPets] = useState<PetOption[]>([]);
  const [petSearch, setPetSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailablePets();
  }, []);

  const fetchAvailablePets = async () => {
    try {
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('id, name, profile_photo_url')
        .neq('id', petId)
        .order('name');

      if (error) throw error;
      setAvailablePets(data || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotosUploaded = (urls: string[]) => {
    setFormData(prev => ({ ...prev, photos: urls }));
  };

  const addTaggedPet = (pet: PetOption) => {
    if (!selectedTaggedPets.find(p => p.id === pet.id)) {
      const newTaggedPets = [...selectedTaggedPets, pet];
      setSelectedTaggedPets(newTaggedPets);
      setFormData(prev => ({ 
        ...prev, 
        taggedPets: newTaggedPets.map(p => p.id) 
      }));
    }
    setPetSearch('');
  };

  const removeTaggedPet = (petId: string) => {
    const newTaggedPets = selectedTaggedPets.filter(p => p.id !== petId);
    setSelectedTaggedPets(newTaggedPets);
    setFormData(prev => ({ 
      ...prev, 
      taggedPets: newTaggedPets.map(p => p.id) 
    }));
  };

  const filteredPets = availablePets.filter(pet =>
    pet.name.toLowerCase().includes(petSearch.toLowerCase()) &&
    !selectedTaggedPets.find(selected => selected.id === pet.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter an adventure title",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('adventures')
        .insert({
          pet_id: petId,
          owner_id: user.id,
          title: formData.title,
          description: formData.description || null,
          adventure_date: formData.adventureDate,
          photos: formData.photos,
          tagged_pet_ids: formData.taggedPets
        });

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error saving adventure:', error);
      toast({
        title: "Error",
        description: "Failed to save adventure. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Log New Adventure for {petName}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Adventure Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Beach Day at Fort Funston"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adventureDate">Adventure Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="adventureDate"
                  type="date"
                  value={formData.adventureDate}
                  onChange={(e) => handleInputChange('adventureDate', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell us about this adventure! What happened? Who did you meet?"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Adventure Photos</Label>
              <MultiplePhotoUpload
                currentPhotos={formData.photos}
                onPhotosUploaded={handlePhotosUploaded}
                bucketName="adventures"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taggedPets">Tag Other Pets</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Search for pets to tag..."
                  value={petSearch}
                  onChange={(e) => setPetSearch(e.target.value)}
                />
                
                {petSearch && filteredPets.length > 0 && (
                  <div className="border rounded-md max-h-32 overflow-y-auto">
                    {filteredPets.slice(0, 5).map(pet => (
                      <button
                        key={pet.id}
                        type="button"
                        onClick={() => addTaggedPet(pet)}
                        className="w-full p-2 text-left hover:bg-gray-50 flex items-center gap-2"
                      >
                        {pet.profile_photo_url && (
                          <img
                            src={pet.profile_photo_url}
                            alt={pet.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                        <span>{pet.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {selectedTaggedPets.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTaggedPets.map(pet => (
                      <div
                        key={pet.id}
                        className="flex items-center gap-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm"
                      >
                        {pet.profile_photo_url && (
                          <img
                            src={pet.profile_photo_url}
                            alt={pet.name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                        )}
                        <span>{pet.name}</span>
                        <button
                          type="button"
                          onClick={() => removeTaggedPet(pet.id)}
                          className="ml-1 text-green-600 hover:text-green-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Saving...' : 'Save Adventure'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogAdventureModal;
