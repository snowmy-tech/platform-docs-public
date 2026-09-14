import { NextRequest, NextResponse } from 'next/server';

// OpenAI-compatible passthrough to the provider configured via env vars
// (AI_BASE_URL / AI_API_KEY / AI_MODEL). No converter needed.
export async function POST(req: NextRequest) {
  const base = process.env.AI_BASE_URL;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  if (!base || !apiKey || !model) {
    return NextResponse.json(
      { error: 'AI provider not configured (AI_BASE_URL / AI_API_KEY / AI_MODEL)' },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.messages)) {
    return NextResponse.json({ error: 'body.messages array required' }, { status: 400 });
  }

  const upstream = await fetch(`${base.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, ...body }),
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json' },
  });
}
