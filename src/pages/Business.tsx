import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import CreateDealModal from '@/components/CreateDealModal';
import BusinessProfileForm from '@/components/BusinessProfileForm';
import ClaimDealModal from '@/components/ClaimDealModal';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users,
  Gift,
  MapPin,
  Clock,
  Percent,
  DollarSign,
  Loader2
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type BusinessProfile = Tables<'business_profiles'>;
type Deal = Tables<'deals'> & {
  business_profiles: {
    id: string;
    business_name: string;
    business_category: string;
    logo_url: string | null;
    website: string | null;
    is_verified: boolean;
    description: string | null;
  } | null;
};

const Business = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'deals');
  const [loading, setLoading] = useState(false);
  
  // Deals state
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Business Dashboard state
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [businessDeals, setBusinessDeals] = useState<Deal[]>([]);
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Groomer', label: 'Grooming' },
    { value: 'Pet Store', label: 'Pet Store' },
    { value: 'Trainer', label: 'Training' },
    { value: 'Veterinarian', label: 'Veterinary' },
    { value: 'Boarding', label: 'Boarding' },
    { value: 'Daycare', label: 'Daycare' }
  ];

  useEffect(() => {
    if (activeTab === 'deals') {
      fetchDeals();
    } else if (activeTab === 'dashboard') {
      checkAuthAndFetchBusinessData();
    }
  }, [activeTab, user]);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          business_profiles (
            id,
            business_name,
            business_category,
            logo_url,
            website,
            is_verified
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals((data || []) as Deal[]);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast({
        title: "Error",
        description: "Failed to load deals.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAuthAndFetchBusinessData = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      await Promise.all([
        fetchBusinessProfile(user.id),
        fetchBusinessDeals(user.id)
      ]);
    } catch (error) {
      console.error('Error checking auth:', error);
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

      setBusinessProfile(data);
    } catch (error) {
      console.error('Error fetching business profile:', error);
    }
  };

  const fetchBusinessDeals = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (profile) {
        const { data, error } = await supabase
          .from('deals')
          .select(`
            *,
            business_profiles (
              id,
              business_name,
              business_category,
              logo_url,
              website,
              is_verified,
              description
            )
          `)
          .eq('business_id', profile.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBusinessDeals((data || []) as Deal[]);
      }
    } catch (error) {
      console.error('Error fetching business deals:', error);
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId);

      if (error) throw error;

      setBusinessDeals(prev => prev.filter(deal => deal.id !== dealId));
      toast({
        title: "Success",
        description: "Deal deleted successfully!",
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
      fetchBusinessDeals(profile.user_id);
    }
  };

  const onDealCreated = (deal: Deal) => {
    setBusinessDeals(prev => [deal, ...prev]);
    setShowCreateDeal(false);
  };

  const handleClaimDeal = (deal: Deal) => {
    setSelectedDeal(deal);
  };

  const onDealClaimed = () => {
    setSelectedDeal(null);
    fetchDeals();
  };

  const filteredDeals = deals.filter(deal => 
    filterCategory === 'all' || deal.business_profiles?.business_category === filterCategory
  );

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="page-title mb-2">
                🏢 Business Portal
              </h1>
              <p className="page-subtitle">
                Connect with pet owners and grow your business
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="-mx-4 w-[calc(100%+2rem)] min-h-[120px] grid grid-cols-1 grid-rows-2 gap-x-4 gap-y-8 bg-white rounded-2xl p-6 shadow-sm md:mx-0 md:w-full md:grid-cols-2 md:grid-rows-1 md:gap-x-2 md:gap-y-0 md:min-h-[96px] md:p-4">
              <TabsTrigger
                value="deals"
                className="h-12 flex items-center justify-center rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-base"
              >
                <Gift className="w-5 h-5 mr-2" />
                Exclusive Deals
              </TabsTrigger>
              <TabsTrigger 
                value="dashboard"
                className="h-12 flex items-center justify-center rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-base"
              >
                <Building2 className="w-5 h-5 mr-2" />
                Business Dashboard
              </TabsTrigger>
            </TabsList>

            {/* Deals Tab */}
            <TabsContent value="deals" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    Exclusive Pet Deals
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Special offers from trusted pet businesses in your area!
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map((category) => (
                      <Button
                        key={category.value}
                        variant={filterCategory === category.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterCategory(category.value)}
                        className="text-xs"
                      >
                        {category.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <Gift className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading amazing deals...</p>
                  </div>
                ) : filteredDeals.length === 0 ? (
                  <Card className="bg-white/80 backdrop-blur-sm border-0">
                    <CardContent className="text-center py-12">
                      <Gift className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        No deals available
                      </h3>
                      <p className="text-muted-foreground">
                        Check back later for new offers!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDeals.map((deal) => (
                      <Card key={deal.id} className="hover:shadow-lg transition-all duration-300 border-0 bg-white">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              {deal.business_profiles?.logo_url ? (
                                <img
                                  src={deal.business_profiles.logo_url}
                                  alt={deal.business_profiles?.business_name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Building2 className="w-6 h-6 text-primary" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm text-gray-600">{deal.business_profiles?.business_name}</p>
                                <Badge variant="secondary" className="text-xs">
                                  {deal.business_profiles?.business_category}
                                </Badge>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Percent className="w-3 h-3 mr-1" />
                              {deal.discount_percentage}% OFF
                            </Badge>
                          </div>

                          <h3 className="font-bold text-lg mb-2">{deal.title}</h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{deal.description}</p>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <DollarSign className="w-4 h-4 mr-2" />
                              <span className="font-bold text-green-600">
                                {deal.discount_percentage}% OFF {deal.discount_amount ? `($${deal.discount_amount} off)` : ''}
                              </span>
                            </div>
                            {/* Remove address display for security - only show to business owners */}
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-2" />
                              Valid until {deal.valid_until ? new Date(deal.valid_until).toLocaleDateString() : 'No expiry'}
                            </div>
                          </div>

                          <Button 
                            onClick={() => handleClaimDeal(deal)}
                            className="w-full bg-primary hover:bg-primary/90"
                          >
                            Claim Deal
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Business Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <Building2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading business dashboard...</p>
                </div>
              ) : !businessProfile ? (
                <Card className="bg-white/80 backdrop-blur-sm border-0">
                  <CardContent className="text-center py-12">
                    <Building2 className="w-16 h-16 mx-auto mb-4 text-primary" />
                    <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Business Portal</h1>
                    <p className="text-muted-foreground mb-8">Create your business profile to start offering exclusive deals to pet owners in your area!</p>
                    <Button 
                      onClick={() => setShowProfileForm(true)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Create Business Profile
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <Building2 className="w-8 h-8 text-primary" />
                        {businessProfile.business_name}
                      </h1>
                      <p className="text-muted-foreground mt-1">Manage your business profile and deals</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowProfileForm(true)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button onClick={() => setShowCreateDeal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Deal
                      </Button>
                    </div>
                  </div>

                  {/* Business Profile Card */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0">
                    <CardHeader>
                      <CardTitle>Business Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Business Name</p>
                        <p className="font-medium">{businessProfile.business_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <Badge variant="secondary">{businessProfile.business_category}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{businessProfile.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{businessProfile.address || 'Not provided'}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Deals Management */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Your Deals</span>
                        <Badge variant="outline">
                          {businessDeals.length} Active
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {businessDeals.length === 0 ? (
                        <div className="text-center py-8">
                          <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                          <p className="text-muted-foreground mb-4">No deals created yet</p>
                          <Button onClick={() => setShowCreateDeal(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Deal
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {businessDeals.map((deal) => (
                            <div key={deal.id} className="p-4 border border-border rounded-lg bg-background">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold mb-1">{deal.title}</h3>
                                  <p className="text-sm text-muted-foreground mb-2">{deal.description}</p>
                                  <div className="flex items-center gap-4 text-sm">
                                    <span className="text-green-600 font-medium">
                                      {deal.discount_percentage}% OFF
                                    </span>
                                    <span>
                                      {deal.discount_amount ? `$${deal.discount_amount} discount` : 'Percentage discount'}
                                    </span>
                                    <span className="text-muted-foreground">
                                      Expires: {deal.valid_until ? new Date(deal.valid_until).toLocaleDateString() : 'No expiry'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`/deals/${deal.id}`, '_blank')}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteDeal(deal.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Modals */}
        {selectedDeal && (
          <ClaimDealModal
            deal={selectedDeal}
            onClose={() => setSelectedDeal(null)}
            onClaimed={onDealClaimed}
          />
        )}

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
      </div>
    </Layout>
  );
};

export default Business;