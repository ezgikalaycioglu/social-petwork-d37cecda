import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar as CalendarIcon,
  Star, 
  MapPin, 
  Shield,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  Users,
  PawPrint,
  Home,
  Phone,
  Mail,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

interface BookingFlowProps {
  type: 'pet-sitting' | 'house-sitting';
  providerId: string;
  providerName: string;
  providerPhoto: string;
  providerLocation: string;
  providerRating: number;
  dailyRate: number;
  onComplete: (bookingData: any) => void;
}

interface BookingData {
  dates: DateRange | undefined;
  guests?: number;
  pets?: {
    name: string;
    type: string;
    age: string;
    specialNeeds: string;
  }[];
  specialRequests: string;
  contactInfo: {
    phone: string;
    email: string;
    emergencyContact: string;
  };
  paymentMethod: string;
  agreedToTerms: boolean;
}

const BookingFlow: React.FC<BookingFlowProps> = ({
  type,
  providerId,
  providerName,
  providerPhoto,
  providerLocation,
  providerRating,
  dailyRate,
  onComplete
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    dates: undefined,
    guests: type === 'house-sitting' ? 1 : undefined,
    pets: type === 'pet-sitting' ? [{ name: '', type: '', age: '', specialNeeds: '' }] : undefined,
    specialRequests: '',
    contactInfo: {
      phone: '',
      email: '',
      emergencyContact: ''
    },
    paymentMethod: '',
    agreedToTerms: false
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const calculateTotal = () => {
    if (!bookingData.dates?.from || !bookingData.dates?.to) return 0;
    const days = differenceInDays(bookingData.dates.to, bookingData.dates.from) + 1;
    const subtotal = days * dailyRate;
    const serviceFee = subtotal * 0.1; // 10% service fee
    return subtotal + serviceFee;
  };

  const getDays = () => {
    if (!bookingData.dates?.from || !bookingData.dates?.to) return 0;
    return differenceInDays(bookingData.dates.to, bookingData.dates.from) + 1;
  };

  const addPet = () => {
    if (bookingData.pets) {
      setBookingData({
        ...bookingData,
        pets: [...bookingData.pets, { name: '', type: '', age: '', specialNeeds: '' }]
      });
    }
  };

  const updatePet = (index: number, field: string, value: string) => {
    if (bookingData.pets) {
      const updatedPets = [...bookingData.pets];
      updatedPets[index] = { ...updatedPets[index], [field]: value };
      setBookingData({ ...bookingData, pets: updatedPets });
    }
  };

  const removePet = (index: number) => {
    if (bookingData.pets && bookingData.pets.length > 1) {
      const updatedPets = bookingData.pets.filter((_, i) => i !== index);
      setBookingData({ ...bookingData, pets: updatedPets });
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return bookingData.dates?.from && bookingData.dates?.to;
      case 2:
        if (type === 'pet-sitting') {
          return bookingData.pets?.every(pet => pet.name && pet.type && pet.age);
        }
        return true;
      case 3:
        return bookingData.contactInfo.phone && bookingData.contactInfo.email;
      case 4:
        return bookingData.paymentMethod && bookingData.agreedToTerms;
      default:
        return false;
    }
  };

  const handleComplete = () => {
    toast({
      title: "Booking submitted!",
      description: "Your booking request has been sent. You'll receive a confirmation shortly.",
      duration: 5000,
    });
    onComplete(bookingData);
  };

  const StepHeader = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">
          {currentStep === 1 && "Select your dates"}
          {currentStep === 2 && (type === 'pet-sitting' ? "Tell us about your pets" : "Booking details")}
          {currentStep === 3 && "Contact information"}
          {currentStep === 4 && "Payment & confirmation"}
        </h2>
        <Badge variant="outline" className="px-3 py-1">
          Step {currentStep} of {totalSteps}
        </Badge>
      </div>
      <Progress value={progress} className="h-2 mb-6" />
    </div>
  );

  const ProviderCard = () => (
    <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-r from-primary/5 to-background">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16 border-2 border-primary/20">
            <AvatarImage src={providerPhoto} alt={providerName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {providerName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground">{providerName}</h3>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {providerLocation}
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                {providerRating}
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-1 text-green-600" />
                Verified
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">${dailyRate}</div>
            <div className="text-sm text-muted-foreground">per {type === 'house-sitting' ? 'night' : 'day'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PricingBreakdown = () => {
    const days = getDays();
    const subtotal = days * dailyRate;
    const serviceFee = subtotal * 0.1;
    const total = subtotal + serviceFee;

    return (
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Pricing breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>${dailyRate} × {days} {days === 1 ? 'day' : 'days'}</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Service fee</span>
            <span>${serviceFee.toFixed(2)}</span>
          </div>
          <hr className="border-border" />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <StepHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Date Selection */}
            {currentStep === 1 && (
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">When do you need {type === 'house-sitting' ? 'accommodation' : 'pet care'}?</h3>
                      <Calendar
                        mode="range"
                        selected={bookingData.dates}
                        onSelect={(dates) => setBookingData({ ...bookingData, dates })}
                        numberOfMonths={2}
                        className="border rounded-xl p-4"
                        disabled={(date) => date < new Date()}
                      />
                    </div>

                    {type === 'house-sitting' && (
                      <div>
                        <Label htmlFor="guests" className="text-base font-medium">Number of guests</Label>
                        <div className="flex items-center space-x-4 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBookingData({ 
                              ...bookingData, 
                              guests: Math.max(1, (bookingData.guests || 1) - 1) 
                            })}
                          >
                            -
                          </Button>
                          <span className="w-16 text-center font-medium">{bookingData.guests || 1} guests</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBookingData({ 
                              ...bookingData, 
                              guests: (bookingData.guests || 1) + 1 
                            })}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    )}

                    {bookingData.dates?.from && bookingData.dates?.to && (
                      <div className="p-4 bg-primary/5 rounded-xl">
                        <div className="flex items-center space-x-2 text-primary">
                          <CalendarIcon className="w-5 h-5" />
                          <span className="font-medium">
                            {format(bookingData.dates.from, 'MMM dd')} - {format(bookingData.dates.to, 'MMM dd, yyyy')}
                          </span>
                          <span className="text-sm">({getDays()} {getDays() === 1 ? 'day' : 'days'})</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Pet Details / Booking Details */}
            {currentStep === 2 && (
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardContent className="p-6">
                  {type === 'pet-sitting' ? (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Tell us about your pets</h3>
                      
                      {bookingData.pets?.map((pet, index) => (
                        <Card key={index} className="p-4 border rounded-xl">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium flex items-center gap-2">
                              <PawPrint className="w-4 h-4 text-primary" />
                              Pet {index + 1}
                            </h4>
                            {bookingData.pets!.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removePet(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`pet-name-${index}`}>Pet name</Label>
                              <Input
                                id={`pet-name-${index}`}
                                value={pet.name}
                                onChange={(e) => updatePet(index, 'name', e.target.value)}
                                placeholder="e.g., Luna"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`pet-type-${index}`}>Type & breed</Label>
                              <Input
                                id={`pet-type-${index}`}
                                value={pet.type}
                                onChange={(e) => updatePet(index, 'type', e.target.value)}
                                placeholder="e.g., Golden Retriever"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`pet-age-${index}`}>Age</Label>
                              <Input
                                id={`pet-age-${index}`}
                                value={pet.age}
                                onChange={(e) => updatePet(index, 'age', e.target.value)}
                                placeholder="e.g., 3 years"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`pet-special-${index}`}>Special needs</Label>
                              <Input
                                id={`pet-special-${index}`}
                                value={pet.specialNeeds}
                                onChange={(e) => updatePet(index, 'specialNeeds', e.target.value)}
                                placeholder="Medications, allergies, etc."
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                      
                      <Button
                        variant="outline"
                        onClick={addPet}
                        className="w-full rounded-xl border-dashed"
                      >
                        <PawPrint className="w-4 h-4 mr-2" />
                        Add another pet
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Additional details</h3>
                      
                      <div>
                        <Label htmlFor="special-requests">Special requests or requirements</Label>
                        <Textarea
                          id="special-requests"
                          value={bookingData.specialRequests}
                          onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                          placeholder="Any specific needs, preferences, or questions for the host..."
                          className="mt-2"
                          rows={4}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Contact Information */}
            {currentStep === 3 && (
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Contact information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={bookingData.contactInfo.phone}
                          onChange={(e) => setBookingData({
                            ...bookingData,
                            contactInfo: { ...bookingData.contactInfo, phone: e.target.value }
                          })}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={bookingData.contactInfo.email}
                          onChange={(e) => setBookingData({
                            ...bookingData,
                            contactInfo: { ...bookingData.contactInfo, email: e.target.value }
                          })}
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="emergency">Emergency contact</Label>
                      <Input
                        id="emergency"
                        value={bookingData.contactInfo.emergencyContact}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          contactInfo: { ...bookingData.contactInfo, emergencyContact: e.target.value }
                        })}
                        placeholder="Name and phone number"
                      />
                    </div>

                    {type === 'pet-sitting' && (
                      <div>
                        <Label htmlFor="special-requests">Special requests or instructions</Label>
                        <Textarea
                          id="special-requests"
                          value={bookingData.specialRequests}
                          onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                          placeholder="Walking schedule, feeding instructions, emergency vet info, etc."
                          className="mt-2"
                          rows={4}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Payment & Confirmation */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <Card className="rounded-2xl border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Payment method</h3>
                      
                      <div className="space-y-3">
                        <div 
                          className={cn(
                            "p-4 border rounded-xl cursor-pointer transition-all",
                            bookingData.paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                          )}
                          onClick={() => setBookingData({ ...bookingData, paymentMethod: 'card' })}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              "w-4 h-4 rounded-full border-2",
                              bookingData.paymentMethod === 'card' ? 'border-primary bg-primary' : 'border-border'
                            )}>
                              {bookingData.paymentMethod === 'card' && (
                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                              )}
                            </div>
                            <CreditCard className="w-5 h-5 text-primary" />
                            <span className="font-medium">Credit or debit card</span>
                          </div>
                        </div>
                        
                        <div 
                          className={cn(
                            "p-4 border rounded-xl cursor-pointer transition-all",
                            bookingData.paymentMethod === 'paypal' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                          )}
                          onClick={() => setBookingData({ ...bookingData, paymentMethod: 'paypal' })}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              "w-4 h-4 rounded-full border-2",
                              bookingData.paymentMethod === 'paypal' ? 'border-primary bg-primary' : 'border-border'
                            )}>
                              {bookingData.paymentMethod === 'paypal' && (
                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                              )}
                            </div>
                            <span className="font-medium">PayPal</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Terms and conditions</h3>
                      
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="terms"
                          checked={bookingData.agreedToTerms}
                          onCheckedChange={(checked) => 
                            setBookingData({ ...bookingData, agreedToTerms: !!checked })
                          }
                        />
                        <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                          I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>. I understand that this is a booking request and the {type === 'house-sitting' ? 'host' : 'sitter'} will confirm availability.
                        </label>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                          Your payment will be processed after the {type === 'house-sitting' ? 'host' : 'sitter'} confirms your booking. You can cancel for free up to 24 hours before the start date.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProviderCard />
            
            {bookingData.dates?.from && bookingData.dates?.to && (
              <PricingBreakdown />
            )}

            {/* Summary */}
            {currentStep > 1 && (
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Booking summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {bookingData.dates?.from && bookingData.dates?.to && (
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <span>{format(bookingData.dates.from, 'MMM dd')} - {format(bookingData.dates.to, 'MMM dd')}</span>
                    </div>
                  )}
                  
                  {type === 'house-sitting' && bookingData.guests && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{bookingData.guests} guests</span>
                    </div>
                  )}
                  
                  {type === 'pet-sitting' && bookingData.pets && (
                    <div className="flex items-center space-x-2">
                      <PawPrint className="w-4 h-4 text-muted-foreground" />
                      <span>{bookingData.pets.length} pet{bookingData.pets.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="rounded-xl px-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {currentStep < totalSteps ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceedToNext()}
              className="rounded-xl px-6 bg-primary hover:bg-primary/90"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceedToNext()}
              className="rounded-xl px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Submit booking request
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;