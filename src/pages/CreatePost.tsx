import React, { useState, useEffect } from 'react';
import { CreateTweetModal } from '@/components/CreateTweetModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [pets, setPets] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPets = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('pet_profiles')
        .select('id, name, profile_photo_url')
        .eq('user_id', user.id);
      
      setPets(data || []);
    };
    
    fetchPets();
  }, [user]);

  const handleClose = () => {
    setIsModalOpen(false);
    navigate(-1); // Go back to previous page
  };

  const handleTweetCreated = () => {
    setIsModalOpen(false);
    navigate('/dashboard'); // Navigate to home after creating post
  };

  return (
    <div className="min-h-screen bg-background pt-16 pb-24">
      <CreateTweetModal 
        isOpen={isModalOpen}
        onClose={handleClose}
        pets={pets}
        onTweetCreated={handleTweetCreated}
      />
    </div>
  );
};

export default CreatePost;