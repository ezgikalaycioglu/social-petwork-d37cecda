import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PrivacyBadge } from '@/components/ui/privacy-badge';
import { Building2, Globe, Star, Phone, Mail, MapPin } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

interface SecureBusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_category: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  is_verified: boolean | null;
  created_at: string;
  updated_at: string;
}

interface SecureBusinessDirectoryProps {
  onBusinessSelect?: (business: SecureBusinessProfile) => void;
  category?: string;
}

const SecureBusinessDirectory: React.FC<SecureBusinessDirectoryProps> = ({ 
  onBusinessSelect, 
  category 
}) => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<SecureBusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinesses();
  }, [category]);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('business_profiles')
        .select(`
          id, user_id, business_name, business_category, 
          description, logo_url, website, is_verified, 
          created_at, updated_at
        `)
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('business_category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setBusinesses(data || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSensitiveBusinessData = async (businessId: string) => {
    // Only fetch sensitive data when user explicitly requests it
    const { data, error } = await supabase
      .from('business_profiles')
      .select('email, phone, address')
      .eq('id', businessId)
      .single();
    
    return { data, error };
  };

  const isBusinessOwner = (business: SecureBusinessProfile) => {
    return user?.id === business.user_id;
  };

  const handleContactRequest = async (business: SecureBusinessProfile) => {
    if (isBusinessOwner(business)) {
      // Owner can see their own contact info
      const { data } = await fetchSensitiveBusinessData(business.id);
      if (data) {
        alert(`Contact: ${data.email} | ${data.phone || 'No phone'} | ${data.address || 'No address'}`);
      }
    } else {
      // For non-owners, show a privacy-respecting contact form or request
      alert('Contact request feature coming soon! This protects business owner privacy.');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Privacy Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Privacy Protected Directory</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Business contact details are protected. Only verified requests show sensitive information.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businesses.map((business) => (
          <Card key={business.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                {business.logo_url ? (
                  <img
                    src={business.logo_url}
                    alt={business.business_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                )}
                {business.is_verified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Star className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              <h3 className="font-bold text-lg mb-2">{business.business_name}</h3>
              
              <Badge variant="outline" className="mb-3">
                {business.business_category}
              </Badge>

              {business.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {business.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                {business.website && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="w-4 h-4 mr-2" />
                    <a 
                      href={business.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                {/* Privacy badges */}
                <div className="flex gap-2 flex-wrap">
                  <PrivacyBadge 
                    type="contact" 
                    level={isBusinessOwner(business) ? "public" : "protected"} 
                  />
                  <PrivacyBadge 
                    type="location" 
                    level="protected" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleContactRequest(business)}
                >
                  {isBusinessOwner(business) ? (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      View My Contact Info
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4 mr-2" />
                      Request Contact
                    </>
                  )}
                </Button>
                
                {onBusinessSelect && (
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => onBusinessSelect(business)}
                  >
                    View Details
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {businesses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No businesses found
            </h3>
            <p className="text-gray-600">
              {category && category !== 'all' 
                ? `No businesses in the ${category} category yet.`
                : 'No businesses have joined yet.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SecureBusinessDirectory;