import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MapPin, Globe, Phone, Mail, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface BusinessProfile {
  id: string;
  business_name: string;
  description: string | null;
  business_category: string;
  logo_url: string | null;
  website: string | null;
  is_verified: boolean;
  user_id: string;
}

interface PrivateBusinessData {
  email: string;
  phone: string | null;
  address: string | null;
}

const BusinessProfile = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [privateData, setPrivateData] = useState<PrivateBusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingContact, setLoadingContact] = useState(false);
  const [hasContactAccess, setHasContactAccess] = useState(false);
  const [showPrivateView, setShowPrivateView] = useState(false);

  useEffect(() => {
    if (businessId) {
      fetchBusinessProfile();
    }
  }, [businessId]);

  const fetchBusinessProfile = async () => {
    try {
      // Fetch public business data
      const { data: publicData, error: publicError } = await supabase
        .from('business_profiles')
        .select('id, business_name, description, business_category, logo_url, website, is_verified, user_id')
        .eq('id', businessId)
        .single();

      if (publicError) throw publicError;
      
      setBusiness(publicData);

      // Check if user is the business owner
      if (user && publicData.user_id === user.id) {
        setHasContactAccess(true);
        await fetchPrivateData();
      }
    } catch (error) {
      console.error('Error fetching business profile:', error);
      toast.error('Failed to load business profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrivateData = async () => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('email, phone, address')
        .eq('id', businessId)
        .single();

      if (error) throw error;
      setPrivateData(data);
    } catch (error) {
      console.error('Error fetching private data:', error);
    }
  };

  const handleRequestContact = async () => {
    if (!user) {
      toast.error('Please log in to request contact information');
      return;
    }

    setLoadingContact(true);
    
    // TODO: Implement contact request logic
    // This could involve sending a notification to the business owner
    // For now, we'll just show a message
    
    setTimeout(() => {
      toast.success('Contact request sent! The business owner will be notified.');
      setLoadingContact(false);
    }, 1000);
  };

  const isOwner = user && business && business.user_id === user.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="w-full h-64 mb-6" />
            <Skeleton className="w-3/4 h-8 mb-4" />
            <Skeleton className="w-full h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
          <Button onClick={() => navigate('/business')}>
            Back to Business Directory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/business')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPrivateView(!showPrivateView)}
                className="flex items-center gap-2 ml-auto"
              >
                {showPrivateView ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPrivateView ? 'Public View' : 'Private View'}
              </Button>
            )}
          </div>

          {/* Business Profile Card */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start gap-6">
                {business.logo_url && (
                  <img
                    src={business.logo_url}
                    alt={business.business_name}
                    className="w-24 h-24 rounded-lg object-cover bg-muted"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-2xl">{business.business_name}</CardTitle>
                    {business.is_verified && (
                      <Badge variant="default" className="bg-primary/10 text-primary">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="mb-3">
                    {business.business_category}
                  </Badge>
                  {business.description && (
                    <p className="text-muted-foreground">{business.description}</p>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Website */}
                {business.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <a 
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {business.website}
                    </a>
                  </div>
                )}

                {/* Contact Information */}
                {(showPrivateView || hasContactAccess) && privateData ? (
                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="font-semibold text-lg">Contact Information</h3>
                    
                    {privateData.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <a 
                          href={`mailto:${privateData.email}`}
                          className="text-primary hover:underline"
                        >
                          {privateData.email}
                        </a>
                      </div>
                    )}
                    
                    {privateData.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <a 
                          href={`tel:${privateData.phone}`}
                          className="text-primary hover:underline"
                        >
                          {privateData.phone}
                        </a>
                      </div>
                    )}
                    
                    {privateData.address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <span className="text-foreground">{privateData.address}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Contact Information</h3>
                        <p className="text-muted-foreground text-sm">
                          Request contact information to get in touch with this business
                        </p>
                      </div>
                      <Button 
                        onClick={handleRequestContact}
                        disabled={!user || loadingContact}
                      >
                        {loadingContact ? 'Sending...' : 'Request Contact Info'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gallery Section - Placeholder for future implementation */}
          <Card>
            <CardHeader>
              <CardTitle>Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Placeholder images */}
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">No images</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;