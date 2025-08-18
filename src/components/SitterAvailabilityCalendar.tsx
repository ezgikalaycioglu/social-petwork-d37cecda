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
  const [dateRange, setDateRange] = useState<{start: Date | null; end: Date | null}>({start: null, end: null});
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

    // If no start date is selected, set this as start
    if (!dateRange.start) {
      setDateRange({ start: date, end: null });
      return;
    }

    // If start is selected but no end, set end date
    if (dateRange.start && !dateRange.end) {
      const start = dateRange.start;
      const end = date;
      
      // Ensure end date is after start date
      if (isBefore(end, start)) {
        setDateRange({ start: end, end: start });
      } else {
        setDateRange({ start, end });
      }
      
      // Generate all dates in the range and update pending changes
      const rangeDates = generateDateRange(dateRange.start, date);
      updatePendingChangesForRange(rangeDates);
      return;
    }

    // If both start and end are selected, reset and start new selection
    if (dateRange.start && dateRange.end) {
      setDateRange({ start: date, end: null });
      return;
    }
  };

  const generateDateRange = (start: Date, end: Date): Date[] => {
    const dates: Date[] = [];
    let current = new Date(start);
    let endDate = new Date(end);
    
    if (isBefore(endDate, start)) {
      [current, endDate] = [endDate, current];
    }
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const updatePendingChangesForRange = (rangeDates: Date[]) => {
    let newPendingChanges = { toAdd: [], toRemove: [] };
    
    rangeDates.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const isCurrentlySaved = savedAvailableDates.some(d => format(d, 'yyyy-MM-dd') === dateStr);
      
      if (isCurrentlySaved) {
        // If date is saved, mark for removal
        newPendingChanges.toRemove.push(date);
      } else {
        // If date is not saved, mark for addition
        newPendingChanges.toAdd.push(date);
      }
    });
    
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
      setDateRange({ start: null, end: null });
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
    setDateRange({ start: null, end: null });
    setPendingChanges({ toAdd: [], toRemove: [] });
  };

  const hasPendingChanges = pendingChanges.toAdd.length > 0 || pendingChanges.toRemove.length > 0;

  // Get dates in current range for display
  const getSelectedDates = () => {
    if (!dateRange.start) return [];
    if (!dateRange.end) return [dateRange.start];
    return generateDateRange(dateRange.start, dateRange.end);
  };

  const modifiers = {
    saved: savedAvailableDates,
    selected: getSelectedDates(),
    rangeStart: dateRange.start ? [dateRange.start] : [],
    rangeEnd: dateRange.end ? [dateRange.end] : [],
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
    rangeStart: {
      backgroundColor: '#7A5FFF',
      color: 'white',
      fontWeight: '600',
      borderRadius: '50% 0 0 50%'
    },
    rangeEnd: {
      backgroundColor: '#7A5FFF',
      color: 'white',
      fontWeight: '600',
      borderRadius: '0 50% 50% 0'
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
          Click to select start date, then click end date to create an availability range
        </p>
        {dateRange.start && !dateRange.end && (
          <div className="text-sm text-purple-600 mt-2 px-3 py-2 bg-purple-50 rounded-lg" style={{ fontFamily: 'DM Sans' }}>
            📅 Start: {format(dateRange.start, 'MMM dd, yyyy')} - Click end date to complete range
          </div>
        )}
        {dateRange.start && dateRange.end && (
          <div className="text-sm text-green-600 mt-2 px-3 py-2 bg-green-50 rounded-lg" style={{ fontFamily: 'DM Sans' }}>
            📅 Range: {format(dateRange.start, 'MMM dd')} - {format(dateRange.end, 'MMM dd, yyyy')} ({getSelectedDates().length} days)
          </div>
        )}
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
                mode="single"
                onSelect={handleDateSelect}
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