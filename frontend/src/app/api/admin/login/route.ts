import { NextResponse } from 'next/server';
import crypto from 'crypto';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'Anurag_Ashu';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ViratKohli';
const SESSION_SECRET = process.env.SESSION_SECRET || 'mono-time-atelier-secure-anurag-ashu-secret-key-2026-prod';

function createSessionToken(username: string): string {
  const payload = {
    sub: username,
    exp: Math.floor(Date.now() / 1000) + 7200, // 2 hours
    nonce: crypto.randomBytes(8).toString('hex'),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('hex');
  return `${payloadB64}.${signature}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = (body.username || '').trim();
    const password = body.password || '';

    // First, try forwarding to Python FastAPI backend if configured/reachable
    const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8000';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const backendRes = await fetch(`${backendUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (backendRes.ok) {
        const setCookieHeader = backendRes.headers.get('set-cookie');
        const nextRes = NextResponse.json({ success: true, username });
        if (setCookieHeader) {
          nextRes.headers.set('set-cookie', setCookieHeader);
        } else {
          const token = createSessionToken(username);
          nextRes.cookies.set('admin_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 7200,
          });
        }
        return nextRes;
      } else if (backendRes.status === 429) {
        const data = await backendRes.json().catch(() => ({}));
        return NextResponse.json(
          { detail: data.detail || 'Too many failed login attempts.' },
          { status: 429 }
        );
      }
    } catch {}

    // Fallback: Standalone authentication for Vercel / serverless deployments
    const userMatch = username.toLowerCase() === ADMIN_USERNAME.toLowerCase();
    const passMatch = password === ADMIN_PASSWORD;

    if (!userMatch || !passMatch) {
      return NextResponse.json(
        { detail: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const token = createSessionToken(ADMIN_USERNAME);
    const response = NextResponse.json({
      success: true,
      username: ADMIN_USERNAME,
      message: 'Authentication successful. Welcome to Mono Time Atelier Administration.',
    });

    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7200, // 2 hours
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { detail: 'Authentication error occurred.' },
      { status: 500 }
    );
  }
}
