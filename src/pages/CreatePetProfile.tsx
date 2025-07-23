
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useAnalytics } from '@/hooks/useAnalytics';
import PhotoUpload from '@/components/PhotoUpload';
import MultiplePhotoUpload from '@/components/MultiplePhotoUpload';
import PersonalityTraitsSelector from '@/components/PersonalityTraitsSelector';
import Layout from '@/components/Layout';
import { ArrowLeft, Heart } from 'lucide-react';

const petProfileSchema = z.object({
  name: z.string().min(1, 'Pet name is required').max(50, 'Pet name must be 50 characters or less'),
  age: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Unknown/Other']),
  breed: z.string().min(1, 'Breed is required').max(100, 'Breed must be 100 characters or less'),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  vaccinationStatus: z.enum(['Up-to-date', 'Not vaccinated', 'Unknown']),
});

type PetProfileForm = z.infer<typeof petProfileSchema>;

const CreatePetProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [personalityTraits, setPersonalityTraits] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit = async (data: PetProfileForm) => {
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to create a pet profile.",
          variant: "destructive",
        });
        return;
      }

      const petData = {
        user_id: user.id,
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
      };

      const { error } = await supabase
        .from('pet_profiles')
        .insert(petData);

      if (error) {
        throw error;
      }

      // Track analytics event with correct property names
      trackEvent('Pet Profile Created', {
        pet_breed: data.breed,
        pet_age: data.age ? parseInt(data.age) : undefined,
        pet_gender: data.gender,
        has_profile_photo: !!profilePhotoUrl,
        personality_traits_count: personalityTraits.length,
      });

      toast({
        title: "Success!",
        description: "Your pet profile has been created successfully.",
      });

      navigate('/my-pets');
    } catch (error) {
      console.error('Error creating pet profile:', error);
      toast({
        title: "Error",
        description: "Failed to create pet profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mr-4 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                Create Pet Profile
                <Heart className="h-6 w-6 text-red-500" />
              </h1>
              <p className="text-gray-600 mt-1">Tell us about your furry friend</p>
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
                            defaultValue={field.value}
                            className="flex flex-col space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Male" id="male" />
                              <label htmlFor="male" className="text-sm font-medium">Male</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Female" id="female" />
                              <label htmlFor="female" className="text-sm font-medium">Female</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Unknown/Other" id="other" />
                              <label htmlFor="other" className="text-sm font-medium">Unknown/Other</label>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    {isSubmitting ? 'Creating Profile...' : 'Create Pet Profile'}
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

export default CreatePetProfile;
