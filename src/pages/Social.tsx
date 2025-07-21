import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { Heart, Calendar, MapPin, Users, MessageCircle, Camera, ArrowRight } from 'lucide-react';

const Social = () => {
  const navigate = useNavigate();

  const socialOptions = [
    {
      id: 'pet-social',
      title: 'Pet Social',
      description: 'Connect with other pet parents and share your pet\'s adventures',
      icon: Heart,
      path: '/pet-social',
      gradient: 'from-pink-500/10 to-rose-500/10',
      iconColor: 'text-pink-500'
    },
    {
      id: 'events',
      title: 'Events',
      description: 'Discover and join local pet events, meetups, and activities',
      icon: Calendar,
      path: '/events',
      gradient: 'from-blue-500/10 to-indigo-500/10',
      iconColor: 'text-blue-500'
    },
    {
      id: 'pet-map',
      title: 'Pet Map',
      description: 'Explore nearby parks, pet-friendly places, and discover new spots',
      icon: MapPin,
      path: '/pet-map',
      gradient: 'from-green-500/10 to-emerald-500/10',
      iconColor: 'text-green-500'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                🐾 Social
              </h1>
              <p className="text-xl text-muted-foreground">
                Connect, discover, and share with the pet community
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {socialOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Card 
                  key={option.id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 bg-white cursor-pointer overflow-hidden"
                  onClick={() => navigate(option.path)}
                >
                  <CardContent className="p-0">
                    {/* Header with gradient background */}
                    <div className={`bg-gradient-to-br ${option.gradient} p-6 relative`}>
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-2xl bg-white shadow-sm ${option.iconColor}`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          {option.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {option.description}
                        </p>
                      </div>

                      {/* Stats or Features */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>Active community</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>Join discussions</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-2xl bg-primary/10">
                      <Camera className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Share Your Pet's Day</h3>
                      <p className="text-sm text-muted-foreground">Post photos and updates about your furry friend</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-2xl bg-secondary/10">
                      <Users className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Find Pet Friends</h3>
                      <p className="text-sm text-muted-foreground">Discover playmates for your pets nearby</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Social;