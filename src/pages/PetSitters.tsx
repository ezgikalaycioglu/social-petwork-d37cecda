import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import SitterAvailabilityCalendar from '@/components/SitterAvailabilityCalendar';
import { 
  Search, 
  UserCheck, 
  Calendar, 
  MapPin, 
  Star, 
  Heart,
  Shield,
  PawPrint,
  DollarSign,
  Clock,
  CheckCircle,
  CalendarCheck,
  AlertCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface SitterData {
  id: string;
  user_id: string;
  bio: string;
  location: string;
  rate_per_day: number;
  is_active: boolean;
  sitter_services: { service_type: string }[];
  sitter_photos: { photo_url: string; is_primary: boolean }[];
  user_profiles: { display_name: string } | null;
}

interface BookingData {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_price: number;
  pet_profiles: { name: string };
  sitter_profiles: { 
    user_profiles: { display_name: string } | null; 
    location: string;
  } | null;
}

const PetSitters = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'find');
  const [loading, setLoading] = useState(false);
  
  // Find Sitters state
  const [sitters, setSitters] = useState<SitterData[]>([]);
  const [filteredSitters, setFilteredSitters] = useState<SitterData[]>([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedService, setSelectedService] = useState('');
  
  // My Bookings state
  const [bookings, setBookings] = useState<BookingData[]>([]);
  
  // Become Sitter state
  const [userIsSitter, setUserIsSitter] = useState(false);
  
  // Sitter Availability state
  const [sitterProfile, setSitterProfile] = useState<any>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'find') {
      fetchSitters();
    } else if (activeTab === 'bookings') {
      fetchMyBookings();
    } else if (activeTab === 'become') {
      checkSitterStatus();
    } else if (activeTab === 'availability') {
      checkSitterProfile();
    }
  }, [activeTab, user]);

  useEffect(() => {
    filterSitters();
  }, [sitters, searchLocation, selectedService]);

  const fetchSitters = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sitter_profiles')
        .select(`
          *,
          sitter_services (service_type),
          sitter_photos (photo_url, is_primary),
          user_profiles!inner (display_name)
        `)
        .eq('is_active', true)
        .neq('user_id', user?.id || '');

      if (error) throw error;
      setSitters((data || []) as unknown as SitterData[]);
    } catch (error) {
      console.error('Error fetching sitters:', error);
      toast({
        title: "Error",
        description: "Failed to load sitters.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sitter_bookings')
        .select(`
          *,
          pet_profiles!fk_sitter_bookings_pet_profiles (name),
          sitter_profiles (
            user_profiles!fk_sitter_profiles_user_profiles (display_name),
            location
          )
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings((data || []) as unknown as BookingData[]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSitterStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('sitter_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      setUserIsSitter(!!data);
    } catch (error) {
      setUserIsSitter(false);
    }
  };

  const checkSitterProfile = async () => {
    if (!user) return;
    
    setAvailabilityLoading(true);
    try {
      const { data, error } = await supabase
        .from('sitter_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSitterProfile(data);
    } catch (error) {
      console.error('Error checking sitter profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your sitter profile.',
        variant: 'destructive',
      });
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const filterSitters = () => {
    let filtered = sitters;

    if (searchLocation) {
      filtered = filtered.filter(sitter =>
        sitter.location.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }

    if (selectedService && selectedService !== 'all') {
      filtered = filtered.filter(sitter =>
        sitter.sitter_services.some(service => service.service_type === selectedService)
      );
    }

    setFilteredSitters(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const SitterCard = ({ sitter }: { sitter: SitterData }) => {
    const primaryPhoto = sitter.sitter_photos.find(p => p.is_primary)?.photo_url;
    const services = sitter.sitter_services.map(s => s.service_type);

    return (
      <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-white">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="w-16 h-16 border-2 border-primary/20">
              <AvatarImage src={primaryPhoto} alt={sitter.user_profiles?.display_name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {sitter.user_profiles?.display_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  {sitter.user_profiles?.display_name || 'Unknown Sitter'}
                </h3>
                <div className="flex items-center text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {sitter.location}
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {sitter.bio}
              </p>

              <div className="flex flex-wrap gap-2">
                {services.slice(0, 3).map((service) => (
                  <Badge key={service} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
                {services.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{services.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="flex flex-col space-y-3 sm:space-y-0">
                {/* Price and Rating Row */}
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="w-4 h-4 mr-1" />
                    ${sitter.rate_per_day}/day
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                    5.0
                  </div>
                </div>
                
                {/* View Profile Button Row - separate on mobile, inline on desktop */}
                <div className="flex sm:hidden">
                  <Button 
                    size="sm"
                    onClick={() => navigate(`/sitter/${sitter.id}`)}
                    className="bg-primary hover:bg-primary/90 w-full"
                  >
                    View Profile
                  </Button>
                </div>
              </div>
              
              {/* View Profile Button - hidden on mobile, shown on desktop */}
              <div className="hidden sm:block">
                <Button 
                  size="sm"
                  onClick={() => navigate(`/sitter/${sitter.id}`)}
                  className="bg-primary hover:bg-primary/90"
                >
                  View Profile
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                🐾 Pet Sitters
              </h1>
              <p className="text-xl text-muted-foreground">
                Trusted care for your furry family members
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="-mx-4 w-[calc(100%+2rem)] min-h-[96px] grid grid-cols-2 grid-rows-2 gap-x-4 gap-y-6 bg-white rounded-2xl p-4 shadow-sm md:mx-0 md:w-full md:grid-cols-4 md:grid-rows-1 md:gap-x-2 md:gap-y-0">
              <TabsTrigger
                value="find"
                className="h-full flex items-center justify-center rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Search className="w-4 h-4 mr-2" />
                Find Sitters
              </TabsTrigger>
              <TabsTrigger 
                value="bookings"
                className="h-full flex items-center justify-center rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Calendar className="w-4 h-4 mr-2" />
                My Bookings
              </TabsTrigger>
              <TabsTrigger 
                value="availability"
                className="h-full flex items-center justify-center rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <CalendarCheck className="w-4 h-4 mr-2" />
                Sitter Availability
              </TabsTrigger>
              <TabsTrigger 
                value="become"
                className="h-full flex items-center justify-center rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Become a Sitter
              </TabsTrigger>
            </TabsList>

            {/* Find Sitters Tab */}
            <TabsContent value="find" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" />
                    Find the Perfect Sitter
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <LocationAutocomplete
                        value={searchLocation}
                        onChange={setSearchLocation}
                        placeholder="Enter city, area, or address"
                        className="bg-white"
                        onLocationSelect={(location) => {
                          // Optionally store coordinates for future use
                          console.log('Selected location:', location);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="service">Service Type</Label>
                      <Select value={selectedService} onValueChange={setSelectedService}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Services</SelectItem>
                          <SelectItem value="House Sitting">House Sitting</SelectItem>
                          <SelectItem value="Dog Walking">Dog Walking</SelectItem>
                          <SelectItem value="Pet Boarding">Pet Boarding</SelectItem>
                          <SelectItem value="Day Care">Day Care</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <PawPrint className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Finding amazing sitters...</p>
                  </div>
                ) : filteredSitters.length === 0 ? (
                  <Card className="bg-white/80 backdrop-blur-sm border-0">
                    <CardContent className="text-center py-12">
                      <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        No sitters found
                      </h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search criteria
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredSitters.map((sitter) => (
                      <SitterCard key={sitter.id} sitter={sitter} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* My Bookings Tab */}
            <TabsContent value="bookings" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Your Booking History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                      <p className="text-muted-foreground">Loading bookings...</p>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        No bookings yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Book your first pet sitter to get started
                      </p>
                      <Button onClick={() => setActiveTab('find')}>
                        Find Sitters
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="p-4 border border-border rounded-lg bg-background">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-foreground">
                                  {booking.pet_profiles.name}
                                </h4>
                                <Badge className={getStatusColor(booking.status)}>
                                  {booking.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Sitter: {booking.sitter_profiles?.user_profiles?.display_name || 'Unknown Sitter'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {booking.sitter_profiles?.location || 'Unknown Location'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">
                                ${booking.total_price}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sitter Availability Tab */}
            <TabsContent value="availability" className="space-y-6">
              {availabilityLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading your sitter profile...</p>
                </div>
              ) : !sitterProfile ? (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader className="text-center pb-8">
                    <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <CalendarCheck className="w-8 h-8 text-purple-600" />
                    </div>
                    <CardTitle className="text-2xl font-medium text-gray-800">
                      Become a Pet Sitter
                    </CardTitle>
                    <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                      To manage your availability calendar, you'll need to create a pet sitter profile first.
                    </p>
                  </CardHeader>
                  <CardContent className="text-center pb-8">
                    <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
                      <AlertCircle className="w-6 h-6 text-blue-600 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-blue-800 mb-2">
                        Ready to Start Pet Sitting?
                      </h3>
                      <p className="text-blue-700 text-sm">
                        Create your sitter profile to access the availability calendar and start accepting bookings.
                      </p>
                    </div>
                    <Button
                      onClick={() => setActiveTab('become')}
                      className="h-12 px-8 rounded-xl text-white font-medium transition-all duration-200 hover:scale-105 bg-primary hover:bg-primary/90"
                    >
                      Create Sitter Profile
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Header Section */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CalendarCheck className="w-5 h-5 text-primary" />
                        Your Availability Calendar
                      </CardTitle>
                      <p className="text-muted-foreground">
                        Set your available dates for pet sitting services
                      </p>
                    </CardHeader>
                  </Card>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-white/80 backdrop-blur-sm border-0">
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <Clock className="w-8 h-8 text-green-500 mr-3" />
                          <div>
                            <p className="text-sm text-muted-foreground">Profile Status</p>
                            <p className="text-lg font-medium text-foreground">
                              {sitterProfile?.is_active ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-0">
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <DollarSign className="w-8 h-8 text-purple-500 mr-3" />
                          <div>
                            <p className="text-sm text-muted-foreground">Rate per Day</p>
                            <p className="text-lg font-medium text-foreground">
                              ${sitterProfile?.rate_per_day || 'Not set'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-0">
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <MapPin className="w-8 h-8 text-blue-500 mr-3" />
                          <div>
                            <p className="text-sm text-muted-foreground">Location</p>
                            <p className="text-lg font-medium text-foreground">
                              {sitterProfile?.location || 'Not set'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Calendar Component */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0">
                    <CardContent className="p-6">
                      <SitterAvailabilityCalendar sitterId={sitterProfile.id} />
                    </CardContent>
                  </Card>

                  {/* Tips Section */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium text-foreground mb-4">
                        💡 Tips for Managing Your Availability
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">
                            Keep it updated
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Regularly update your calendar to ensure pet owners see accurate availability
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">
                            Plan ahead
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Set your availability for several weeks in advance to get more booking requests
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Become a Sitter Tab */}
            <TabsContent value="become" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-primary" />
                    Join Our Sitter Community
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userIsSitter ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        You're already a sitter!
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Thank you for being part of our trusted sitter community
                      </p>
                      <Button onClick={() => navigate('/dashboard')}>
                        Go to Dashboard
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="text-center">
                        <Heart className="w-16 h-16 mx-auto mb-4 text-primary" />
                        <h3 className="text-2xl font-semibold text-foreground mb-4">
                          Turn Your Love for Pets into Income
                        </h3>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                          Join thousands of trusted pet sitters who provide loving care 
                          while earning extra income in their spare time.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-background rounded-xl">
                          <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
                          <h4 className="font-semibold text-foreground mb-2">Trusted Platform</h4>
                          <p className="text-sm text-muted-foreground">
                            Background checks and verified profiles for peace of mind
                          </p>
                        </div>
                        <div className="text-center p-6 bg-background rounded-xl">
                          <DollarSign className="w-12 h-12 mx-auto mb-4 text-primary" />
                          <h4 className="font-semibold text-foreground mb-2">Flexible Earnings</h4>
                          <p className="text-sm text-muted-foreground">
                            Set your own rates and work when it suits your schedule
                          </p>
                        </div>
                        <div className="text-center p-6 bg-background rounded-xl">
                          <Heart className="w-12 h-12 mx-auto mb-4 text-primary" />
                          <h4 className="font-semibold text-foreground mb-2">Pet Community</h4>
                          <p className="text-sm text-muted-foreground">
                            Connect with fellow pet lovers and make new furry friends
                          </p>
                        </div>
                      </div>

                      <div className="text-center">
                        <Button 
                          size="lg"
                          onClick={() => navigate('/become-sitter')}
                          className="bg-primary hover:bg-primary/90 text-lg px-8 py-3"
                        >
                          Start Your Sitter Journey
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default PetSitters;