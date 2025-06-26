
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateLimitRequest {
  identifier: string; // IP address or user ID
  action: string; // Type of action (e.g., 'login', 'business_profile', 'deal_creation')
  window_minutes?: number; // Time window in minutes (default: 15)
  max_attempts?: number; // Max attempts in window (default: 5)
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

    const { identifier, action, window_minutes = 15, max_attempts = 5 }: RateLimitRequest = await req.json();
    
    if (!identifier || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing identifier or action' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const now = new Date();
    const windowStart = new Date(now.getTime() - (window_minutes * 60 * 1000));
    
    // Check existing attempts in the time window
    const { data: attempts, error: fetchError } = await supabaseAdmin
      .from('rate_limit_attempts')
      .select('*')
      .eq('identifier', identifier)
      .eq('action', action)
      .gte('created_at', windowStart.toISOString());

    if (fetchError) {
      console.error('Error fetching rate limit attempts:', fetchError);
      throw fetchError;
    }

    const currentAttempts = attempts?.length || 0;

    // Check if rate limit exceeded
    if (currentAttempts >= max_attempts) {
      // Clean up old attempts while we're here
      await supabaseAdmin
        .from('rate_limit_attempts')
        .delete()
        .eq('identifier', identifier)
        .eq('action', action)
        .lt('created_at', windowStart.toISOString());

      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          allowed: false,
          attempts_remaining: 0,
          reset_time: new Date(now.getTime() + (window_minutes * 60 * 1000)).toISOString()
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Record this attempt
    const { error: insertError } = await supabaseAdmin
      .from('rate_limit_attempts')
      .insert({
        identifier,
        action,
        created_at: now.toISOString(),
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      });

    if (insertError) {
      console.error('Error recording rate limit attempt:', insertError);
      // Don't fail the request if we can't record the attempt
    }

    // Clean up old attempts
    await supabaseAdmin
      .from('rate_limit_attempts')
      .delete()
      .eq('identifier', identifier)
      .eq('action', action)
      .lt('created_at', windowStart.toISOString());

    return new Response(
      JSON.stringify({ 
        allowed: true,
        attempts_remaining: max_attempts - currentAttempts - 1,
        window_minutes,
        max_attempts
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in rate-limit function:', error);
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
