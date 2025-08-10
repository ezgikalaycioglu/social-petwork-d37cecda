import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, MapPin, Star, Search } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface SitterData {
  id: string;
  user_id: string;
  bio: string;
  location: string;
  rate_per_day: number;
  is_active: boolean;
  display_name?: string;
  sitter_services: {
    service_type: string;
  }[];
  sitter_photos: {
    photo_url: string;
    is_primary: boolean;
  }[];
  average_rating?: number;
}

interface SitterCardProps {
  sitter: SitterData;
  onViewProfile: (sitterId: string) => void;
}

function SitterCard({ sitter, onViewProfile }: SitterCardProps) {
  const primaryPhoto = sitter.sitter_photos.find(p => p.is_primary)?.photo_url || 
                       sitter.sitter_photos[0]?.photo_url;
  
  const displayName = sitter.display_name || 'Sitter';
  const firstName = displayName.split(' ')[0];

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 rounded-2xl"
      onClick={() => onViewProfile(sitter.id)}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={primaryPhoto} alt={firstName} />
            <AvatarFallback className="text-lg">
              {firstName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div>
            <h3 className="font-semibold text-lg">{firstName}</h3>
            <div className="flex items-center text-muted-foreground text-sm mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              {sitter.location}
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{sitter.average_rating?.toFixed(1) || '5.0'}</span>
          </div>

          <div className="text-lg font-bold text-primary">
            ${sitter.rate_per_day}/day
          </div>

          <div className="flex flex-wrap gap-1 justify-center">
            {sitter.sitter_services.slice(0, 3).map((service, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {service.service_type}
              </Badge>
            ))}
            {sitter.sitter_services.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{sitter.sitter_services.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FindSitter() {
  const navigate = useNavigate();
  const [sitters, setSitters] = useState<SitterData[]>([]);
  const [filteredSitters, setFilteredSitters] = useState<SitterData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search filters
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const services = [
    "Dog Walking",
    "House Sitting", 
    "Drop-In Visits",
    "Pet Grooming",
    "Overnight Care",
    "Pet Training"
  ];

  useEffect(() => {
    fetchSitters();
  }, []);

  useEffect(() => {
    filterSitters();
  }, [sitters, location, service]);

  const fetchSitters = async () => {
    try {
      const { data: sittersData, error } = await supabase
        .from('sitter_profiles')
        .select(`
          *,
          sitter_services(service_type),
          sitter_photos(photo_url, is_primary)
        `)
        .eq('is_active', true);

      if (error) throw error;

      // Fetch user profiles separately
      if (sittersData && sittersData.length > 0) {
        const userIds = sittersData.map(sitter => sitter.user_id);
        const { data: profilesData } = await supabase
          .from('user_profiles')
          .select('id, display_name')
          .in('id', userIds);

        // Combine the data
        const enrichedSitters = sittersData.map(sitter => ({
          ...sitter,
          display_name: profilesData?.find(p => p.id === sitter.user_id)?.display_name || 'Sitter'
        }));

        setSitters(enrichedSitters);
        setFilteredSitters(enrichedSitters);
      } else {
        setSitters([]);
        setFilteredSitters([]);
      }
    } catch (error) {
      console.error('Error fetching sitters:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSitters = () => {
    let filtered = [...sitters];

    if (location) {
      filtered = filtered.filter(sitter => 
        sitter.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (service && service !== "all") {
      filtered = filtered.filter(sitter =>
        sitter.sitter_services.some(s => s.service_type === service)
      );
    }

    setFilteredSitters(filtered);
  };

  const handleViewProfile = (sitterId: string) => {
    navigate(`/sitter/${sitterId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="page-title text-center mb-2">
            Find the perfect sitter for your best friend
          </h1>
          <p className="page-subtitle text-center">
            Trusted, loving care when you can't be there
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <Card className="mb-8 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="City or Zip Code"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Dates</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange?.to ? (
                          <>
                            {format(dateRange.from, "LLL dd")} -{" "}
                            {format(dateRange.to, "LLL dd")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick dates</span>
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
                <label className="text-sm font-medium">Service</label>
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any service</SelectItem>
                    {services.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button className="bg-primary hover:bg-primary/90">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Finding amazing sitters...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                {filteredSitters.length} sitter{filteredSitters.length !== 1 ? 's' : ''} found
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSitters.map((sitter) => (
                <SitterCard 
                  key={sitter.id} 
                  sitter={sitter} 
                  onViewProfile={handleViewProfile}
                />
              ))}
            </div>

            {filteredSitters.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  No sitters found matching your criteria.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters or search area.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}