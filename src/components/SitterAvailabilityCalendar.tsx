import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, isBefore, startOfDay } from 'date-fns';
import { CalendarCheck, CalendarX, Loader2 } from 'lucide-react';

interface SitterAvailabilityCalendarProps {
  sitterId: string;
}

const SitterAvailabilityCalendar: React.FC<SitterAvailabilityCalendarProps> = ({ sitterId }) => {
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [savedAvailableDates, setSavedAvailableDates] = useState<Date[]>([]);
  const [pendingChanges, setPendingChanges] = useState<{
    toAdd: Date[];
    toRemove: Date[];
  }>({ toAdd: [], toRemove: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing availability on component mount
  useEffect(() => {
    loadAvailability();
  }, [sitterId]);

  const loadAvailability = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sitter_availability')
        .select('available_date')
        .eq('sitter_id', sitterId);

      if (error) throw error;

      const dates = data?.map(item => new Date(item.available_date)) || [];
      setSavedAvailableDates(dates);
    } catch (error) {
      console.error('Error loading availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your availability. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || isBefore(date, startOfDay(new Date()))) return;

    const dateStr = format(date, 'yyyy-MM-dd');
    const isCurrentlySelected = selectedDates.some(d => format(d, 'yyyy-MM-dd') === dateStr);
    const isCurrentlySaved = savedAvailableDates.some(d => format(d, 'yyyy-MM-dd') === dateStr);

    let newSelectedDates: Date[];
    let newPendingChanges = { ...pendingChanges };

    if (isCurrentlySelected) {
      // Deselecting a date
      newSelectedDates = selectedDates.filter(d => format(d, 'yyyy-MM-dd') !== dateStr);
      
      if (isCurrentlySaved) {
        // Was saved and now being deselected - mark for removal
        newPendingChanges.toRemove = [...newPendingChanges.toRemove.filter(d => format(d, 'yyyy-MM-dd') !== dateStr), date];
        newPendingChanges.toAdd = newPendingChanges.toAdd.filter(d => format(d, 'yyyy-MM-dd') !== dateStr);
      } else {
        // Was not saved and being deselected - remove from toAdd
        newPendingChanges.toAdd = newPendingChanges.toAdd.filter(d => format(d, 'yyyy-MM-dd') !== dateStr);
      }
    } else {
      // Selecting a date
      newSelectedDates = [...selectedDates, date];
      
      if (isCurrentlySaved) {
        // Was saved and now being selected again - remove from toRemove
        newPendingChanges.toRemove = newPendingChanges.toRemove.filter(d => format(d, 'yyyy-MM-dd') !== dateStr);
      } else {
        // Was not saved and being selected - mark for addition
        newPendingChanges.toAdd = [...newPendingChanges.toAdd.filter(d => format(d, 'yyyy-MM-dd') !== dateStr), date];
      }
    }

    setSelectedDates(newSelectedDates);
    setPendingChanges(newPendingChanges);
  };

  const handleSaveAvailability = async () => {
    setIsSaving(true);
    try {
      // Remove dates
      if (pendingChanges.toRemove.length > 0) {
        const datesToRemove = pendingChanges.toRemove.map(date => format(date, 'yyyy-MM-dd'));
        const { error: deleteError } = await supabase
          .from('sitter_availability')
          .delete()
          .eq('sitter_id', sitterId)
          .in('available_date', datesToRemove);

        if (deleteError) throw deleteError;
      }

      // Add dates
      if (pendingChanges.toAdd.length > 0) {
        const datesToAdd = pendingChanges.toAdd.map(date => ({
          sitter_id: sitterId,
          available_date: format(date, 'yyyy-MM-dd')
        }));

        const { error: insertError } = await supabase
          .from('sitter_availability')
          .insert(datesToAdd);

        if (insertError) throw insertError;
      }

      // Reload availability and reset state
      await loadAvailability();
      setSelectedDates([]);
      setPendingChanges({ toAdd: [], toRemove: [] });

      toast({
        title: 'Success',
        description: 'Your availability has been updated.',
      });
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your availability. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedDates([]);
    setPendingChanges({ toAdd: [], toRemove: [] });
  };

  const hasPendingChanges = pendingChanges.toAdd.length > 0 || pendingChanges.toRemove.length > 0;

  const modifiers = {
    saved: savedAvailableDates,
    selected: selectedDates,
    disabled: (date: Date) => isBefore(date, startOfDay(new Date()))
  };

  const modifiersStyles = {
    saved: {
      backgroundColor: '#2ECC71',
      color: 'white',
      fontWeight: '600'
    },
    selected: {
      backgroundColor: '#7A5FFF',
      color: 'white',
      fontWeight: '600'
    },
    disabled: {
      backgroundColor: '#E0E0E0',
      color: '#9CA3AF',
      cursor: 'not-allowed'
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg rounded-xl">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-medium text-gray-800" style={{ fontFamily: 'DM Sans', letterSpacing: '-1px', lineHeight: '1.4' }}>
          Manage Your Availability
        </CardTitle>
        <p className="text-gray-600 mt-2" style={{ fontFamily: 'DM Sans', lineHeight: '1.4' }}>
          Select the dates when you're available to provide pet sitting services
        </p>
      </CardHeader>

      <CardContent className="space-y-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <span className="ml-3 text-gray-600" style={{ fontFamily: 'DM Sans' }}>
              Loading your availability...
            </span>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-8 lg:space-y-0">
            {/* Calendar */}
            <div className="flex-1">
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={(_, date) => handleDateSelect(date)}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                className="w-full rounded-xl border border-gray-200 p-4"
                style={{ fontFamily: 'DM Sans' }}
              />
            </div>

            {/* Legend and Actions */}
            <div className="lg:w-80 space-y-6">
              {/* Legend */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4" style={{ fontFamily: 'DM Sans', letterSpacing: '-1px' }}>
                  Date Legend
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-md bg-green-500"></div>
                    <span className="text-sm text-gray-700" style={{ fontFamily: 'DM Sans' }}>Saved as Available</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-md bg-purple-500"></div>
                    <span className="text-sm text-gray-700" style={{ fontFamily: 'DM Sans' }}>Selected</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-md bg-white border border-gray-300"></div>
                    <span className="text-sm text-gray-700" style={{ fontFamily: 'DM Sans' }}>Not Available</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-md bg-gray-300"></div>
                    <span className="text-sm text-gray-700" style={{ fontFamily: 'DM Sans' }}>Past Date</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleSaveAvailability}
                  disabled={!hasPendingChanges || isSaving}
                  className="w-full h-12 rounded-xl text-white font-medium transition-all duration-200 hover:scale-105 disabled:scale-100"
                  style={{ 
                    backgroundColor: hasPendingChanges ? '#7A5FFF' : '#E0E0E0',
                    fontFamily: 'DM Sans',
                    letterSpacing: '-1px'
                  }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CalendarCheck className="w-4 h-4 mr-2" />
                      Save Availability
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleClearSelection}
                  disabled={!hasPendingChanges || isSaving}
                  variant="outline"
                  className="w-full h-12 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:scale-100 border-gray-300"
                  style={{ 
                    fontFamily: 'DM Sans',
                    letterSpacing: '-1px'
                  }}
                >
                  <CalendarX className="w-4 h-4 mr-2" />
                  Clear Selection
                </Button>
              </div>

              {/* Pending Changes Summary */}
              {hasPendingChanges && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'DM Sans' }}>
                    Pending Changes
                  </h4>
                  {pendingChanges.toAdd.length > 0 && (
                    <p className="text-xs text-blue-700 mb-1" style={{ fontFamily: 'DM Sans' }}>
                      Adding {pendingChanges.toAdd.length} available date{pendingChanges.toAdd.length !== 1 ? 's' : ''}
                    </p>
                  )}
                  {pendingChanges.toRemove.length > 0 && (
                    <p className="text-xs text-blue-700" style={{ fontFamily: 'DM Sans' }}>
                      Removing {pendingChanges.toRemove.length} available date{pendingChanges.toRemove.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SitterAvailabilityCalendar;