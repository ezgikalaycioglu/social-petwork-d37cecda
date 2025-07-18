import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { petId } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch pet profile data
    const { data: petProfile, error: petError } = await supabase
      .from('pet_profiles')
      .select('*')
      .eq('id', petId)
      .eq('user_id', user.id)
      .single();

    if (petError || !petProfile) {
      return new Response(JSON.stringify({ error: 'Pet not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare prompt data
    const promptData = {
      name: petProfile.name,
      breed: petProfile.breed,
      age: petProfile.age,
      healthConcerns: petProfile.about || 'none specified'
    };

    // Call OpenAI API
    const openAIApiKey = Deno.env.get('OPEN_AI');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini-2025-04-14',
        messages: [
          {
            role: 'system',
            content: "You are 'PawCoach', a helpful AI assistant for pet owners. You provide safe, general advice. You are NOT a veterinarian. Your tone is friendly, helpful, and caring. Always start your nutrition tips with a fun header. Keep tips under 50 words."
          },
          {
            role: 'user',
            content: `Generate a short nutrition tip for the following pet profile. Pet Profile: ${JSON.stringify(promptData)}`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      }),
    });

    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', await openAIResponse.text());
      return new Response(JSON.stringify({ error: 'Failed to generate tip' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIData = await openAIResponse.json();
    const generatedTip = openAIData.choices[0].message.content;

    // Store in database
    const { data: aiContent, error: insertError } = await supabase
      .from('ai_generated_content')
      .insert({
        user_id: user.id,
        pet_id: petId,
        content_type: 'coach_tip',
        prompt_data: promptData,
        generated_text: generatedTip
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to save tip' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      tip: generatedTip,
      id: aiContent.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-coach function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});