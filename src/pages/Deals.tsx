
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthAndFetch } from '@/hooks/useAuthAndFetch';
import { Gift, MapPin, Clock, Percent, DollarSign } from 'lucide-react';
import Layout from '@/components/Layout';
import ClaimDealModal from '@/components/ClaimDealModal';
import type { Tables } from '@/integrations/supabase/types';

type Deal = Tables<'deals'> & {
  business_profiles: Tables<'business_profiles'>;
};

const Deals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [user, setUser] = useState<any>(null);

  const { checkAuthAndFetchData, loading } = useAuthAndFetch({
    onSuccess: async (userId: string) => {
      setUser({ id: userId });
      await fetchDeals();
    }
  });

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
    checkAuthAndFetchData();
  }, [checkAuthAndFetchData]);

  async function fetchDeals() {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          business_profiles (*)
        `)
        .eq('is_active', true)
        .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString().split('T')[0]}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast({
        title: "Error",
        description: "Failed to load deals.",
        variant: "destructive",
      });
    }
  }

  const filteredDeals = deals.filter(deal => 
    filterCategory === 'all' || deal.business_profiles?.business_category === filterCategory
  );

  const handleClaimDeal = (deal: Deal) => {
    setSelectedDeal(deal);
  };

  const onDealClaimed = () => {
    setSelectedDeal(null);
    fetchDeals(); // Refresh deals to update redemption count
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Gift className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-gray-600">Loading exclusive deals...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Gift className="w-8 h-8 text-green-600" />
              Exclusive Pet Deals
            </h1>
            <p className="text-gray-600 mt-1">Special offers from trusted pet businesses in your area!</p>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={filterCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterCategory(category.value)}
                  className={filterCategory === category.value ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Deals Grid */}
          {filteredDeals.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">No deals available</h2>
              <p className="text-gray-600">Check back soon for new exclusive offers!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDeals.map((deal) => (
                <Card key={deal.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {deal.business_profiles?.logo_url ? (
                          <img
                            src={deal.business_profiles.logo_url}
                            alt={deal.business_profiles?.business_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <Gift className="w-6 h-6 text-green-600" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-600">{deal.business_profiles?.business_name}</p>
                          <Badge variant="secondary" className="text-xs">
                            {deal.business_profiles?.business_category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-3">{deal.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <CardDescription className="mb-4">
                      {deal.description}
                    </CardDescription>

                    {/* Deal Value */}
                    <div className="flex items-center gap-4 mb-4">
                      {deal.discount_percentage && (
                        <div className="flex items-center text-green-600 font-semibold">
                          <Percent className="w-4 h-4 mr-1" />
                          {deal.discount_percentage}% OFF
                        </div>
                      )}
                      {deal.discount_amount && (
                        <div className="flex items-center text-green-600 font-semibold">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ${deal.discount_amount} OFF
                        </div>
                      )}
                    </div>

                    {/* Deal Info */}
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      {deal.business_profiles?.address && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {deal.business_profiles.address}
                        </div>
                      )}
                      {deal.valid_until && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Valid until {new Date(deal.valid_until).toLocaleDateString()}
                        </div>
                      )}
                      {deal.max_redemptions && (
                        <div className="text-xs text-gray-500">
                          {deal.current_redemptions || 0} / {deal.max_redemptions} claimed
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => handleClaimDeal(deal)}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={deal.max_redemptions ? (deal.current_redemptions || 0) >= deal.max_redemptions : false}
                    >
                      {deal.max_redemptions && (deal.current_redemptions || 0) >= deal.max_redemptions 
                        ? 'Deal Fully Claimed' 
                        : 'Claim Deal'
                      }
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedDeal && (
        <ClaimDealModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onClaimed={onDealClaimed}
        />
      )}
    </Layout>
  );
};

export default Deals;
