
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FeedItem {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  created_at: string;
  user_display_name: string | null;
}

interface NewPetCardProps {
  item: FeedItem;
}

const NewPetCard: React.FC<NewPetCardProps> = ({ item }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Navigate to pet social page where they can find this pet
    navigate('/pet-social');
  };

  return (
    <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">New Pet Joined!</p>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="w-16 h-16 border-2 border-green-200">
            <AvatarImage src={item.image_url || ''} alt={item.title} />
            <AvatarFallback className="bg-green-100 text-green-600 text-lg">
              {item.title.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
            <p className="text-gray-600">
              {item.user_display_name ? `${item.user_display_name}'s pet` : 'New member'}
            </p>
          </div>
        </div>

        <p className="text-gray-700 mb-4">{item.description}</p>

        <Button
          onClick={handleCardClick}
          variant="outline"
          className="w-full border-green-500 text-green-600 hover:bg-green-50"
        >
          Say Hello! 👋
        </Button>
      </CardContent>
    </Card>
  );
};

export default NewPetCard;
