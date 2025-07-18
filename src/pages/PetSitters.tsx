import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CheckCircle
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
  const [activeTab, setActiveTab] = useState('find');
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

  useEffect(() => {
    if (activeTab === 'find') {
      fetchSitters();
    } else if (activeTab === 'bookings') {
      fetchMyBookings();
    } else if (activeTab === 'become') {
      checkSitterStatus();
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
        .eq('is_active', true);

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
          pet_profiles (name),
          sitter_profiles (
            user_profiles!inner (display_name),
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

              <div className="flex items-center justify-between">
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
            <TabsList className="grid w-full grid-cols-3 bg-white rounded-2xl p-2 shadow-sm">
              <TabsTrigger 
                value="find" 
                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Search className="w-4 h-4 mr-2" />
                Find Sitters
              </TabsTrigger>
              <TabsTrigger 
                value="bookings"
                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Calendar className="w-4 h-4 mr-2" />
                My Bookings
              </TabsTrigger>
              <TabsTrigger 
                value="become"
                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
                      <Input
                        id="location"
                        placeholder="Enter city or area"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="bg-white"
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