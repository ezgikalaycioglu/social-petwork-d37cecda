
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Camera } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FeedItem {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  user_display_name: string | null;
}

interface AdventureCardProps {
  item: FeedItem;
}

const AdventureCard: React.FC<AdventureCardProps> = ({ item }) => {
  const navigate = useNavigate();

  const handleViewAdventure = () => {
    // Navigate to pet adventures - we'll need the pet_id from the adventure
    // For now, navigate to pet social where they can find adventures
    navigate('/pet-social');
  };

  return (
    <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Camera className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">New Adventure</p>
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
              {item.user_display_name || 'Someone'} shared an adventure
            </p>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
          <p className="text-gray-700 mb-4">{item.description}</p>
        </div>

        {item.image_url && (
          <div className="mb-4">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-64 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        <Button
          onClick={handleViewAdventure}
          variant="outline"
          className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
        >
          <MapPin className="w-4 h-4 mr-2" />
          View Adventure
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdventureCard;
