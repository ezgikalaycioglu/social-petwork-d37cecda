
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Building2, Plus, Edit, Trash2, Eye, Users } from 'lucide-react';
import Layout from '@/components/Layout';
import CreateDealModal from '@/components/CreateDealModal';
import BusinessProfileForm from '@/components/BusinessProfileForm';
import type { Tables } from '@/integrations/supabase/types';

type BusinessProfile = Tables<'business_profiles'>;
type Deal = Tables<'deals'>;

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      await Promise.all([
        fetchBusinessProfile(user.id),
        fetchBusinessDeals(user.id)
      ]);
    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setBusinessProfile(data);
    } catch (error) {
      console.error('Error fetching business profile:', error);
    }
  };

  const fetchBusinessDeals = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('business_id', businessProfile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId);

      if (error) throw error;

      setDeals(deals.filter(deal => deal.id !== dealId));
      toast({
        title: "Deal Deleted",
        description: "The deal has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting deal:', error);
      toast({
        title: "Error",
        description: "Failed to delete deal.",
        variant: "destructive",
      });
    }
  };

  const onProfileSaved = (profile: BusinessProfile) => {
    setBusinessProfile(profile);
    setShowProfileForm(false);
    if (!businessProfile) {
      // First time setup
      fetchBusinessDeals(profile.user_id);
    }
  };

  const onDealCreated = (deal: Deal) => {
    setDeals([deal, ...deals]);
    setShowCreateDeal(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Building2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-gray-600">Loading business dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!businessProfile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Business Portal</h1>
            <p className="text-gray-600 mb-8">Create your business profile to start offering exclusive deals to pet owners in your area!</p>
            <Button
              onClick={() => setShowProfileForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Business Profile
            </Button>
          </div>
        </div>

        {showProfileForm && (
          <BusinessProfileForm
            onClose={() => setShowProfileForm(false)}
            onSave={onProfileSaved}
          />
        )}
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                  <Building2 className="w-8 h-8 text-green-600" />
                  {businessProfile.business_name}
                </h1>
                <p className="text-gray-600 mt-1">Manage your business profile and deals</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowProfileForm(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  onClick={() => setShowCreateDeal(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Deal
                </Button>
              </div>
            </div>
          </div>

          {/* Business Profile Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>Your business information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Business Name</p>
                  <p className="font-medium">{businessProfile.business_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <Badge variant="secondary">{businessProfile.business_category}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{businessProfile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">{businessProfile.address || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deals Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Deals</h2>
              <Badge variant="outline" className="text-sm">
                {deals.length} Active Deals
              </Badge>
            </div>

            {deals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Eye className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No deals yet</h3>
                  <p className="text-gray-600 mb-6">Create your first deal to start attracting pet owners!</p>
                  <Button
                    onClick={() => setShowCreateDeal(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Deal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals.map((deal) => (
                  <Card key={deal.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{deal.title}</CardTitle>
                        <Badge variant={deal.is_active ? "default" : "secondary"}>
                          {deal.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">
                        {deal.description}
                      </CardDescription>

                      <div className="space-y-2 mb-4 text-sm">
                        {deal.discount_percentage && (
                          <p><strong>{deal.discount_percentage}%</strong> discount</p>
                        )}
                        {deal.discount_amount && (
                          <p><strong>${deal.discount_amount}</strong> off</p>
                        )}
                        {deal.valid_until && (
                          <p>Valid until: {new Date(deal.valid_until).toLocaleDateString()}</p>
                        )}
                        {deal.max_redemptions && (
                          <div className="flex items-center text-gray-600">
                            <Users className="w-4 h-4 mr-1" />
                            {deal.current_redemptions || 0} / {deal.max_redemptions} claimed
                          </div>
                        )}
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDeal(deal.id)}
                        className="w-full"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Deal
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateDeal && businessProfile && (
        <CreateDealModal
          businessProfile={businessProfile}
          onClose={() => setShowCreateDeal(false)}
          onCreated={onDealCreated}
        />
      )}

      {showProfileForm && (
        <BusinessProfileForm
          profile={businessProfile}
          onClose={() => setShowProfileForm(false)}
          onSave={onProfileSaved}
        />
      )}
    </Layout>
  );
};

export default BusinessDashboard;
