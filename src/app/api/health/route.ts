import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: process.env.AI_BASE_URL ? new URL(process.env.AI_BASE_URL).origin : null,
    model: process.env.AI_MODEL || null,
  });
}
