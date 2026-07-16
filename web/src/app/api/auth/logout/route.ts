import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function POST() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
    });
    const response = NextResponse.json({ message: 'Logged out' });
    const setCookieHeader = res.headers.get('set-cookie');
    if (setCookieHeader) {
      response.headers.set('set-cookie', setCookieHeader);
    }
    return response;
  } catch {
    return NextResponse.json({ message: 'Backend unavailable' }, { status: 502 });
  }
}
