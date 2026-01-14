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
import SitterProfileSettings from '@/components/SitterProfileSettings';
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
  Loader2,
  Pencil,
  Check,
  X
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
  const [userType, setUserType] = useState<'owner' | 'sitter'>('owner');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'find');
  const [loading, setLoading] = useState(false);
  
  // Find Sitters state
  const [sitters, setSitters] = useState<SitterData[]>([]);
  const [filteredSitters, setFilteredSitters] = useState<SitterData[]>([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  
  // My Bookings state
  const [bookings, setBookings] = useState<BookingData[]>([]);
  
  // Become Sitter state
  const [userIsSitter, setUserIsSitter] = useState(false);
  
  // Sitter Availability state
  const [sitterProfile, setSitterProfile] = useState<any>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // Inline editing state
  const [editingRate, setEditingRate] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [tempRate, setTempRate] = useState('');
  const [tempLocation, setTempLocation] = useState('');
  const [savingRate, setSavingRate] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);

  // Check sitter status on mount
  useEffect(() => {
    checkSitterStatus();
  }, [user]);

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
    console.log('[PetSitters] fetchSitters called');
    try {
      // Get current user to exclude them from results
      const { data: { user } } = await supabase.auth.getUser();
      console.log('[PetSitters] Current user:', user?.id);
      
      let query = supabase
        .from('sitter_profiles')
        .select(`
          *,
          sitter_services (service_type),
          sitter_photos (photo_url, is_primary)
        `);

      // Only show active sitters
      query = query.eq('is_active', true);
      
      // Exclude current user if they are logged in
      if (user?.id) {
        query = query.neq('user_id', user.id);
      }

      const { data, error } = await query;

      console.log('[PetSitters] Fetched sitters:', data?.length, data?.map(s => ({ id: s.id, user_id: s.user_id, location: s.location })));
      
      if (error) {
        console.error('[PetSitters] Fetch error:', error);
        throw error;
      }
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

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$', 
      JPY: '¥', CHF: 'Fr', SEK: 'kr', NOK: 'kr', DKK: 'kr'
    };
    return symbols[currency] || '$';
  };

  const handleSaveRate = async () => {
    if (!sitterProfile) return;
    setSavingRate(true);
    try {
      const rate = parseFloat(tempRate);
      if (isNaN(rate) || rate < 0) {
        toast({ 
          title: "Invalid Rate", 
          description: "Please enter a valid positive number", 
          variant: "destructive" 
        });
        setSavingRate(false);
        return;
      }
      const { error } = await supabase
        .from('sitter_profiles')
        .update({ rate_per_day: rate, updated_at: new Date().toISOString() })
        .eq('id', sitterProfile.id);
      if (error) throw error;
      toast({ title: "Rate Updated" });
      setEditingRate(false);
      checkSitterProfile();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to update rate", 
        variant: "destructive" 
      });
    } finally {
      setSavingRate(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!sitterProfile) return;
    setSavingLocation(true);
    try {
      const { error } = await supabase
        .from('sitter_profiles')
        .update({ location: tempLocation.trim() || null, updated_at: new Date().toISOString() })
        .eq('id', sitterProfile.id);
      if (error) throw error;
      toast({ title: "Location Updated" });
      setEditingLocation(false);
      checkSitterProfile();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to update location", 
        variant: "destructive" 
      });
    } finally {
      setSavingLocation(false);
    }
  };

  const filterSitters = () => {
    console.log('[PetSitters] filterSitters called - sitters:', sitters.length, 'searchLocation:', searchLocation, 'selectedService:', selectedService);
    let filtered = sitters;

    if (searchLocation) {
      const searchLower = searchLocation.toLowerCase().trim();
      filtered = filtered.filter(sitter => {
        const sitterLower = sitter.location.toLowerCase();
        // Match if either contains the other, or if they share common terms
        return sitterLower.includes(searchLower) || 
               searchLower.includes(sitterLower) ||
               // Also check individual words for partial matches (min 3 chars)
               searchLower.split(/[\s,]+/).some(term => 
                 term.length > 2 && sitterLower.includes(term)
               );
      });
    }

    if (selectedService && selectedService !== 'all') {
      filtered = filtered.filter(sitter =>
        sitter.sitter_services.some(service => service.service_type === selectedService)
      );
    }

    console.log('[PetSitters] filterSitters result:', filtered.length);
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

  return (
    <Layout>
      <div className="min-h-screen bg-background px-4 pb-24 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-7xl mx-auto">
          {/* Compact Role Selector (Segmented Control) */}
          <div className="sticky top-16 z-20 bg-background/95 backdrop-blur-sm py-3 -mx-4 px-4 border-b border-gray-100 flex justify-center">
            <div 
              className="inline-flex items-center h-10 rounded-full bg-gray-100 p-1 max-w-md"
              role="tablist"
              aria-label="User role selection"
            >
              <button
                role="tab"
                aria-selected={userType === 'owner'}
                onClick={() => {
                  setUserType('owner');
                  setActiveTab('find');
                }}
                className={`h-8 px-4 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all ${
                  userType === 'owner'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <Heart className="w-4 h-4" />
                Find a sitter
              </button>
              <button
                role="tab"
                aria-selected={userType === 'sitter'}
                onClick={() => {
                  setUserType('sitter');
                  // Default to availability for sitters
                  setActiveTab('availability');
                }}
                className={`h-8 px-4 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all ${
                  userType === 'sitter'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <PawPrint className="w-4 h-4" />
                Offer services
              </button>
            </div>
          </div>



          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 space-y-4">
            {/* Owner Sub-Navigation */}
            {userType === 'owner' && (
              <div className="flex flex-wrap items-center justify-center gap-2 px-4 mt-2 mb-2">
                <button
                  role="tab"
                  aria-selected={activeTab === 'find'}
                  onClick={() => setActiveTab('find')}
                  className={`h-9 px-3 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all ${
                    activeTab === 'find'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Find Sitters
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === 'bookings'}
                  onClick={() => setActiveTab('bookings')}
                  className={`h-9 px-3 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all ${
                    activeTab === 'bookings'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  My Bookings
                </button>
              </div>
            )}

            {/* Sitter Sub-Navigation */}
            {userType === 'sitter' && (
              <div className="flex flex-wrap items-center justify-center gap-2 px-4 mt-2 mb-2">
                {!userIsSitter && (
                  <button
                    role="tab"
                    aria-selected={activeTab === 'become'}
                    onClick={() => setActiveTab('become')}
                    className={`h-9 px-3 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all ${
                      activeTab === 'become'
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    Become a Sitter
                  </button>
                )}
                {userIsSitter && (
                  <>
                    <button
                      role="tab"
                      aria-selected={activeTab === 'availability'}
                      onClick={() => setActiveTab('availability')}
                      className={`h-9 px-3 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all ${
                        activeTab === 'availability'
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <CalendarCheck className="w-4 h-4" />
                      Availability
                    </button>
                    <button
                      role="tab"
                      aria-selected={activeTab === 'sitter-bookings'}
                      onClick={() => setActiveTab('sitter-bookings')}
                      className={`h-9 px-3 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all ${
                        activeTab === 'sitter-bookings'
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      My Clients
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Find Sitters Tab (Pet Owners) */}
            {userType === 'owner' && (
              <TabsContent value="find" className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold mb-2 px-4">
                    Find the perfect sitter
                  </h2>
                  
                  {/* Compact Search Form */}
                  <Card className="rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1">
                          <LocationAutocomplete
                            value={searchLocation}
                            onChange={setSearchLocation}
                            placeholder="Location..."
                            className="h-10 rounded-xl text-sm"
                            onLocationSelect={(location) => {
                              console.log('Selected location:', location);
                            }}
                          />
                        </div>
                        <div className="w-full sm:w-48">
                          <Select value={selectedService} onValueChange={setSelectedService}>
                            <SelectTrigger className="h-10 rounded-xl text-sm">
                              <SelectValue placeholder="Service type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white z-50">
                              <SelectItem value="all">All Services</SelectItem>
                              <SelectItem value="House Sitting">House Sitting</SelectItem>
                              <SelectItem value="Dog Walking">Dog Walking</SelectItem>
                              <SelectItem value="Overnight Boarding">Pet Boarding</SelectItem>
                              <SelectItem value="Day Care">Day Care</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          onClick={() => fetchSitters()}
                          disabled={loading}
                          className="h-10 px-4 rounded-full text-sm font-medium bg-primary text-white shadow-sm hover:bg-primary/90 self-end"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Results */}
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-12">
                      <PawPrint className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                      <p className="text-sm text-muted-foreground">Finding sitters...</p>
                    </div>
                  ) : filteredSitters.length === 0 ? (
                    <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm max-w-md mx-auto my-4">
                      <CardContent className="p-4 text-center space-y-3">
                        <Search className="w-8 h-8 mx-auto text-muted-foreground" />
                        <h3 className="text-base font-semibold text-foreground">
                          {sitters.length === 0 ? 'No active sitters available' : 'No sitters match your filters'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {sitters.length === 0 ? 'Check back later or become a sitter yourself!' : 'Try adjusting your search criteria'}
                        </p>
                        {sitters.length > 0 && (
                          <Button 
                            variant="outline"
                            onClick={() => { setSearchLocation(''); setSelectedService('all'); }}
                            className="h-9 px-4 rounded-full text-sm"
                          >
                            Clear Filters
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    filteredSitters.map((sitter) => {
                      const primaryPhoto = sitter.sitter_photos.find(p => p.is_primary)?.photo_url;
                      const services = sitter.sitter_services.map(s => s.service_type);
                      
                      return (
                        <Card 
                          key={sitter.id}
                          className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => navigate(`/sitter/${sitter.id}`)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3 min-w-0">
                              <div className="flex items-start gap-3 min-w-0 flex-1">
                                <Avatar className="h-12 w-12 border border-gray-100 shrink-0">
                                  <AvatarImage src={primaryPhoto} alt="Pet Sitter" />
                                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                    <PawPrint className="w-5 h-5" />
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-semibold text-foreground truncate">
                                    Pet Sitter
                                  </h3>
                                  <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                    {sitter.bio || 'Professional pet sitter'}
                                  </p>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3.5 w-3.5" />
                                      <span className="truncate">{sitter.location}</span>
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="h-3.5 w-3.5" />
                                      ${sitter.rate_per_day}/day
                                    </span>
                                  </div>
                                  {services.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {services.slice(0, 2).map((service) => (
                                        <Badge key={service} variant="secondary" className="text-xs px-2 py-0.5">
                                          {service}
                                        </Badge>
                                      ))}
                                      {services.length > 2 && (
                                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                                          +{services.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-9 rounded-full px-3 text-sm shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/sitter/${sitter.id}`);
                                }}
                              >
                                View
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </TabsContent>
            )}


            {/* My Bookings Tab (Pet Owners) */}
            {userType === 'owner' && (
              <TabsContent value="bookings" className="space-y-4">
                <h2 className="text-base font-semibold mb-2 px-4">
                  Your booking history
                </h2>
                
                {loading ? (
                  <div className="text-center py-12">
                    <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Loading bookings...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm max-w-md mx-auto my-4">
                    <CardContent className="p-4 text-center space-y-3">
                      <Calendar className="w-8 h-8 mx-auto text-muted-foreground" />
                      <h3 className="text-base font-semibold text-foreground">
                        No bookings yet
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Book your first pet sitter to get started
                      </p>
                      <Button 
                        onClick={() => setActiveTab('find')}
                        className="h-10 px-4 rounded-full text-sm font-medium bg-primary text-white shadow-sm hover:bg-primary/90"
                      >
                        Find Sitters
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <Card 
                        key={booking.id}
                        className="rounded-2xl bg-white border border-gray-100 shadow-sm"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-foreground">
                                  {booking.pet_profiles.name}
                                </h4>
                                <Badge className={getStatusColor(booking.status)}>
                                  {booking.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {booking.sitter_profiles?.user_profiles?.display_name || 'Unknown Sitter'}
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
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            )}


            {/* Sitter Availability Tab */}
            {userType === 'sitter' && (
              <TabsContent value="availability" className="space-y-4">
                {availabilityLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Loading your sitter profile...</p>
                  </div>
                ) : !sitterProfile ? (
                  <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm max-w-md mx-auto my-4">
                    <CardContent className="p-4 text-center space-y-3">
                      <CalendarCheck className="w-8 h-8 mx-auto text-primary" />
                      <h3 className="text-base font-semibold text-foreground">
                        Create your sitter profile
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Set up your profile to manage availability and accept bookings
                      </p>
                      <Button
                        onClick={() => setActiveTab('become')}
                        className="h-10 px-4 rounded-full text-sm font-medium bg-primary text-white shadow-sm hover:bg-primary/90"
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {/* Status Banner */}
                    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${sitterProfile.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-sm font-medium text-foreground">
                            Sitter profile: {sitterProfile.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <SitterProfileSettings 
                          sitterProfile={sitterProfile} 
                          onUpdate={checkSitterProfile}
                        />
                      </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div>
                      <h3 className="text-base font-semibold mb-2 px-4">Quick actions</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Card className="rounded-2xl bg-white border border-gray-100 shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <DollarSign className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-foreground text-sm">Rate per Day</h4>
                                  {!editingRate && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={() => {
                                        setTempRate(sitterProfile?.rate_per_day?.toString() || '');
                                        setEditingRate(true);
                                      }}
                                    >
                                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Button>
                                  )}
                                </div>
                                {editingRate ? (
                                  <div className="flex items-center gap-2 mt-1">
                                    <Input
                                      type="number"
                                      value={tempRate}
                                      onChange={(e) => setTempRate(e.target.value)}
                                      className="h-8 text-sm"
                                      placeholder="0.00"
                                      min="0"
                                      step="0.01"
                                    />
                                    <Button size="sm" className="h-8 px-2" onClick={handleSaveRate} disabled={savingRate}>
                                      {savingRate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setEditingRate(false)}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {sitterProfile?.rate_per_day 
                                      ? `${getCurrencySymbol(sitterProfile.currency)}${sitterProfile.rate_per_day}` 
                                      : 'Not set - tap to add'}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="rounded-2xl bg-white border border-gray-100 shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-foreground text-sm">Location</h4>
                                  {!editingLocation && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={() => {
                                        setTempLocation(sitterProfile?.location || '');
                                        setEditingLocation(true);
                                      }}
                                    >
                                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Button>
                                  )}
                                </div>
                                {editingLocation ? (
                                  <div className="mt-1 space-y-2">
                                    <LocationAutocomplete
                                      value={tempLocation}
                                      onChange={setTempLocation}
                                      placeholder="Search for your location..."
                                      className="h-9 text-sm"
                                      onLocationSelect={(loc) => setTempLocation(loc.display_name)}
                                    />
                                    <div className="flex items-center gap-2">
                                      <Button size="sm" className="h-8" onClick={handleSaveLocation} disabled={savingLocation}>
                                        {savingLocation ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                                        Save
                                      </Button>
                                      <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditingLocation(false)}>
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                    {sitterProfile?.location || 'Not set - tap to add'}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="rounded-2xl bg-white border border-gray-100 shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <CalendarCheck className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground text-sm">Availability</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">Manage calendar</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Calendar */}
                    <Card className="rounded-2xl bg-white border border-gray-100 shadow-sm">
                      <CardContent className="p-4">
                        <SitterAvailabilityCalendar sitterId={sitterProfile.id} />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            )}


            {/* Become a Sitter Tab */}
            {userType === 'sitter' && !userIsSitter && (
              <TabsContent value="become" className="space-y-4">
                {/* Compact Join Card */}
                <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm max-w-2xl mx-auto">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Join our sitter community
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Turn your love for pets into income. Provide loving care while earning extra money in your spare time.
                      </p>
                    </div>

                    {/* Benefits Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                      <div className="text-center">
                        <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <h4 className="text-sm font-semibold text-foreground">Trusted</h4>
                        <p className="text-xs text-muted-foreground">Verified profiles</p>
                      </div>
                      <div className="text-center">
                        <DollarSign className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <h4 className="text-sm font-semibold text-foreground">Flexible</h4>
                        <p className="text-xs text-muted-foreground">Set your rates</p>
                      </div>
                      <div className="text-center">
                        <Heart className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <h4 className="text-sm font-semibold text-foreground">Community</h4>
                        <p className="text-xs text-muted-foreground">Connect with pets</p>
                      </div>
                    </div>

                    <Button 
                      onClick={() => navigate('/become-sitter')}
                      className="h-10 px-6 rounded-full text-sm font-medium bg-primary text-white shadow-sm hover:bg-primary/90"
                    >
                      Become a sitter
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            )}


             {/* Sitter Bookings Tab (New) */}
             {userType === 'sitter' && userIsSitter && (
               <TabsContent value="sitter-bookings" className="space-y-4">
                 <h2 className="text-base font-semibold mb-2 px-4">
                   Client bookings
                 </h2>
                 
                 <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm max-w-md mx-auto my-4">
                   <CardContent className="p-4 text-center space-y-3">
                     <Calendar className="w-8 h-8 mx-auto text-muted-foreground" />
                     <h3 className="text-base font-semibold text-foreground">
                       No client bookings yet
                     </h3>
                     <p className="text-sm text-muted-foreground">
                       When clients book your services, they'll appear here
                     </p>
                   </CardContent>
                 </Card>
               </TabsContent>
             )}
           </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default PetSitters;