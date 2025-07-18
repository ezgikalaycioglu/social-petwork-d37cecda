import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MultiplePhotoUpload from "@/components/MultiplePhotoUpload";
import { ArrowLeft, ArrowRight, Check, Upload, Shield, Heart, DollarSign, Settings, User, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const services = [
  "House Sitting",
  "Drop-In Visits", 
  "Dog Walking",
  "Day Care",
  "Overnight Boarding",
  "Pet Grooming"
];

const animalTypes = [
  "Dogs", "Cats", "Rabbits", "Birds", "Reptiles", "Fish", "Small Mammals", "Exotic Pets"
];

const specialNeeds = [
  "Administering Medication (pills)",
  "Administering Medication (injections)", 
  "Senior Pets",
  "Anxious or Fearful Pets",
  "Puppies / Kittens",
  "Special Diet Requirements"
];

const cancellationPolicies = [
  { value: "flexible", label: "Flexible - Full refund 1 day prior" },
  { value: "moderate", label: "Moderate - Full refund 5 days prior" },
  { value: "strict", label: "Strict - Full refund 7 days prior" }
];

interface FormData {
  // Core Profile & Credentials
  fullName: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  zipCode: string;
  profilePhoto: string;
  governmentIdVerified: boolean;
  backgroundCheckCompleted: boolean;
  references: string;
  hasInsurance: boolean;
  certifications: string;
  
  // Experience & Skills
  yearsExperience: string;
  bio: string;
  animalTypes: string[];
  dogBreedExperience: string;
  specialNeedsExperience: string[];
  photoGallery: string[];
  
  // Services & Rates
  services: string[];
  rates: Record<string, string>;
  
  // Preferences & House Rules
  maxPets: string;
  acceptsUnfixed: boolean;
  hasOwnPets: boolean;
  ownPetsDescription: string;
  hasFencedYard: boolean;
  hasChildren: boolean;
  smokingAllowed: boolean;
  cancellationPolicy: string;
  
  // Terms
  acceptsTerms: boolean;
}

export default function BecomeSitter() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    // Core Profile & Credentials
    fullName: "",
    phone: "",
    email: user?.email || "",
    city: "",
    state: "",
    zipCode: "",
    profilePhoto: "",
    governmentIdVerified: false,
    backgroundCheckCompleted: false,
    references: "",
    hasInsurance: false,
    certifications: "",
    
    // Experience & Skills
    yearsExperience: "",
    bio: "",
    animalTypes: [],
    dogBreedExperience: "",
    specialNeedsExperience: [],
    photoGallery: [],
    
    // Services & Rates
    services: [],
    rates: {},
    
    // Preferences & House Rules
    maxPets: "",
    acceptsUnfixed: false,
    hasOwnPets: false,
    ownPetsDescription: "",
    hasFencedYard: false,
    hasChildren: false,
    smokingAllowed: false,
    cancellationPolicy: "",
    
    // Terms
    acceptsTerms: false
  });

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof FormData, item: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), item]
        : (prev[field] as string[]).filter(i => i !== item)
    }));
  };

  const handleRateChange = (service: string, rate: string) => {
    setFormData(prev => ({
      ...prev,
      rates: { ...prev.rates, [service]: rate }
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.fullName && formData.phone && formData.city && formData.zipCode && formData.profilePhoto && formData.acceptsTerms);
      case 2:
        return !!(formData.bio && formData.yearsExperience && formData.animalTypes.length > 0);
      case 3:
        return !!(formData.services.length > 0 && formData.services.every(service => formData.rates[service]));
      case 4:
        return !!(formData.maxPets && formData.cancellationPolicy);
      default:
        return false;
    }
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
          location: `${formData.city}, ${formData.state} ${formData.zipCode}`,
          rate_per_day: parseFloat(formData.rates[formData.services[0]] || "0"),
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
      const photoPromises = formData.photoGallery.map((photo, index) =>
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
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const stepIcons = [Shield, Heart, DollarSign, Settings];
  const stepTitles = [
    "Core Profile & Credentials",
    "Experience & Skills", 
    "Services & Rates",
    "Preferences & House Rules"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto">
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
              Become a Pet Sitter
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Join our community of trusted pet sitters
            </p>
            
            {/* Progress Indicator */}
            <div className="flex justify-center mt-6 space-x-4">
              {[1, 2, 3, 4].map((step) => {
                const Icon = stepIcons[step - 1];
                return (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                        step <= currentStep 
                          ? 'bg-primary border-primary text-primary-foreground' 
                          : 'border-muted-foreground/30 text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs mt-1 text-center max-w-20">
                      {stepTitles[step - 1]}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {/* Step 1: Core Profile & Credentials */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Shield className="w-12 h-12 mx-auto text-primary mb-2" />
                  <h3 className="text-2xl font-semibold">Core Profile & Credentials</h3>
                  <p className="text-muted-foreground">Essential information for building trust</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="Your full name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Your city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      placeholder="State or Province"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip/Postal Code *</Label>
                    <Input
                      id="zipCode"
                      placeholder="12345"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Profile Photo *</Label>
                  <MultiplePhotoUpload
                    currentPhotos={formData.profilePhoto ? [formData.profilePhoto] : []}
                    onPhotosUploaded={(photos) => handleInputChange('profilePhoto', photos[0] || "")}
                    bucketName="pet-photos"
                    className="max-w-xs"
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload a clear, friendly photo of yourself
                  </p>
                </div>

                <div className="space-y-4">
                  <Label>Verification & Safety (Recommended)</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="governmentId"
                        checked={formData.governmentIdVerified}
                        onCheckedChange={(checked) => handleInputChange('governmentIdVerified', checked)}
                      />
                      <Label htmlFor="governmentId">Government ID Verified</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="backgroundCheck"
                        checked={formData.backgroundCheckCompleted}
                        onCheckedChange={(checked) => handleInputChange('backgroundCheckCompleted', checked)}
                      />
                      <Label htmlFor="backgroundCheck">Background Check Completed</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="insurance"
                        checked={formData.hasInsurance}
                        onCheckedChange={(checked) => handleInputChange('hasInsurance', checked)}
                      />
                      <Label htmlFor="insurance">I have liability insurance</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="references">References</Label>
                  <Textarea
                    id="references"
                    placeholder="Contact information for 1-3 previous clients or personal references..."
                    value={formData.references}
                    onChange={(e) => handleInputChange('references', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Textarea
                    id="certifications"
                    placeholder="Pet First Aid & CPR certification or other relevant animal care certifications..."
                    value={formData.certifications}
                    onChange={(e) => handleInputChange('certifications', e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptsTerms}
                    onCheckedChange={(checked) => handleInputChange('acceptsTerms', checked)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the Terms of Service and Privacy Policy *
                  </Label>
                </div>
              </div>
            )}

            {/* Step 2: Experience & Skills */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Heart className="w-12 h-12 mx-auto text-primary mb-2" />
                  <h3 className="text-2xl font-semibold">Experience & Skills</h3>
                  <p className="text-muted-foreground">Help owners find the perfect match</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience *</Label>
                    <Select 
                      value={formData.yearsExperience} 
                      onValueChange={(value) => handleInputChange('yearsExperience', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0-1 years</SelectItem>
                        <SelectItem value="1-3">1-3 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="5-10">5-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">About Me / Bio *</Label>
                  <Textarea
                    id="bio"
                    placeholder="Describe your love for animals, your experience, and your pet care philosophy. What makes you a great sitter?"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="min-h-32"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Types of Animals You're Comfortable With *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {animalTypes.map((animal) => (
                      <div key={animal} className="flex items-center space-x-2">
                        <Checkbox
                          id={animal}
                          checked={formData.animalTypes.includes(animal)}
                          onCheckedChange={(checked) => 
                            handleArrayChange('animalTypes', animal, checked as boolean)
                          }
                        />
                        <Label htmlFor={animal}>{animal}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dogBreeds">Dog Breed Experience</Label>
                  <Textarea
                    id="dogBreeds"
                    placeholder="Describe your experience with large breeds, high-energy breeds, etc."
                    value={formData.dogBreedExperience}
                    onChange={(e) => handleInputChange('dogBreedExperience', e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Special Needs Experience</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {specialNeeds.map((need) => (
                      <div key={need} className="flex items-center space-x-2">
                        <Checkbox
                          id={need}
                          checked={formData.specialNeedsExperience.includes(need)}
                          onCheckedChange={(checked) => 
                            handleArrayChange('specialNeedsExperience', need, checked as boolean)
                          }
                        />
                        <Label htmlFor={need} className="text-sm">{need}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Photo Gallery</Label>
                  <MultiplePhotoUpload
                    currentPhotos={formData.photoGallery}
                    onPhotosUploaded={(photos) => handleInputChange('photoGallery', photos)}
                    bucketName="pet-photos"
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload photos of yourself with pets or your home environment
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Services & Rates */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <DollarSign className="w-12 h-12 mx-auto text-primary mb-2" />
                  <h3 className="text-2xl font-semibold">Services & Rates</h3>
                  <p className="text-muted-foreground">Define your offerings and pricing</p>
                </div>

                <div className="space-y-4">
                  <Label>Services Offered *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={service}
                          checked={formData.services.includes(service)}
                          onCheckedChange={(checked) => 
                            handleArrayChange('services', service, checked as boolean)
                          }
                        />
                        <Label htmlFor={service}>{service}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {formData.services.length > 0 && (
                  <div className="space-y-4">
                    <Label>Set Rates for Selected Services *</Label>
                    <div className="grid gap-4">
                      {formData.services.map((service) => (
                        <div key={service} className="flex items-center space-x-4">
                          <Label className="min-w-0 flex-1">{service}</Label>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">$</span>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={formData.rates[service] || ""}
                              onChange={(e) => handleRateChange(service, e.target.value)}
                              className="w-24"
                            />
                            <span className="text-sm text-muted-foreground">
                              {service.includes('Walking') ? '/walk' : 
                               service.includes('Visit') ? '/visit' : '/day'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Preferences & House Rules */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Settings className="w-12 h-12 mx-auto text-primary mb-2" />
                  <h3 className="text-2xl font-semibold">Preferences & House Rules</h3>
                  <p className="text-muted-foreground">Set your boundaries and preferences</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="maxPets">Maximum Pets at Once *</Label>
                    <Select 
                      value={formData.maxPets} 
                      onValueChange={(value) => handleInputChange('maxPets', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select maximum" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 pet</SelectItem>
                        <SelectItem value="2">2 pets</SelectItem>
                        <SelectItem value="3">3 pets</SelectItem>
                        <SelectItem value="4">4 pets</SelectItem>
                        <SelectItem value="5+">5+ pets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cancellation">Cancellation Policy *</Label>
                    <Select 
                      value={formData.cancellationPolicy} 
                      onValueChange={(value) => handleInputChange('cancellationPolicy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                      <SelectContent>
                        {cancellationPolicies.map((policy) => (
                          <SelectItem key={policy.value} value={policy.value}>
                            {policy.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Pet Preferences</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="unfixed"
                      checked={formData.acceptsUnfixed}
                      onCheckedChange={(checked) => handleInputChange('acceptsUnfixed', checked)}
                    />
                    <Label htmlFor="unfixed">I accept pets that are not spayed or neutered</Label>
                  </div>
                </div>

                {(formData.services.includes('Day Care') || formData.services.includes('Overnight Boarding')) && (
                  <div className="space-y-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold">Your Home Environment</h4>
                    <p className="text-sm text-muted-foreground">
                      Required for boarding and day care services
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="ownPets"
                          checked={formData.hasOwnPets}
                          onCheckedChange={(checked) => handleInputChange('hasOwnPets', checked)}
                        />
                        <Label htmlFor="ownPets">I have my own pets</Label>
                      </div>

                      {formData.hasOwnPets && (
                        <div className="space-y-2 ml-6">
                          <Label htmlFor="ownPetsDesc">Describe your pets</Label>
                          <Textarea
                            id="ownPetsDesc"
                            placeholder="What kind of pets do you have? Are they friendly with other animals?"
                            value={formData.ownPetsDescription}
                            onChange={(e) => handleInputChange('ownPetsDescription', e.target.value)}
                          />
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="yard"
                          checked={formData.hasFencedYard}
                          onCheckedChange={(checked) => handleInputChange('hasFencedYard', checked)}
                        />
                        <Label htmlFor="yard">I have a fenced yard</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="children"
                          checked={formData.hasChildren}
                          onCheckedChange={(checked) => handleInputChange('hasChildren', checked)}
                        />
                        <Label htmlFor="children">There are children in my home</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="smoking"
                          checked={formData.smokingAllowed}
                          onCheckedChange={(checked) => handleInputChange('smokingAllowed', checked)}
                        />
                        <Label htmlFor="smoking">Smoking is allowed in my home</Label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!validateStep(currentStep) || loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {loading ? "Creating Profile..." : "Create Sitter Profile"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}