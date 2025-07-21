import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import PackFeed from '@/components/pack/PackFeed';
import PackChat from '@/components/PackChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Activity, Users } from 'lucide-react';

const PackDetails = () => {
  const { packId } = useParams<{ packId: string }>();
  const [packInfo, setPackInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load pack information
  useEffect(() => {
    if (packId) {
      loadPackInfo();
    }
  }, [packId]);

  const loadPackInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('packs')
        .select('*')
        .eq('id', packId)
        .single();

      if (error) throw error;
      setPackInfo(data);
    } catch (error) {
      console.error('Error loading pack:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!packId) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-destructive">Pack not found</h1>
              <p className="text-muted-foreground mt-2">The pack you're looking for doesn't exist.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading pack...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Pack Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground font-dm-sans">
                  {packInfo?.name || 'Pack'}
                </h1>
                <p className="text-muted-foreground font-dm-sans">
                  {packInfo?.description || 'Connect with your pack community'}
                </p>
              </div>
            </div>
          </div>

          {/* Pack Tabs */}
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger 
                value="chat" 
                className="flex items-center space-x-2 font-dm-sans"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat</span>
              </TabsTrigger>
              <TabsTrigger 
                value="feed" 
                className="flex items-center space-x-2 font-dm-sans"
              >
                <Activity className="w-4 h-4" />
                <span>Feed</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              <Card className="h-[700px] overflow-hidden">
                <PackChat 
                  packId={packId} 
                  packName={packInfo?.name || 'Pack'} 
                  packCoverUrl={packInfo?.cover_image_url}
                />
              </Card>
            </TabsContent>

            <TabsContent value="feed" className="space-y-4">
              <PackFeed packId={packId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default PackDetails;