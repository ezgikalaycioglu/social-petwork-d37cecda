
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import PhotoUpload from '@/components/PhotoUpload';
import MultiplePhotoUpload from '@/components/MultiplePhotoUpload';
import PersonalityTraitsSelector from '@/components/PersonalityTraitsSelector';
import Layout from '@/components/Layout';
import { ArrowLeft, Heart, PawPrint } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

const petProfileSchema = z.object({
  name: z.string().min(1, 'Pet name is required').max(50, 'Pet name must be 50 characters or less'),
  age: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Unknown/Other']),
  breed: z.string().min(1, 'Breed is required').max(100, 'Breed must be 100 characters or less'),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  vaccinationStatus: z.enum(['Up-to-date', 'Not vaccinated', 'Unknown']),
});

type PetProfileForm = z.infer<typeof petProfileSchema>;

const EditPetProfile = () => {
  const navigate = useNavigate();
  const { petId } = useParams<{ petId: string }>();
  const { toast } = useToast();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [personalityTraits, setPersonalityTraits] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState<PetProfile | null>(null);

  const form = useForm<PetProfileForm>({
    resolver: zodResolver(petProfileSchema),
    defaultValues: {
      name: '',
      age: '',
      gender: 'Unknown/Other',
      breed: '',
      bio: '',
      vaccinationStatus: 'Unknown',
    },
  });

  useEffect(() => {
    if (petId) {
      fetchPet();
    }
  }, [petId]);

  const fetchPet = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('id', petId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw error;
      }

      setPet(data);
      setProfilePhotoUrl(data.profile_photo_url || '');
      setPhotos(data.photos || []);
      setPersonalityTraits(data.personality_traits || []);
      
      // Populate form with existing data
      form.reset({
        name: data.name,
        age: data.age?.toString() || '',
        gender: data.gender as 'Male' | 'Female' | 'Unknown/Other',
        breed: data.breed,
        bio: data.bio || data.about || '',
        vaccinationStatus: (data.vaccination_status as 'Up-to-date' | 'Not vaccinated' | 'Unknown') || 'Unknown',
      });
    } catch (error) {
      console.error('Error fetching pet:', error);
      toast({
        title: "Error",
        description: "Failed to load pet profile.",
        variant: "destructive",
      });
      navigate('/my-pets');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PetProfileForm) => {
    if (!petId) return;
    
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to update the pet profile.",
          variant: "destructive",
        });
        return;
      }

      const updateData = {
        name: data.name,
        age: data.age ? parseInt(data.age) : null,
        gender: data.gender,
        breed: data.breed,
        bio: data.bio || null,
        about: data.bio || null, // Keep for compatibility
        profile_photo_url: profilePhotoUrl || null,
        photos: photos.length > 0 ? photos : null,
        personality_traits: personalityTraits.length > 0 ? personalityTraits : null,
        vaccination_status: data.vaccinationStatus,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('pet_profiles')
        .update(updateData)
        .eq('id', petId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "Pet profile updated successfully.",
      });

      navigate('/my-pets');
    } catch (error) {
      console.error('Error updating pet profile:', error);
      toast({
        title: "Error",
        description: "Failed to update pet profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <PawPrint className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-gray-600">Loading pet profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!pet) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <p className="text-gray-600">Pet profile not found.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/my-pets')}
              className="mr-4 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                Edit Pet Profile
                <Heart className="h-6 w-6 text-red-500" />
              </h1>
              <p className="text-gray-600 mt-1">Update {pet.name}'s information</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Profile Photo Upload */}
                <div className="flex flex-col items-center mb-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Profile Picture</h3>
                  <PhotoUpload
                    currentPhotoUrl={profilePhotoUrl}
                    onPhotoUploaded={setProfilePhotoUrl}
                    bucketName="pet-photos"
                  />
                </div>

                {/* Pet Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Pet Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your pet's name"
                          {...field}
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Age and Gender Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Age (optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Age in years"
                            {...field}
                            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Gender</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Male" id="edit-male" />
                              <label htmlFor="edit-male" className="text-sm font-medium">Male</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Female" id="edit-female" />
                              <label htmlFor="edit-female" className="text-sm font-medium">Female</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Unknown/Other" id="edit-other" />
                              <label htmlFor="edit-other" className="text-sm font-medium">Unknown/Other</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Breed */}
                <FormField
                  control={form.control}
                  name="breed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Breed or Mix *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Golden Retriever, Mixed Breed, etc."
                          {...field}
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bio */}
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Bio (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your pet's personality, favorite activities, or anything special about them..."
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500 min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-sm text-gray-500 mt-1">
                        {field.value?.length || 0}/500 characters
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Vaccination Status */}
                <FormField
                  control={form.control}
                  name="vaccinationStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Vaccination Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                            <SelectValue placeholder="Select vaccination status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Up-to-date">Up-to-date</SelectItem>
                          <SelectItem value="Not vaccinated">Not vaccinated</SelectItem>
                          <SelectItem value="Unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Personality Traits */}
                <div className="space-y-2">
                  <label className="text-gray-700 font-medium">Personality Traits (optional)</label>
                  <PersonalityTraitsSelector
                    selectedTraits={personalityTraits}
                    onTraitsChange={setPersonalityTraits}
                  />
                </div>

                {/* Additional Photos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-700">Additional Photos (optional)</h3>
                  <MultiplePhotoUpload
                    currentPhotos={photos}
                    onPhotosUploaded={setPhotos}
                    bucketName="pet-photos"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium"
                  >
                    {isSubmitting ? 'Updating Profile...' : 'Update Pet Profile'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center text-gray-600 text-sm">
            <p>* Required fields</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditPetProfile;
