
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  event_id: string;
  event_type: 'playdate_request' | 'playdate_confirmation' | 'friend_request' | 'event_invite';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { event_id, event_type }: NotificationRequest = await req.json();
    
    console.log(`Processing ${event_type} notification for event: ${event_id}`);

    // Fetch the event details
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (eventError) {
      console.error('Error fetching event:', eventError);
      throw eventError;
    }

    // Get FCM tokens for participants (excluding the creator for requests)
    const targetUserIds = event_type === 'playdate_request' 
      ? event.participants.filter((id: string) => id !== event.creator_id)
      : event.participants;

    // Get both FCM tokens and OneSignal player IDs
    const { data: fcmTokens, error: tokenError } = await supabaseAdmin
      .from('fcm_tokens')
      .select('token, user_id')
      .in('user_id', targetUserIds);

    if (tokenError) {
      console.error('Error fetching FCM tokens:', tokenError);
    }

    // Get OneSignal player IDs from user_profiles
    const { data: userProfiles, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, onesignal_player_id')
      .in('id', targetUserIds);

    if (profileError) {
      console.error('Error fetching user profiles:', profileError);
    }

    // Filter users with OneSignal player IDs
    const oneSignalPlayerIds = userProfiles
      ?.filter(profile => profile.onesignal_player_id)
      .map(profile => profile.onesignal_player_id) || [];

    console.log('Notification details:', {
      event_type,
      event_id,
      event_title: event.title,
      location: event.location_name,
      scheduled_time: event.scheduled_time,
      target_users: targetUserIds,
      fcm_tokens_count: fcmTokens?.length || 0,
      onesignal_player_ids_count: oneSignalPlayerIds.length
    });

    // Send OneSignal push notifications if we have player IDs
    if (oneSignalPlayerIds.length > 0) {
      const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID');
      const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY');

      if (ONESIGNAL_APP_ID && ONESIGNAL_REST_API_KEY) {
        const notificationTitle = event_type === 'playdate_request' 
          ? 'New Playdate Request!' 
          : event_type === 'friend_request'
          ? 'New Friend Request!'
          : event_type === 'event_invite'
          ? 'You\'re Invited!'
          : 'Playdate Confirmed!';

        const notificationBody = event_type === 'playdate_request'
          ? `${event.title} at ${event.location_name}`
          : event_type === 'playdate_confirmation'
          ? `Your playdate "${event.title}" has been confirmed!`
          : `Check out the new ${event_type.replace('_', ' ')}!`;

        try {
          const oneSignalResponse = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
            },
            body: JSON.stringify({
              app_id: ONESIGNAL_APP_ID,
              include_player_ids: oneSignalPlayerIds,
              headings: { en: notificationTitle },
              contents: { en: notificationBody },
              data: {
                event_id,
                event_type,
              },
            }),
          });

          const oneSignalResult = await oneSignalResponse.json();
          console.log('OneSignal notification sent:', oneSignalResult);
        } catch (oneSignalError) {
          console.error('Error sending OneSignal notification:', oneSignalError);
        }
      } else {
        console.log('OneSignal credentials not configured, skipping native push');
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${event_type} notification processed`,
        fcm_tokens_found: fcmTokens?.length || 0,
        onesignal_players_found: oneSignalPlayerIds.length
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in send-playdate-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
