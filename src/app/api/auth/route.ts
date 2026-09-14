import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const key = body?.key;
  if (!key || !process.env.DOCS_ACCESS_KEY || key !== process.env.DOCS_ACCESS_KEY) {
    return NextResponse.json({ error: 'invalid key' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('docs_auth', key, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
