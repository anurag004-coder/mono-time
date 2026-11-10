import { NextResponse } from 'next/server';
import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'mono-time-atelier-secure-anurag-ashu-secret-key-2026-prod';

function verifySessionToken(token: string | undefined): string | null {
  if (!token || !token.includes('.')) return null;
  try {
    const [payloadB64, signature] = token.split('.');
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadB64)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload.sub;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/admin_session=([^;]+)/);
  const token = match ? match[1] : undefined;

  // Try forwarding to backend first if reachable
  const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8000';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const backendRes = await fetch(`${backendUrl}/api/admin/pitches`, {
      method: 'GET',
      headers: { cookie: cookieHeader },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data);
    }
  } catch {}

  const user = verifySessionToken(token);
  if (!user) {
    return NextResponse.json(
      { detail: 'Authentication required. Only authenticated administrators may inspect pitch events.' },
      { status: 401 }
    );
  }

  return NextResponse.json([
    {
      id: 'PE-001',
      timestamp: '04:15 PM',
      product_id: 'titan-edge-slate',
      product_name: 'Titan Edge Minimalist Slate Steel',
      gender: 'men',
      trigger_type: 'exit_intent',
      offer: '10% Privileged Savings',
      code: 'MONOTIME10',
      clicked: true,
      converted: true,
    },
  ]);
}

