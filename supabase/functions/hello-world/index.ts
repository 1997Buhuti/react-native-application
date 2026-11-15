// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This code runs on Supabase Edge Functions (Deno runtime).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name = 'Student' } = await req.json().catch(() => ({}));

    const sampleTasks = [
      'Learn Supabase Row Level Security (RLS)',
      'Deploy your first Edge Function with CLI',
      'Listen to Realtime database changes',
      'Implement user authentication with Supabase Auth',
    ];
    const suggestedTask = sampleTasks[Math.floor(Math.random() * sampleTasks.length)];

    const payload = {
      message: `Hello ${name} from Supabase Edge Functions!`,
      suggestedTask,
      timestamp: new Date().toISOString(),
      runtime: 'Deno / Edge Runtime',
    };

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
