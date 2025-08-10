import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Plus, Users, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Pack {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  created_at: string;
  pack_members: Array<{
    id: string;
    user_id: string;
    role: string;
  }>;
}

const PackDiscovery = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: publicPacks, isLoading } = useQuery({
    queryKey: ['public-packs', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('packs')
        .select(`
          *,
          pack_members (
            id,
            user_id,
            role
          )
        `)
        .eq('privacy', 'public')
        .order('created_at', { ascending: false });

      if (searchQuery.trim()) {
        query = query.ilike('name', `%${searchQuery.trim()}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching packs:', error);
        throw error;
      }
      
      return data as Pack[];
    },
  });

  // Simulate nearby packs for demo - in real app this would use geolocation
  const nearbyPacks = publicPacks?.slice(0, 3) || [];
  const suggestedPacks = publicPacks?.slice(3) || [];

  const PackCard = ({ pack, showDistance = false }: { pack: Pack; showDistance?: boolean }) => {
    const memberCount = pack.pack_members.length;
    const isUserMember = pack.pack_members.some(member => member.user_id === user?.id);

    return (
      <Card 
        className="hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl border-0 shadow-lg hover:scale-[1.02] overflow-hidden"
        onClick={() => navigate(`/packs/${pack.id}`)}
      >
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20">
          {pack.cover_image_url ? (
            <img 
              src={pack.cover_image_url} 
              alt={pack.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {pack.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          {showDistance && (
            <Badge className="absolute top-3 right-3 bg-white/90 text-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              0.8 km
            </Badge>
          )}
          {isUserMember && (
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
              Member
            </Badge>
          )}
        </div>
        
        <CardContent className="p-6">
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-foreground tracking-tight line-clamp-1">
              {pack.name}
            </h3>
            
            <p className="text-muted-foreground line-clamp-2 leading-relaxed">
              {pack.description || 'A community for pet lovers to connect and share adventures.'}
            </p>
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="font-medium">{memberCount}</span>
                <span>{memberCount === 1 ? 'member' : 'members'}</span>
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-current" />
                <span>4.8</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary-light to-background p-4">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-12 bg-muted rounded-xl w-1/3"></div>
              <div className="h-12 bg-muted rounded-xl"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 bg-muted rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="page-title flex items-center justify-center gap-2">
              <Users className="w-7 h-7 text-primary" aria-hidden="true" />
              Discover Packs
            </h1>
            <p className="page-subtitle leading-relaxed max-w-2xl mx-auto">
              Find the perfect community for you and your pet
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search packs by name or interest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg rounded-2xl border-2 border-border focus:border-primary shadow-lg"
              />
            </div>
          </div>

          {/* Create Pack CTA */}
          <div className="text-center">
            <Button
              onClick={() => navigate('/packs/create')}
              size="lg"
              className="h-12 px-8 text-lg font-semibold rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your Own Pack
            </Button>
          </div>

          {/* Packs Near You */}
          {nearbyPacks.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center space-x-3">
                <MapPin className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold text-foreground tracking-tight">
                  Packs Near You
                </h2>
              </div>
              
              <div className="overflow-x-auto pb-4">
                <div className="flex space-x-6 min-w-max">
                  {nearbyPacks.map((pack) => (
                    <div key={pack.id} className="w-80 flex-shrink-0">
                      <PackCard pack={pack} showDistance />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Suggested Packs */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Suggested for You
            </h2>
            
            {suggestedPacks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestedPacks.map((pack) => (
                  <PackCard key={pack.id} pack={pack} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">
                    No packs found
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {searchQuery ? 
                      'Try adjusting your search terms or create the first pack with that name!' :
                      'Be the first to create a pack in your area!'
                    }
                  </p>
                  <Button
                    onClick={() => navigate('/packs/create')}
                    className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Pack
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default PackDiscovery;