
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  event_id: string;
  event_type: 'playdate_request' | 'playdate_confirmation';
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

    const { data: fcmTokens, error: tokenError } = await supabaseAdmin
      .from('fcm_tokens')
      .select('token, user_id')
      .in('user_id', targetUserIds);

    if (tokenError) {
      console.error('Error fetching FCM tokens:', tokenError);
      throw tokenError;
    }

    // For now, we'll just log the notification details
    // In a real implementation, you would send push notifications here
    console.log('Notification details:', {
      event_type,
      event_id,
      event_title: event.title,
      location: event.location_name,
      scheduled_time: event.scheduled_time,
      target_users: targetUserIds,
      fcm_tokens_count: fcmTokens?.length || 0
    });

    // TODO: Implement actual push notification sending logic here
    // This could use Firebase Cloud Messaging, Apple Push Notification service, etc.
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${event_type} notification processed`,
        tokens_found: fcmTokens?.length || 0
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
