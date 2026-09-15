import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const raw = body?.key;
  const key = typeof raw === 'string' ? raw.trim().toLowerCase() : raw;
  const expected = process.env.DOCS_ACCESS_KEY?.trim().toLowerCase();
  if (!key || !expected || key !== expected) {
    return NextResponse.json({ error: 'invalid key' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('docs_auth', expected, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
