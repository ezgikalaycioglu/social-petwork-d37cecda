
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
import { useToast } from '@/hooks/use-toast';
import PhotoUpload from '@/components/PhotoUpload';
import { ArrowLeft, Heart } from 'lucide-react';

const petProfileSchema = z.object({
  name: z.string().min(1, 'Pet name is required').max(50, 'Pet name must be 50 characters or less'),
  age: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Unknown/Other']),
  breed: z.string().min(1, 'Breed is required').max(100, 'Breed must be 100 characters or less'),
  about: z.string().max(500, 'About section must be 500 characters or less').optional(),
});

type PetProfileForm = z.infer<typeof petProfileSchema>;

const CreatePetProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PetProfileForm>({
    resolver: zodResolver(petProfileSchema),
    defaultValues: {
      name: '',
      age: '',
      gender: 'Unknown/Other',
      breed: '',
      about: '',
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
        about: data.about || null,
        profile_photo_url: photoUrl || null,
      };

      const { error } = await supabase
        .from('pet_profiles')
        .insert(petData);

      if (error) {
        throw error;
      }

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
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
                {/* Photo Upload */}
                <div className="flex flex-col items-center mb-8">
                  <PhotoUpload
                    currentPhotoUrl={photoUrl}
                    onPhotoUploaded={setPhotoUrl}
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Unknown/Other">Unknown/Other</SelectItem>
                          </SelectContent>
                        </Select>
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

                {/* About */}
                <FormField
                  control={form.control}
                  name="about"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">About Your Pet (optional)</FormLabel>
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
    </div>
  );
};

export default CreatePetProfile;
