import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:7070';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: 'Backend unavailable' }, { status: 502 });
  }
}
