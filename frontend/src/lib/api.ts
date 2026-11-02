import { Product, ChatMessage, PitchEvent, MerchantStats } from '@/types';

const getApiBase = () => {
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim() !== '') {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    return '';
  }
  return 'http://localhost:8000';
};

const API_BASE = getApiBase();

export async function fetchProductsApi(gender?: string, category?: string): Promise<Product[] | null> {
  try {
    const params = new URLSearchParams();
    if (gender && gender !== 'all') params.append('gender', gender);
    if (category && category !== 'All') params.append('category', category);

    const res = await fetch(`${API_BASE}/api/products?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Backend API unavailable, using local catalog data:', err);
    return null;
  }
}

export async function searchProductsApi(query: string, gender?: string, category?: string): Promise<Product[] | null> {
  try {
    const res = await fetch(`${API_BASE}/api/products/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, gender, category, limit: 6 }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Backend search API unavailable, using client search:', err);
    return null;
  }
}

export async function sendChatMessageApi(
  message: string,
  productId?: string,
  sessionId: string = 'session-guest'
): Promise<{ text: string; agentType: 'supervisor' | 'stylist' | 'rag'; suggestedPrompts: string[]; sources?: string[] } | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(`${API_BASE}/api/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        message,
        product_id: productId,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      text: data.text,
      agentType: data.agent_type,
      suggestedPrompts: data.suggested_prompts || [],
      sources: data.sources || [],
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Backend chat API unavailable or timed out, using client fallback:', err);
    return null;
  }
}

export async function checkExitIntentApi(
  productId: string,
  mouseY: number = 0,
  timeOnPage: number = 0,
  triggerType: string = 'exit_intent',
  sessionId: string = 'session-guest'
): Promise<PitchEvent | null> {
  try {
    const res = await fetch(`${API_BASE}/api/observer/check-exit-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        product_id: productId,
        mouse_y: mouseY,
        time_on_page_seconds: timeOnPage,
        trigger_type: triggerType,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.should_trigger) return null;
    return {
      id: data.id,
      timestamp: data.timestamp,
      productId: data.product_id,
      productName: data.product_name,
      gender: data.gender,
      triggerType: data.trigger_type,
      offer: data.offer,
      code: data.code,
      clicked: data.clicked,
      converted: data.converted,
    };
  } catch (err) {
    console.warn('Observer API unavailable, using client exit logic:', err);
    return null;
  }
}

export async function claimPitchOfferApi(pitchId: string, code: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/observer/claim-pitch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pitch_id: pitchId, code }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchMerchantAnalyticsApi(): Promise<MerchantStats | null> {
  try {
    const res = await fetch(`${API_BASE}/api/merchant/analytics`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Merchant analytics API unavailable, using client store:', err);
    return null;
  }
}

export async function fetchMerchantPitchesApi(): Promise<PitchEvent[] | null> {
  try {
    const res = await fetch(`${API_BASE}/api/merchant/pitches`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.map((p: any) => ({
      id: p.id,
      timestamp: p.timestamp,
      productId: p.product_id,
      productName: p.product_name,
      gender: p.gender,
      triggerType: p.trigger_type,
      offer: p.offer,
      code: p.code,
      clicked: p.clicked,
      converted: p.converted,
    }));
  } catch (err) {
    console.warn('Merchant pitches API unavailable, using client store:', err);
    return null;
  }
}

export async function trackSessionApi(
  sessionId: string,
  productId?: string,
  dwellSeconds: number = 30
): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/sessions/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        product_id: productId,
        dwell_seconds: dwellSeconds,
      }),
    });
  } catch {}
}

export async function createCheckoutIntentApi(amountINR: number, discountCode?: string): Promise<{ intentId: string; clientSecret: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/api/checkout/create-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount_inr: amountINR, discount_code: discountCode }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export interface CheckStockResult {
  all_in_stock: boolean;
  in_stock_items: Array<{ product_id: string; title: string; in_stock: boolean }>;
  out_of_stock_items: Array<{ product_id: string; title: string; reason: string; in_stock: boolean }>;
}

export async function checkStockApi(
  items: Array<{ productId: string; quantity?: number }>
): Promise<CheckStockResult | null> {
  try {
    const res = await fetch(`${API_BASE}/api/checkout/check-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((it) => ({ product_id: it.productId, quantity: it.quantity || 1 })),
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Backend stock check API unavailable:', err);
    return null;
  }
}

export interface CheckoutOrderPayload {
  intentId?: string;
  paymentMethod?: 'card' | 'upi' | 'cod';
  cardNumber?: string;
  expiry?: string;
  cvc?: string;
  upiId?: string;
  phoneNumber?: string;
  customerName?: string;
  customerEmail?: string;
  shippingCity?: string;
  amountINR: number;
  discountCode?: string;
  discountPercent?: number;
  items: Array<{
    productId: string;
    productTitle: string;
    brand: string;
    quantity: number;
    priceINR: number;
    image: string;
  }>;
}

export async function confirmCheckoutApi(
  payload: CheckoutOrderPayload
): Promise<{
  status: string;
  orderId?: string;
  invoiceNumber?: string;
  paymentMethod?: string;
  amount?: number;
  message?: string;
  paymentDetails?: any;
} | null> {
  try {
    const res = await fetch(`${API_BASE}/api/checkout/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent_id: payload.intentId || 'pi_mock_checkout',
        payment_method: payload.paymentMethod || 'card',
        card_number: payload.cardNumber || '4242424242424242',
        expiry: payload.expiry || '12/28',
        cvc: payload.cvc || '888',
        upi_id: payload.upiId,
        phone_number: payload.phoneNumber,
        customer_name: payload.customerName,
        customer_email: payload.customerEmail,
        shipping_city: payload.shippingCity,
        amount_inr: payload.amountINR,
        discount_code: payload.discountCode,
        discount_percent: payload.discountPercent || 0,
        items: payload.items,
      }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Payment verification failed');
    }
    return await res.json();
  } catch (err: any) {
    console.warn('Backend checkout confirm API error:', err);
    throw err;
  }
}

export async function fetchOrderInvoiceApi(orderId: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/api/checkout/orders/${orderId}/invoice`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Backend order invoice API unavailable:', err);
    return null;
  }
}

export async function fetchRecentOrdersApi(): Promise<any[] | null> {
  try {
    const res = await fetch(`${API_BASE}/api/checkout/orders`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// --------------------------------------------------------
// Admin Authentication & Protected Endpoints (/api/admin/*)
// --------------------------------------------------------
export async function adminLoginApi(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string; retryAfter?: number }> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    if (res.status === 429) {
      const data = await res.json().catch(() => ({}));
      const retryAfter = parseInt(res.headers.get('Retry-After') || '60', 10);
      return {
        success: false,
        error: data.detail || `Too many failed attempts. Please retry in ${retryAfter} seconds.`,
        retryAfter,
      };
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        error: data.detail || 'Invalid username or password.',
      };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: 'Network error connecting to authentication service.',
    };
  }
}

export async function adminLogoutApi(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function checkAdminSessionApi(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchAdminAnalyticsApi(): Promise<MerchantStats | null> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/analytics`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchAdminPitchesApi(): Promise<PitchEvent[] | null> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/pitches`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchAdminOrdersApi(): Promise<any[] | null> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/orders`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

