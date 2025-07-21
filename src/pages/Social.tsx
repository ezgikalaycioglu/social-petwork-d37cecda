import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { 
  Users, 
  Calendar, 
  MapPin, 
  PawPrint,
  Heart,
  Search,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PetSocial from './PetSocial';
import Events from './Events';
import PetMap from './PetMap';

const Social = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'social');
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserPets();
    }
  }, [user]);

  const fetchUserPets = async () => {
    try {
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  // If a specific tab is selected, render that component directly
  if (activeTab === 'social') {
    return <PetSocial />;
  }
  
  if (activeTab === 'events') {
    return <Events />;
  }
  
  if (activeTab === 'map') {
    return <PetMap />;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                🐾 Pet Social Network
              </h1>
              <p className="text-xl text-muted-foreground">
                Connect your pets with new friends and adventures
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="-mx-4 w-[calc(100%+2rem)] min-h-[96px] grid grid-cols-1 grid-rows-3 gap-x-4 gap-y-6 bg-white rounded-2xl p-4 shadow-sm md:mx-0 md:w-full md:grid-cols-3 md:grid-rows-1 md:gap-x-2 md:gap-y-0">
              <TabsTrigger
                value="social"
                className="h-full flex items-center justify-center rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Users className="w-4 h-4 mr-2" />
                Pet Social
              </TabsTrigger>
              <TabsTrigger 
                value="events"
                className="h-full flex items-center justify-center rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger 
                value="map"
                className="h-full flex items-center justify-center rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Pet Map
              </TabsTrigger>
            </TabsList>

            {/* Pet Social Tab */}
            <TabsContent value="social" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Connect with Fellow Pet Parents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Discover new friends for your pets and build lasting connections in the pet community.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('social')} 
                    className="w-full"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Start Making Friends
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Plan Adventures & Playdates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Organize playdates, group walks, and exciting adventures for your pets.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('events')} 
                    className="w-full"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    View Events
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pet Map Tab */}
            <TabsContent value="map" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Find Pets Nearby
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Discover pets in your neighborhood and see who's ready to play!
                  </p>
                  <Button 
                    onClick={() => setActiveTab('map')} 
                    className="w-full"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Explore Map
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Social;