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
    const { petId, imageLabels, customPrompt } = await req.json();
    
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
      petName: petProfile.name,
      breed: petProfile.breed,
      imageLabels: imageLabels || [],
      customPrompt: customPrompt || ''
    };

    // Create the user prompt based on available data
    let userPrompt;
    if (customPrompt) {
      userPrompt = `Write a caption from ${petProfile.name}'s point of view. Context: ${customPrompt}`;
    } else if (imageLabels && imageLabels.length > 0) {
      userPrompt = `Write a caption from the pet's point of view. The pet's name is '${petProfile.name}'. The photo contains the following elements: ${JSON.stringify(imageLabels)}. Generate the caption.`;
    } else {
      userPrompt = `Write a fun social media caption from ${petProfile.name}'s (a ${petProfile.breed}) point of view.`;
    }

    // Call OpenAI API
    const openAIApiKey = Deno.env.get('OPEN_AI');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: "You are 'Pet Pal', an AI that writes funny and cute social media captions from a pet's point of view. Your tone is humorous and a little bit dramatic. Write in the first person ('I', 'me', 'my'). Keep the caption under 140 characters. Add relevant emojis."
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 100,
        temperature: 0.8
      }),
    });

    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', await openAIResponse.text());
      return new Response(JSON.stringify({ error: 'Failed to generate caption' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIData = await openAIResponse.json();
    const generatedCaption = openAIData.choices[0].message.content;

    // Store in database
    const { data: aiContent, error: insertError } = await supabase
      .from('ai_generated_content')
      .insert({
        user_id: user.id,
        pet_id: petId,
        content_type: 'caption',
        prompt_data: promptData,
        generated_text: generatedCaption
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to save caption' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      caption: generatedCaption,
      id: aiContent.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-content-creator function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});