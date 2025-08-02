
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Users } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import PackCard from '@/components/PackCard';
import CreatePackModal from '@/components/CreatePackModal';
import { useToast } from '@/hooks/use-toast';

const Packs = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();

  const { data: packs, isLoading, refetch } = useQuery({
    queryKey: ['packs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packs')
        .select(`
          *,
          pack_members (
            id,
            user_id,
            role,
            joined_at
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching packs:', error);
        throw error;
      }
      
      return data;
    },
  });

  const handlePackCreated = () => {
    refetch();
    setShowCreateModal(false);
    toast({
      title: "Pack Created",
      description: "Your pack has been created successfully!",
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Users className="w-8 h-8 text-green-600" />
                Pet Packs
              </h1>
              <p className="text-gray-600">
                Join or create packs with other pet owners in your area
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Pack
            </Button>
          </div>

          {packs && packs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packs.map((pack) => (
                <PackCard key={pack.id} pack={pack} onUpdate={refetch} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Packs Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Be the first to create a pack in your area and connect with other pet owners!
                </p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Pack
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreatePackModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onPackCreated={handlePackCreated}
      />
    </Layout>
  );
};

export default Packs;
