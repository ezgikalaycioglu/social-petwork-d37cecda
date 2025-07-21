import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import SitterAvailabilityCalendar from '@/components/SitterAvailabilityCalendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const SitterAvailability = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sitterProfile, setSitterProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (user) {
      checkSitterProfile();
    }
  }, [user]);

  const checkSitterProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('sitter_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSitterProfile(data);
        setHasProfile(true);
      } else {
        setHasProfile(false);
      }
    } catch (error) {
      console.error('Error checking sitter profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your sitter profile.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
            <p className="text-gray-600" style={{ fontFamily: 'DM Sans' }}>
              Loading your sitter profile...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!hasProfile) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <Card className="shadow-lg rounded-xl border-0">
              <CardHeader className="text-center pb-8">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl font-medium text-gray-800" style={{ fontFamily: 'DM Sans', letterSpacing: '-1px', lineHeight: '1.4' }}>
                  Become a Pet Sitter
                </CardTitle>
                <p className="text-gray-600 mt-2 max-w-2xl mx-auto" style={{ fontFamily: 'DM Sans', lineHeight: '1.4' }}>
                  To manage your availability calendar, you'll need to create a pet sitter profile first. 
                  This helps pet owners learn about your services and experience.
                </p>
              </CardHeader>
              <CardContent className="text-center pb-8">
                <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
                  <AlertCircle className="w-6 h-6 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-blue-800 mb-2" style={{ fontFamily: 'DM Sans' }}>
                    Ready to Start Pet Sitting?
                  </h3>
                  <p className="text-blue-700 text-sm" style={{ fontFamily: 'DM Sans', lineHeight: '1.4' }}>
                    Create your sitter profile to access the availability calendar and start accepting bookings from pet owners in your area.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/become-sitter')}
                  className="h-12 px-8 rounded-xl text-white font-medium transition-all duration-200 hover:scale-105"
                  style={{ 
                    backgroundColor: '#7A5FFF',
                    fontFamily: 'DM Sans',
                    letterSpacing: '-1px'
                  }}
                >
                  Create Sitter Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-medium text-gray-800" style={{ fontFamily: 'DM Sans', letterSpacing: '-1px', lineHeight: '1.4' }}>
                  Availability Calendar
                </h1>
                <p className="text-gray-600 mt-1" style={{ fontFamily: 'DM Sans', lineHeight: '1.4' }}>
                  Set your available dates for pet sitting services
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="rounded-xl border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'DM Sans' }}>Profile Status</p>
                      <p className="text-lg font-medium text-gray-800" style={{ fontFamily: 'DM Sans' }}>
                        {sitterProfile?.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Calendar className="w-8 h-8 text-purple-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'DM Sans' }}>Rate per Day</p>
                      <p className="text-lg font-medium text-gray-800" style={{ fontFamily: 'DM Sans' }}>
                        ${sitterProfile?.rate_per_day || 'Not set'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-8 h-8 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'DM Sans' }}>Location</p>
                      <p className="text-lg font-medium text-gray-800" style={{ fontFamily: 'DM Sans' }}>
                        {sitterProfile?.location || 'Not set'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Calendar Component */}
          <SitterAvailabilityCalendar sitterId={sitterProfile.id} />

          {/* Tips Section */}
          <Card className="mt-8 rounded-xl border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4" style={{ fontFamily: 'DM Sans', letterSpacing: '-1px' }}>
                💡 Tips for Managing Your Availability
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700" style={{ fontFamily: 'DM Sans' }}>
                    Keep it updated
                  </p>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'DM Sans', lineHeight: '1.4' }}>
                    Regularly update your calendar to ensure pet owners see accurate availability
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700" style={{ fontFamily: 'DM Sans' }}>
                    Plan ahead
                  </p>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'DM Sans', lineHeight: '1.4' }}>
                    Set your availability for several weeks in advance to get more booking requests
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SitterAvailability;