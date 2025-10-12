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

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background px-4">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-4">
              {/* Top row skeleton */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-2 mb-2">
                <div className="h-10 bg-muted rounded-xl w-full sm:flex-1"></div>
                <div className="h-10 w-32 bg-muted rounded-full self-end sm:self-auto"></div>
              </div>
              
              {/* Section skeleton */}
              <div className="h-6 bg-muted rounded w-32 px-4"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted rounded-2xl"></div>
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
      <div className="min-h-screen bg-background px-4">
        <div className="max-w-6xl mx-auto">
          {/* Top Row: Search + Create Pack */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-2 mb-2">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search packs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-xl text-sm w-full"
              />
            </div>
            <Button
              onClick={() => navigate('/packs/create')}
              className="h-10 px-4 rounded-full inline-flex items-center gap-2 text-sm font-medium bg-primary text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 self-end sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              Create Pack
            </Button>
          </div>

          {/* Packs Near You */}
          {nearbyPacks.length > 0 && (
            <section className="mt-4">
              <h2 className="text-base font-semibold mb-2 px-4">
                Packs Near You
              </h2>
              
              <div className="space-y-3">
                {nearbyPacks.map((pack) => (
                  <Card 
                    key={pack.id}
                    className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/packs/${pack.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 min-w-0">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <Avatar className="h-12 w-12 border border-gray-100 shrink-0">
                            {pack.cover_image_url ? (
                              <AvatarImage src={pack.cover_image_url} alt={pack.name} />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                              {pack.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-foreground truncate">
                              {pack.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {pack.pack_members.length}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                4.8
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full border-0">
                            <MapPin className="h-3 w-3 mr-0.5" />
                            0.8 km
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 rounded-full px-3 text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/packs/${pack.id}`);
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Suggested Packs */}
          <section className="mt-4">
            <h2 className="text-base font-semibold mb-2 px-4">
              Suggested for You
            </h2>
            
            {suggestedPacks.length > 0 ? (
              <div className="space-y-3">
                {suggestedPacks.map((pack) => (
                  <Card 
                    key={pack.id}
                    className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/packs/${pack.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 min-w-0">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <Avatar className="h-12 w-12 border border-gray-100 shrink-0">
                            {pack.cover_image_url ? (
                              <AvatarImage src={pack.cover_image_url} alt={pack.name} />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                              {pack.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-foreground truncate">
                              {pack.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                              {pack.description || 'A community for pet lovers'}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {pack.pack_members.length}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                4.8
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 rounded-full px-3 text-sm shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/packs/${pack.id}`);
                          }}
                        >
                          Join
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm max-w-md mx-auto my-4">
                <CardContent className="p-4 text-center space-y-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    No packs found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 
                      'Try different search terms or create a new pack' :
                      'Be the first to create a pack in your area'
                    }
                  </p>
                  <Button
                    onClick={() => navigate('/packs/create')}
                    className="h-10 px-4 rounded-full inline-flex items-center gap-2 text-sm font-medium bg-primary text-white shadow-sm hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                    Create Pack
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default PackDiscovery;