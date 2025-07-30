
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, Camera, Plus, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import LogAdventureModal from './LogAdventureModal';

interface Adventure {
  id: string;
  title: string;
  description: string | null;
  adventure_date: string;
  photos: string[];
  tagged_pet_ids: string[];
  created_at: string;
}

interface AdventureTimelineProps {
  petId: string;
  petName: string;
  isOwner: boolean;
}

const AdventureTimeline = ({ petId, petName, isOwner }: AdventureTimelineProps) => {
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expandedAdventure, setExpandedAdventure] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdventures();
    
    // Set up real-time listener
    const channel = supabase
      .channel('adventures-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'adventures',
          filter: `pet_id=eq.${petId}`
        },
        () => {
          fetchAdventures();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [petId]);

  const fetchAdventures = async () => {
    try {
      const { data, error } = await supabase
        .from('adventures')
        .select('*')
        .eq('pet_id', petId)
        .order('adventure_date', { ascending: false });

      if (error) throw error;
      setAdventures(data || []);
    } catch (error) {
      console.error('Error fetching adventures:', error);
      toast({
        title: "Error",
        description: "Failed to load adventures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdventureCreated = () => {
    setShowModal(false);
    fetchAdventures();
    toast({
      title: "Success!",
      description: "Adventure saved successfully!",
    });
  };

  const handleDeleteAdventure = async (adventureId: string) => {
    try {
      const { error } = await supabase
        .from('adventures')
        .delete()
        .eq('id', adventureId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Adventure deleted successfully",
      });
      
      fetchAdventures();
    } catch (error) {
      console.error('Error deleting adventure:', error);
      toast({
        title: "Error",
        description: "Failed to delete adventure",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Adventures</h2>
        {isOwner && (
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log New Adventure
          </Button>
        )}
      </div>

      {adventures.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Adventures Yet
            </h3>
            <p className="text-gray-500 mb-4">
              {isOwner 
                ? `Start documenting ${petName}'s adventures!`
                : `${petName} hasn't shared any adventures yet.`
              }
            </p>
            {isOwner && (
              <Button 
                onClick={() => setShowModal(true)}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log First Adventure
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {adventures.map((adventure) => (
            <Card key={adventure.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
              {isOwner && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 z-10 opacity-75 hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Adventure</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{adventure.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteAdventure(adventure.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{adventure.title}</CardTitle>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(adventure.adventure_date), 'MMM dd, yyyy')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {adventure.photos.length > 0 && (
                  <div className="mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                      {adventure.photos.slice(0, 6).map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Adventure photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setExpandedAdventure(expandedAdventure === adventure.id ? null : adventure.id)}
                        />
                      ))}
                    </div>
                    {adventure.photos.length > 6 && (
                      <p className="text-sm text-gray-500">
                        +{adventure.photos.length - 6} more photos
                      </p>
                    )}
                  </div>
                )}
                
                <div className="space-y-2">
                  <p className="text-gray-700 leading-relaxed">
                    {expandedAdventure === adventure.id || !adventure.description 
                      ? adventure.description 
                      : `${adventure.description.substring(0, 150)}${adventure.description.length > 150 ? '...' : ''}`
                    }
                  </p>
                  
                  {adventure.description && adventure.description.length > 150 && (
                    <button
                      onClick={() => setExpandedAdventure(expandedAdventure === adventure.id ? null : adventure.id)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      {expandedAdventure === adventure.id ? 'Show less' : 'Read more'}
                    </button>
                  )}
                  
                  {adventure.tagged_pet_ids.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Tagged pets:</span>
                      <Badge variant="outline">
                        {adventure.tagged_pet_ids.length} pet{adventure.tagged_pet_ids.length > 1 ? 's' : ''} tagged
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Expanded photo gallery */}
                {expandedAdventure === adventure.id && adventure.photos.length > 6 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {adventure.photos.slice(6).map((photo, index) => (
                      <img
                        key={index + 6}
                        src={photo}
                        alt={`Adventure photo ${index + 7}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <LogAdventureModal
          petId={petId}
          petName={petName}
          onClose={() => setShowModal(false)}
          onSuccess={handleAdventureCreated}
        />
      )}
    </div>
  );
};

export default AdventureTimeline;
