
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Clock, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FeedItem {
  id: string;
  title: string;
  description: string;
  created_at: string;
  user_display_name: string | null;
  location_name: string | null;
  event_id: string | null;
}

interface GroupWalkCardProps {
  item: FeedItem;
}

const GroupWalkCard: React.FC<GroupWalkCardProps> = ({ item }) => {
  const navigate = useNavigate();

  const handleJoinEvent = () => {
    navigate('/events');
  };

  return (
    <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Group Walk Event</p>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                {item.user_display_name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-gray-600">
              {item.user_display_name || 'Someone'} organized a group walk
            </p>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
          <p className="text-gray-700 mb-3">{item.description}</p>
          
          {item.location_name && (
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              {item.location_name}
            </div>
          )}
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
          <div className="flex items-center text-sm text-orange-700">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Upcoming event - Join other pet parents!</span>
          </div>
        </div>

        <Button
          onClick={handleJoinEvent}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Users className="w-4 h-4 mr-2" />
          Join Group Walk
        </Button>
      </CardContent>
    </Card>
  );
};

export default GroupWalkCard;
