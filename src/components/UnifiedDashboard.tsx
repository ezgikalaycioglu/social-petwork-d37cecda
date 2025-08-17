import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon,
  MessageCircle, 
  Star, 
  MapPin, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Users,
  Home,
  PawPrint,
  Bell,
  Settings,
  Eye,
  Edit,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface BookingStats {
  totalEarnings: number;
  activeBookings: number;
  completedBookings: number;
  averageRating: number;
  responseRate: number;
}

interface RecentBooking {
  id: string;
  type: 'pet-sitting' | 'house-sitting';
  clientName: string;
  clientPhoto: string;
  petName?: string;
  homeName?: string;
  dates: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
  rating?: number;
}

interface Message {
  id: string;
  from: string;
  fromPhoto: string;
  preview: string;
  timestamp: string;
  unread: boolean;
  bookingId: string;
}

const UnifiedDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Mock data for demonstration
  const [stats] = useState<BookingStats>({
    totalEarnings: 2840,
    activeBookings: 3,
    completedBookings: 27,
    averageRating: 4.9,
    responseRate: 98
  });

  const [recentBookings] = useState<RecentBooking[]>([
    {
      id: '1',
      type: 'pet-sitting',
      clientName: 'Sarah Johnson',
      clientPhoto: '/placeholder.svg',
      petName: 'Luna',
      dates: 'Mar 15-18, 2024',
      status: 'confirmed',
      amount: 225,
      rating: 5
    },
    {
      id: '2',
      type: 'house-sitting',
      clientName: 'Michael Chen',
      clientPhoto: '/placeholder.svg',
      homeName: 'Downtown Loft',
      dates: 'Mar 20-25, 2024',
      status: 'pending',
      amount: 180
    },
    {
      id: '3',
      type: 'pet-sitting',
      clientName: 'Emma Davis',
      clientPhoto: '/placeholder.svg',
      petName: 'Max & Bella',
      dates: 'Mar 12-14, 2024',
      status: 'completed',
      amount: 150,
      rating: 5
    }
  ]);

  const [messages] = useState<Message[]>([
    {
      id: '1',
      from: 'Sarah Johnson',
      fromPhoto: '/placeholder.svg',
      preview: 'Hi! Just wanted to confirm the pickup time for Luna...',
      timestamp: '2 minutes ago',
      unread: true,
      bookingId: '1'
    },
    {
      id: '2',
      from: 'Michael Chen',
      fromPhoto: '/placeholder.svg',
      preview: 'Thanks for accepting! I have a few questions about...',
      timestamp: '1 hour ago',
      unread: true,
      bookingId: '2'
    },
    {
      id: '3',
      from: 'Emma Davis',
      fromPhoto: '/placeholder.svg',
      preview: 'Thank you so much for taking great care of Max and Bella!',
      timestamp: '2 days ago',
      unread: false,
      bookingId: '3'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const StatCard = ({ title, value, icon: Icon, subtitle, trend }: any) => (
    <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-white to-primary/5">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-xl">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">{trend}</span>
            <span className="text-muted-foreground ml-1">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const BookingCard = ({ booking }: { booking: RecentBooking }) => (
    <Card className="rounded-xl border hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={booking.clientPhoto} alt={booking.clientName} />
            <AvatarFallback>{booking.clientName.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-foreground">{booking.clientName}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  {booking.type === 'pet-sitting' ? (
                    <>
                      <PawPrint className="w-4 h-4 mr-1" />
                      {booking.petName}
                    </>
                  ) : (
                    <>
                      <Home className="w-4 h-4 mr-1" />
                      {booking.homeName}
                    </>
                  )}
                </div>
              </div>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {booking.dates}
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">${booking.amount}</p>
                {booking.rating && (
                  <div className="flex items-center text-sm">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                    {booking.rating}.0
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MessageCard = ({ message }: { message: Message }) => (
    <Card className={cn(
      "rounded-xl border hover:shadow-md transition-all duration-200 cursor-pointer",
      message.unread && "bg-primary/5 border-primary/20"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={message.fromPhoto} alt={message.from} />
              <AvatarFallback>{message.from.charAt(0)}</AvatarFallback>
            </Avatar>
            {message.unread && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
            )}
          </div>
          
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground">{message.from}</p>
              <p className="text-xs text-muted-foreground">{message.timestamp}</p>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {message.preview}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Manage your pet sitting and house sitting services from one place
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-muted/50 rounded-xl p-1">
            <TabsTrigger
              value="overview"
              className="rounded-lg px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="bookings"
              className="rounded-lg px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Bookings
            </TabsTrigger>
            <TabsTrigger 
              value="messages"
              className="rounded-lg px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm relative"
            >
              Messages
              {messages.filter(m => m.unread).length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs text-primary-foreground font-medium">
                    {messages.filter(m => m.unread).length}
                  </span>
                </div>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="calendar"
              className="rounded-lg px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Calendar
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Earnings"
                value={`$${stats.totalEarnings.toLocaleString()}`}
                icon={DollarSign}
                subtitle="This month"
                trend="+23%"
              />
              <StatCard
                title="Active Bookings"
                value={stats.activeBookings}
                icon={CalendarIcon}
                subtitle="Confirmed"
              />
              <StatCard
                title="Average Rating"
                value={stats.averageRating}
                icon={Star}
                subtitle={`${stats.completedBookings} reviews`}
              />
              <StatCard
                title="Response Rate"
                value={`${stats.responseRate}%`}
                icon={CheckCircle}
                subtitle="Last 30 days"
              />
            </div>

            {/* Quick Actions */}
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 rounded-xl"
                    onClick={() => navigate('/profile/sitter')}
                  >
                    <Edit className="w-5 h-5" />
                    <span className="text-sm">Edit Profile</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 rounded-xl"
                    onClick={() => navigate('/availability')}
                  >
                    <CalendarIcon className="w-5 h-5" />
                    <span className="text-sm">Set Availability</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 rounded-xl"
                    onClick={() => navigate('/listings/new')}
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-sm">Add Listing</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 rounded-xl"
                    onClick={() => navigate('/analytics')}
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm">View Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Bookings
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('bookings')}>
                      View All
                      <Eye className="w-4 h-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentBookings.slice(0, 3).map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Messages
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('messages')}>
                      View All
                      <MessageCircle className="w-4 h-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {messages.slice(0, 3).map((message) => (
                    <MessageCard key={message.id} message={message} />
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Messages
                  <Badge variant="secondary">
                    {messages.filter(m => m.unread).length} unread
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {messages.map((message) => (
                  <MessageCard key={message.id} message={message} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Availability Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-8">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-xl border"
                  />
                  <div className="flex-1 space-y-4">
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <h3 className="font-medium mb-2">
                        {selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : 'Select a date'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        No bookings for this date
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default UnifiedDashboard;