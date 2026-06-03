import { GoogleGenAI } from 'npm:@google/genai@1.34.0';

type GeminiAction = 'generateContent' | 'streamGenerateContent' | 'embedContent';

type GeminiProxyPayload = {
  action?: GeminiAction;
  model?: string;
  contents?: unknown;
  content?: unknown;
  systemInstruction?: string;
  generationConfig?: Record<string, unknown>;
};

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...corsHeaders,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

function getConfig(payload: GeminiProxyPayload) {
  return {
    ...(payload.generationConfig ?? {}),
    ...(payload.systemInstruction ? { systemInstruction: payload.systemInstruction } : {}),
  };
}

function requireString(value: unknown, name: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Missing or invalid ${name}`);
  }
  return value;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    return json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
  }

  let payload: GeminiProxyPayload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const action = payload.action;
  if (!action) {
    return json({ error: 'Missing action' }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    switch (action) {
      case 'generateContent': {
        const model = requireString(payload.model, 'model');
        const response = await ai.models.generateContent({
          model,
          contents: payload.contents as never,
          config: getConfig(payload),
        });

        return json({
          text: response.text ?? '',
          candidates: response.candidates ?? [],
        });
      }

      case 'streamGenerateContent': {
        const model = requireString(payload.model, 'model');
        const stream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            try {
              const response = await ai.models.generateContentStream({
                model,
                contents: payload.contents as never,
                config: getConfig(payload),
              });

              for await (const chunk of response) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({
                    text: chunk.text ?? '',
                    candidates: chunk.candidates ?? [],
                  })}\n\n`),
                );
              }
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            } catch (error) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  error: error instanceof Error ? error.message : 'Stream failed',
                })}\n\n`),
              );
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            ...corsHeaders,
            'content-type': 'text/event-stream; charset=utf-8',
            'cache-control': 'no-cache',
            connection: 'keep-alive',
          },
        });
      }

      case 'embedContent': {
        const model = requireString(payload.model, 'model');
        const response = await ai.models.embedContent({
          model,
          contents: payload.content as never,
        });

        return json(response);
      }

      default:
        return json({ error: `Unsupported action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error('gemini edge function error', error);
    return json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
});
