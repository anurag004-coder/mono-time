import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const paymentMethod = (body.payment_method || 'card').toLowerCase();
    const cardClean = (body.card_number || '').replace(/[\s•]/g, '');

    // Intentional decline test card
    if (paymentMethod === 'card' && cardClean === '4000000000000002') {
      return NextResponse.json(
        { detail: 'Your card was declined. Please use standard mock card 4242 4242 4242 4242.' },
        { status: 400 }
      );
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${orderId.split('-').pop()}`;

    // Try to forward to Python FastAPI backend if available
    const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8000';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const backendRes = await fetch(`${backendUrl}/api/checkout/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (backendRes.ok) {
        const backendData = await backendRes.json();
        return NextResponse.json(backendData);
      }
    } catch {}

    // Fallback: Standalone Next.js simulation for Vercel / serverless deployments
    return NextResponse.json({
      orderId,
      invoiceNumber,
      status: 'succeeded',
      amount: body.amount_inr || 0,
      paymentMethod,
      customerEmail: body.customer_email || 'client@monotime.luxury',
      customerName: body.customer_name || 'Client',
      shippingCity: body.shipping_city || 'New Delhi, India',
      itemsCount: (body.items || []).length,
      paymentDetails: {
        method: paymentMethod,
        card_last4: (body.card_number || '4242').slice(-4),
        gateway: 'Stripe 3D-Secure Mock Sandbox',
        transaction_ref: `ch_mock_${Math.random().toString(36).substring(2, 14)}`,
      },
      message: `Payment simulation succeeded via ${paymentMethod.toUpperCase()}. Order confirmed!`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
