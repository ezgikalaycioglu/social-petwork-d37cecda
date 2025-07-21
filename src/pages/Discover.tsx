import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PetSocial from './PetSocial';
import Events from './Events';
import PetMap from './PetMap';
import Deals from './Deals';

const Discover = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab based on current path
  const getActiveTab = () => {
    switch (location.pathname) {
      case '/events':
        return 'events';
      case '/pet-map':
        return 'pet-map';
      case '/deals':
        return 'deals';
      case '/pet-social':
      case '/discover':
      default:
        return 'pet-social';
    }
  };

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'pet-social':
        navigate('/pet-social');
        break;
      case 'events':
        navigate('/events');
        break;
      case 'pet-map':
        navigate('/pet-map');
        break;
      case 'deals':
        navigate('/deals');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-14 pb-16 md:pt-0 md:pb-0">
      <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:hidden">
          <TabsTrigger value="pet-social">Pet Social</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="pet-map">Pet Map</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pet-social" className="mt-0">
          <PetSocial />
        </TabsContent>
        
        <TabsContent value="events" className="mt-0">
          <Events />
        </TabsContent>
        
        <TabsContent value="pet-map" className="mt-0">
          <PetMap />
        </TabsContent>
        
        <TabsContent value="deals" className="mt-0">
          <Deals />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Discover;