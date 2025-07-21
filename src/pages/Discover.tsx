import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PawPrint } from 'lucide-react';
import Layout from '@/components/Layout';
import PetMap from './PetMap';
import Deals from './Deals';

const Discover = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (!currentUser) {
        navigate('/auth');
        return;
      }

      setUser(currentUser);
    } catch (error) {
      console.error('Error checking auth:', error);
      toast({
        title: "Authentication Error",
        description: "Please log in to access the discover features.",
        variant: "destructive",
      });
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <PawPrint className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading discover features...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              🔍 Discover
            </h1>
            <p className="text-muted-foreground mt-1">
              Find pets near you and discover great deals!
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="pet-map" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pet-map">Pet Map</TabsTrigger>
              <TabsTrigger value="business-deals">Business Deals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pet-map" className="mt-6">
              <PetMap />
            </TabsContent>
            
            <TabsContent value="business-deals" className="mt-6">
              <Deals />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Discover;