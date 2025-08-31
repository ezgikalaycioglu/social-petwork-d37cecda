import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { 
  Search, 
  Home,
  Calendar as CalendarIcon,
  MapPin, 
  Star, 
  Heart,
  Shield,
  PawPrint,
  DollarSign,
  Users,
  CheckCircle,
  Camera,
  MessageCircle,
  TrendingUp,
  Award,
  Clock,
  ArrowRight,
  Filter,
  Grid3x3,
  List
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

interface SitterProfile {
  id: string;
  user_id: string;
  bio: string;
  location: string;
  rate_per_day: number;
  is_active: boolean;
  sitter_services: { service_type: string }[];
  sitter_photos: { photo_url: string; is_primary: boolean }[];
  user_profiles: { display_name: string } | null;
  average_rating?: number;
  total_reviews?: number;
  response_rate?: number;
  verified?: boolean;
}

interface HomeStay {
  id: string;
  title: string;
  location: string;
  description: string;
  photos: string[];
  price_per_night: number;
  max_guests: number;
  pet_friendly: boolean;
  house_rules: string[];
  amenities: string[];
  host_name: string;
  host_photo: string;
  rating: number;
  review_count: number;
  instant_book: boolean;
  verified_host: boolean;
}

const PetSittersUpgraded = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'pet-sitting');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);
  
  // Search state
  const [searchLocation, setSearchLocation] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedService, setSelectedService] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Data state
  const [sitters, setSitters] = useState<SitterProfile[]>([]);
  const [homeStays, setHomeStays] = useState<HomeStay[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    // Mock sitter data with enhanced profiles
    const mockSitters: SitterProfile[] = [
      {
        id: '1',
        user_id: '1',
        bio: 'Experienced pet sitter with 5+ years caring for dogs and cats. Your pets will be treated like family!',
        location: 'Manhattan, NY',
        rate_per_day: 75,
        is_active: true,
        sitter_services: [
          { service_type: 'Pet Sitting' },
          { service_type: 'Dog Walking' },
          { service_type: 'Overnight Care' }
        ],
        sitter_photos: [
          { photo_url: '/placeholder.svg', is_primary: true }
        ],
        user_profiles: { display_name: 'Sarah Johnson' },
        average_rating: 4.9,
        total_reviews: 127,
        response_rate: 98,
        verified: true
      },
      {
        id: '2',
        user_id: '2',
        bio: 'Professional dog trainer and pet care specialist. Available for extended stays and emergency care.',
        location: 'Brooklyn, NY',
        rate_per_day: 65,
        is_active: true,
        sitter_services: [
          { service_type: 'Pet Training' },
          { service_type: 'House Sitting' },
          { service_type: 'Pet Grooming' }
        ],
        sitter_photos: [
          { photo_url: '/placeholder.svg', is_primary: true }
        ],
        user_profiles: { display_name: 'Mike Chen' },
        average_rating: 4.8,
        total_reviews: 89,
        response_rate: 95,
        verified: true
      }
    ];

    const mockHomeStays: HomeStay[] = [
      {
        id: '1',
        title: 'Cozy Downtown Loft with Garden',
        location: 'SoHo, NYC',
        description: 'Beautiful pet-friendly loft with private garden. Perfect for dogs who love outdoor space.',
        photos: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
        price_per_night: 120,
        max_guests: 4,
        pet_friendly: true,
        house_rules: ['No smoking', 'Pet waste must be cleaned', 'Quiet hours 10PM-8AM'],
        amenities: ['WiFi', 'Kitchen', 'Pet bed', 'Fenced yard', 'Pet toys'],
        host_name: 'Emma Rodriguez',
        host_photo: '/placeholder.svg',
        rating: 4.9,
        review_count: 67,
        instant_book: true,
        verified_host: true
      },
      {
        id: '2',
        title: 'Modern Family Home with Pool',
        location: 'Park Slope, Brooklyn',
        description: 'Spacious family home with pool and large backyard. Great for multiple pets and families.',
        photos: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
        price_per_night: 200,
        max_guests: 6,
        pet_friendly: true,
        house_rules: ['No parties', 'Pets must be supervised near pool', 'Check-in after 3PM'],
        amenities: ['Pool', 'BBQ', 'Pet door', 'Large yard', 'Pet washing station'],
        host_name: 'David Kim',
        host_photo: '/placeholder.svg',
        rating: 4.8,
        review_count: 43,
        instant_book: false,
        verified_host: true
      }
    ];

    setSitters(mockSitters);
    setHomeStays(mockHomeStays);
  }, []);

  const SitterCard = ({ sitter }: { sitter: SitterProfile }) => {
    const primaryPhoto = sitter.sitter_photos.find(p => p.is_primary)?.photo_url;
    const services = sitter.sitter_services.map(s => s.service_type);

    return (
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="relative">
            <div className="aspect-square relative overflow-hidden">
              <img 
                src={primaryPhoto || '/placeholder.svg'} 
                alt={sitter.user_profiles?.display_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3">
                {sitter.verified && (
                  <Badge className="bg-white/90 text-primary border-0 font-medium">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="absolute top-3 right-3">
                <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full bg-white/90 hover:bg-white">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-lg text-foreground">
                    {sitter.user_profiles?.display_name || 'Sitter'}
                  </h3>
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium">{sitter.average_rating}</span>
                    <span className="text-muted-foreground ml-1">({sitter.total_reviews})</span>
                  </div>
                </div>
                <div className="flex items-center text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {sitter.location}
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {sitter.bio}
              </p>

              <div className="flex flex-wrap gap-1">
                {services.slice(0, 2).map((service) => (
                  <Badge key={service} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
                {services.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{services.length - 2}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    {sitter.response_rate}% response rate
                  </div>
                  <div className="font-semibold text-lg">
                    ${sitter.rate_per_day}
                    <span className="text-sm font-normal text-muted-foreground">/day</span>
                  </div>
                </div>
                <Button 
                  size="sm"
                  onClick={() => navigate(`/sitter/${sitter.id}`)}
                  className="bg-primary hover:bg-primary/90 px-6"
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

  const HomeStayCard = ({ homeStay }: { homeStay: HomeStay }) => {
    return (
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="relative">
            <div className="aspect-[4/3] relative overflow-hidden">
              <img 
                src={homeStay.photos[0]} 
                alt={homeStay.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3">
                {homeStay.instant_book && (
                  <Badge className="bg-primary text-primary-foreground border-0 font-medium">
                    Instant Book
                  </Badge>
                )}
              </div>
              <div className="absolute top-3 right-3">
                <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full bg-white/90 hover:bg-white">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
              <div className="absolute bottom-3 left-3">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8 border-2 border-white">
                    <AvatarImage src={homeStay.host_photo} alt={homeStay.host_name} />
                    <AvatarFallback className="text-xs">{homeStay.host_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {homeStay.verified_host && (
                    <Badge className="bg-white/90 text-primary border-0 text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <div>
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                    {homeStay.title}
                  </h3>
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium">{homeStay.rating}</span>
                  </div>
                </div>
                <div className="flex items-center text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {homeStay.location}
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {homeStay.description}
              </p>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {homeStay.max_guests} guests
                </div>
                <div className="flex items-center">
                  <PawPrint className="w-4 h-4 mr-1" />
                  Pet friendly
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    {homeStay.review_count} reviews
                  </div>
                  <div className="font-semibold text-lg">
                    ${homeStay.price_per_night}
                    <span className="text-sm font-normal text-muted-foreground">/night</span>
                  </div>
                </div>
                <Button 
                  size="sm"
                  onClick={() => navigate(`/homestay/${homeStay.id}`)}
                  className="bg-primary hover:bg-primary/90 px-6"
                >
                  View Home
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
      <div className="min-h-screen bg-background">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-primary/5 via-background to-primary/5">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                Premium Pet Care & Home Stays
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect with trusted sitters and explore beautiful, pet-friendly homes around the world
              </p>
              
              {/* Search Bar */}
              <Card className="max-w-4xl mx-auto mt-8 shadow-lg border-0 rounded-2xl">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Where</label>
                      <Input
                        placeholder="Search destinations"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="border-0 bg-muted/50 h-12 text-base"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Dates</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-12 w-full justify-start text-left font-normal border-0 bg-muted/50",
                              !dateRange?.from && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                              dateRange?.to ? (
                                <>
                                  {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                                </>
                              ) : (
                                format(dateRange.from, "MMM dd, yyyy")
                              )
                            ) : (
                              <span>Select dates</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Service</label>
                      <Select value={selectedService} onValueChange={setSelectedService}>
                        <SelectTrigger className="h-12 border-0 bg-muted/50">
                          <SelectValue placeholder="Any service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pet-sitting">Pet Sitting</SelectItem>
                          <SelectItem value="house-sitting">House Sitting</SelectItem>
                          <SelectItem value="dog-walking">Dog Walking</SelectItem>
                          <SelectItem value="overnight-care">Overnight Care</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button size="lg" className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl">
                        <Search className="w-5 h-5 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="flex items-center justify-between">
              <TabsList className="grid grid-cols-2 w-auto bg-muted/50 rounded-xl p-1">
                <TabsTrigger
                  value="pet-sitting"
                  className="rounded-lg px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <PawPrint className="w-4 h-4 mr-2" />
                  Pet Sitting
                </TabsTrigger>
                <TabsTrigger 
                  value="house-sitting"
                  className="rounded-lg px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Home className="w-4 h-4 mr-2" />
                  House Sitting
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-10 px-4"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-10 w-10 p-0 rounded-none"
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-10 w-10 p-0 rounded-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Pet Sitting Tab */}
            <TabsContent value="pet-sitting" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">
                  {sitters.length} professional sitters available
                </h2>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>Highly rated professionals</span>
                </div>
              </div>

              <div className={cn(
                "grid gap-6",
                viewMode === 'grid' 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              )}>
                {sitters.map((sitter) => (
                  <SitterCard key={sitter.id} sitter={sitter} />
                ))}
              </div>
            </TabsContent>

            {/* House Sitting Tab */}
            <TabsContent value="house-sitting" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">
                  {homeStays.length} beautiful homes for your stay
                </h2>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Award className="w-4 h-4" />
                  <span>Verified pet-friendly homes</span>
                </div>
              </div>

              <div className={cn(
                "grid gap-6",
                viewMode === 'grid' 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              )}>
                {homeStays.map((homeStay) => (
                  <HomeStayCard key={homeStay.id} homeStay={homeStay} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default PetSittersUpgraded;