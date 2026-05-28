/**
 * Supabase Edge Function: Gemini API Proxy (SECURED)
 *
 * This function proxies requests to Google's Gemini API,
 * keeping the API key secure on the server side.
 * 
 * SECURITY: Requires Authorization header with valid Supabase JWT
 * Deploy with: supabase functions deploy gemini
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const APP_ORIGIN = Deno.env.get('APP_ORIGIN') || '*';

const corsHeaders = {
  'Access-Control-Allow-Origin': APP_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper: Verify JWT and extract user info
async function verifyAuth(req: Request) {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase credentials not configured');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('Invalid or expired token');
  }

  return { user, token };
}

// Rate limiting: simple in-memory counter (per user)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 30; // 30 requests per minute

  const record = rateLimitStore.get(userId);
  
  if (!record || now > record.resetAt) {
    // New window
    rateLimitStore.set(userId, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false; // Rate limited
  }

  record.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // SECURITY: Verify authentication
    const { user, token } = await verifyAuth(req);
    
    // SECURITY: Check rate limit
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const { action, ...params } = await req.json();

    let endpoint: string;
    let body: any;

    switch (action) {
      case 'generateContent':
        endpoint = `/models/${params.model || 'gemini-2.0-flash'}:generateContent`;
        body = {
          contents: params.contents,
          systemInstruction: params.systemInstruction,
          generationConfig: params.generationConfig,
        };
        break;

      case 'streamGenerateContent':
        endpoint = `/models/${params.model || 'gemini-2.0-flash'}:streamGenerateContent`;
        body = {
          contents: params.contents,
          systemInstruction: params.systemInstruction,
          generationConfig: params.generationConfig,
        };
        break;

      case 'embedContent':
        endpoint = `/models/${params.model || 'text-embedding-004'}:embedContent`;
        body = {
          content: params.content,
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const url = `${GEMINI_BASE_URL}${endpoint}?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    // For streaming, we need to handle differently
    if (action === 'streamGenerateContent') {
      // Return the stream directly
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
        },
      });
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Edge function error:', error);

    const message = error instanceof Error ? error.message : 'Internal server error';
    const statusCode = message.includes('Authorization') ||
                       message.includes('Missing or invalid') ||
                       message.includes('Invalid or expired token') ? 401 :
                       message.includes('Rate limit') ? 429 : 500;

    return new Response(
      JSON.stringify({
        error: message,
      }),
      {
        status: statusCode,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
