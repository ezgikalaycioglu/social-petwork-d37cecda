
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityEvent {
  event_type: 'failed_login' | 'suspicious_access' | 'data_breach_attempt' | 'rate_limit_exceeded';
  user_id?: string;
  email?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const eventData: SecurityEvent = await req.json();
    
    // Extract IP and User Agent from headers
    const ip_address = req.headers.get('x-forwarded-for') || 'unknown';
    const user_agent = req.headers.get('user-agent') || 'unknown';

    // Record the security event
    const { error: insertError } = await supabaseAdmin
      .from('security_events')
      .insert({
        event_type: eventData.event_type,
        user_id: eventData.user_id,
        email: eventData.email,
        ip_address: eventData.ip_address || ip_address,
        user_agent: eventData.user_agent || user_agent,
        details: eventData.details || {},
        severity: eventData.severity,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error recording security event:', insertError);
      throw insertError;
    }

    // Check for patterns that might indicate an attack
    if (eventData.event_type === 'failed_login' && eventData.email) {
      // Check for multiple failed attempts from same email/IP
      const { data: recentFailures, error: fetchError } = await supabaseAdmin
        .from('security_events')
        .select('*')
        .eq('event_type', 'failed_login')
        .or(`email.eq.${eventData.email},ip_address.eq.${ip_address}`)
        .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString()); // Last 15 minutes

      if (fetchError) {
        console.error('Error fetching recent failures:', fetchError);
      } else if (recentFailures && recentFailures.length >= 5) {
        // Log suspicious activity
        await supabaseAdmin
          .from('security_events')
          .insert({
            event_type: 'suspicious_access',
            email: eventData.email,
            ip_address,
            user_agent,
            details: {
              reason: 'Multiple failed login attempts',
              failure_count: recentFailures.length,
              time_window: '15 minutes'
            },
            severity: 'high',
            created_at: new Date().toISOString()
          });

        console.warn(`Suspicious activity detected: ${recentFailures.length} failed logins for ${eventData.email} from ${ip_address}`);
      }
    }

    // For critical events, we could send alerts here
    if (eventData.severity === 'critical') {
      console.error('CRITICAL SECURITY EVENT:', eventData);
      // In production, you would send alerts to monitoring systems
      // or notify administrators
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Security event recorded',
        event_id: new Date().getTime() // Simple ID for tracking
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in security-monitor function:', error);
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
