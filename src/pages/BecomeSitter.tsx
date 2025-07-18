import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import SimplePhotoUpload from "@/components/SimplePhotoUpload";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const services = [
  "Dog Walking",
  "House Sitting", 
  "Drop-In Visits",
  "Pet Grooming",
  "Overnight Care",
  "Pet Training"
];

export default function BecomeSitter() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    services: [] as string[],
    ratePerDay: "",
    photos: [] as string[]
  });

  const handleServiceChange = (service: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, service]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        services: prev.services.filter(s => s !== service)
      }));
    }
  };

  const handlePhotosChange = (photos: string[]) => {
    setFormData(prev => ({
      ...prev,
      photos
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Create sitter profile
      const { data: sitterProfile, error: profileError } = await supabase
        .from('sitter_profiles')
        .insert({
          user_id: user.id,
          bio: formData.bio,
          location: formData.location,
          rate_per_day: parseFloat(formData.ratePerDay),
          is_active: true
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Add services
      const servicePromises = formData.services.map(service =>
        supabase.from('sitter_services').insert({
          sitter_id: sitterProfile.id,
          service_type: service
        })
      );

      await Promise.all(servicePromises);

      // Add photos
      const photoPromises = formData.photos.map((photo, index) =>
        supabase.from('sitter_photos').insert({
          sitter_id: sitterProfile.id,
          photo_url: photo,
          is_primary: index === 0
        })
      );

      await Promise.all(photoPromises);

      toast({
        title: "Success!",
        description: "Your sitter profile has been created and is now active.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating sitter profile:', error);
      toast({
        title: "Error",
        description: "Failed to create sitter profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.bio.trim() && formData.location.trim();
      case 2:
        return formData.services.length > 0 && formData.ratePerDay;
      case 3:
        return formData.photos.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-teal/5 p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="shadow-lg rounded-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-primary">
              Become a Sitter
            </CardTitle>
            <div className="flex justify-center mt-4 space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full ${
                    step <= currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-center">The Basics</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Tell us about yourself</Label>
                  <Textarea
                    id="bio"
                    placeholder="Share your experience with pets, your passion for animal care, and what makes you a great sitter..."
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="min-h-32"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, State or Zip Code"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-center">Services & Rates</h3>
                
                <div className="space-y-4">
                  <Label>Services Offered</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {services.map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={service}
                          checked={formData.services.includes(service)}
                          onCheckedChange={(checked) => 
                            handleServiceChange(service, checked as boolean)
                          }
                        />
                        <Label htmlFor={service}>{service}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate">Rate per Day ($)</Label>
                  <Input
                    id="rate"
                    type="number"
                    placeholder="50.00"
                    value={formData.ratePerDay}
                    onChange={(e) => setFormData(prev => ({ ...prev, ratePerDay: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-center">Photo Gallery</h3>
                <p className="text-center text-muted-foreground">
                  Upload photos of your space or yourself with pets to build trust with pet owners
                </p>
                
                <SimplePhotoUpload
                  onPhotosChange={handlePhotosChange}
                  maxPhotos={8}
                />
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {loading ? "Creating..." : "Save & Activate Profile"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}