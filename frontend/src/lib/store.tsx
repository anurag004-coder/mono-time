'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, ChatMessage, PitchEvent, MerchantStats, GenderCategory, WatchStyle, PaymentMethod } from '@/types';
import { PRODUCTS } from './products';
import {
  fetchProductsApi,
  sendChatMessageApi,
  checkExitIntentApi,
  claimPitchOfferApi,
  fetchMerchantAnalyticsApi,
  fetchMerchantPitchesApi,
  confirmCheckoutApi,
} from './api';

interface StoreContextType {
  products: Product[];
  genderFilter: GenderCategory;
  setGenderFilter: (g: GenderCategory) => void;
  selectedCategory: WatchStyle;
  setSelectedCategory: (c: WatchStyle) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeProduct: Product;
  setActiveProduct: (p: Product) => void;
  selectProductById: (id: string, openModal?: boolean) => void;
  isQuickViewOpen: boolean;
  setIsQuickViewOpen: (open: boolean) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, size?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotalINR: number;

  // Chat Agent
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  chatMessages: ChatMessage[];
  sendMessage: (text: string, productContext?: Product) => void;
  isAgentTyping: boolean;

  // Exit Intent Observer
  isExitIntentOpen: boolean;
  setIsExitIntentOpen: (open: boolean) => void;
  currentPitch: PitchEvent | null;
  triggerExitIntent: (product?: Product, reason?: 'exit_intent' | 'idle_dwell' | 'cart_hesitation') => void;
  claimOfferCode: (code: string) => void;
  removeDiscount: () => void;
  appliedDiscount: { code: string; percent: number } | null;

  // Checkout Modal
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  completeCheckout: (details?: {
    customerName?: string;
    email?: string;
    city?: string;
    paymentMethod?: PaymentMethod;
    cardNumber?: string;
    expiry?: string;
    cvc?: string;
    upiId?: string;
    phoneNumber?: string;
  }) => Promise<{
    success: boolean;
    orderId: string;
    invoiceNumber?: string;
    paymentMethod?: string;
    paymentDetails?: any;
    error?: string;
  }>;

  // Merchant Analytics
  merchantStats: MerchantStats;
  pitchEvents: PitchEvent[];

  // User Role Mode (Customer vs Admin / Merchant)
  userRole: 'customer' | 'admin';
  setUserRole: (role: 'customer' | 'admin') => void;
  toggleUserRole: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'agent',
    agentType: 'concierge',
    text: "Welcome to Mono Time Concierge. I am your dedicated horology consultant. I can assist you with case proportions, wrist drape and sizing calculations, occasion styling, or recommendations across our curated collections.",
    timestamp: 'Just now',
    suggestedPrompts: [
      "What watches look best on smaller wrists?",
      "Will the 40mm Titan Edge fit a 6.5-inch wrist?",
      "Which watch pairs best with a tailored navy suit?",
    ],
  },
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [genderFilter, setGenderFilter] = useState<GenderCategory>('all');
  const [selectedCategory, setSelectedCategory] = useState<WatchStyle>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProduct, setActiveProduct] = useState<Product>(PRODUCTS[0]);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState<boolean>(false);

  // Dynamic hero switcher according to gender filter
  const handleSetGenderFilter = (newGender: GenderCategory) => {
    setGenderFilter(newGender);
    if (newGender === 'men') {
      const menWatch = products.find((p) => p.gender === 'men') || PRODUCTS[0];
      setActiveProduct(menWatch);
    } else if (newGender === 'women') {
      const womenWatch = products.find((p) => p.gender === 'women') || PRODUCTS[5];
      setActiveProduct(womenWatch);
    }
  };

  const selectProductById = (id: string, openModal: boolean = true) => {
    const found =
      products.find((p) => p.id === id) ||
      products.find((p) => p.title.toLowerCase().includes(id.toLowerCase())) ||
      PRODUCTS.find((p) => p.id === id || p.title.toLowerCase().includes(id.toLowerCase()));

    if (found) {
      setActiveProduct(found);
      if (found.gender === 'men' && genderFilter === 'women') {
        setGenderFilter('all');
      } else if (found.gender === 'women' && genderFilter === 'men') {
        setGenderFilter('all');
      }
      if (openModal) {
        setIsQuickViewOpen(true);
      }
    }
  };

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);

  // Chat
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isAgentTyping, setIsAgentTyping] = useState<boolean>(false);

  // Exit Intent
  const [isExitIntentOpen, setIsExitIntentOpen] = useState<boolean>(false);
  const [hasTriggeredExit, setHasTriggeredExit] = useState<boolean>(false);
  const [currentPitch, setCurrentPitch] = useState<PitchEvent | null>(null);

  // Role Mode: Customer vs Admin / Merchant
  const [userRole, setUserRoleState] = useState<'customer' | 'admin'>('customer');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mono_time_user_role');
      if (saved === 'admin' || saved === 'customer') {
        setUserRoleState(saved);
      }
      if (typeof window !== 'undefined') {
        const chatParam = new URLSearchParams(window.location.search).get('chat');
        if (chatParam === 'open') {
          setIsChatOpen(true);
        }
      }
    } catch {}
  }, []);

  const setUserRole = (role: 'customer' | 'admin') => {
    setUserRoleState(role);
    try {
      localStorage.setItem('mono_time_user_role', role);
    } catch {}
  };

  const toggleUserRole = () => {
    setUserRole(userRole === 'customer' ? 'admin' : 'customer');
  };

  // Checkout
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  // Merchant Analytics Seed Data
  const [pitchEvents, setPitchEvents] = useState<PitchEvent[]>([
    {
      id: 'pe-101',
      timestamp: '28m ago',
      productId: 'titan-edge-slate',
      productName: 'Titan Edge Minimalist Slate Steel',
      gender: 'men',
      triggerType: 'exit_intent',
      offer: '10% Mono Time Privilege Voucher',
      code: 'MONOTIME10',
      clicked: true,
      converted: true,
    },
    {
      id: 'pe-102',
      timestamp: '1h 12m ago',
      productId: 'titan-raga-flora',
      productName: 'Titan Raga Flora Sculpted Bangle Watch',
      gender: 'women',
      triggerType: 'idle_dwell',
      offer: 'Complimentary Velvet Travel Pouch',
      code: 'RAGAJEWEL',
      clicked: true,
      converted: false,
    },
    {
      id: 'pe-103',
      timestamp: '2h 45m ago',
      productId: 'casio-edifice-speed',
      productName: 'Casio Edifice Solar Speed Chronograph',
      gender: 'men',
      triggerType: 'exit_intent',
      offer: 'Free Express Shipping + 10% Discount',
      code: 'EDIFICE10',
      clicked: false,
      converted: false,
    },
  ]);

  const [merchantStats, setMerchantStats] = useState<MerchantStats>({
    totalSessions: 184,
    pitchesTriggered: 29,
    pitchesClicked: 14,
    cartsRecovered: 6,
    recoveredRevenueINR: 137990,
    conversionRatePercent: 20.7,
    ctrPercent: 48.3,
  });

  // Sync with FastAPI backend on initial mount
  useEffect(() => {
    async function syncBackendData() {
      const backendProducts = await fetchProductsApi();
      if (backendProducts && backendProducts.length > 0) {
        setProducts(backendProducts);
      }
      const stats = await fetchMerchantAnalyticsApi();
      if (stats) {
        setMerchantStats(stats);
      }
      const pitches = await fetchMerchantPitchesApi();
      if (pitches && pitches.length > 0) {
        setPitchEvents(pitches);
      }
    }
    syncBackendData();
  }, []);

  // Cart Helpers
  const addToCart = (product: Product, size: string = 'Standard (Adjustable)') => {
    if (product.inStock === false) {
      alert(`"${product.title}" is currently out of stock or reserved for waitlist.`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.selectedWristSize === size);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.selectedWristSize === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedWristSize: size }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: qty } : item))
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.priceINR * item.quantity, 0);
  const cartTotalINR = appliedDiscount
    ? Math.round(cartSubtotal * (1 - appliedDiscount.percent / 100))
    : cartSubtotal;

  // Exit Intent Trigger Logic
  const triggerExitIntent = async (
    product: Product = activeProduct,
    reason: 'exit_intent' | 'idle_dwell' | 'cart_hesitation' = 'exit_intent'
  ) => {
    if (hasTriggeredExit) return;
    setHasTriggeredExit(true);

    // Call FastAPI Observer
    const apiPitch = await checkExitIntentApi(product.id, 10, 130, reason);

    const newPitch: PitchEvent = apiPitch || {
      id: `pe-${Date.now()}`,
      timestamp: 'Just now',
      productId: product.id,
      productName: product.title,
      gender: product.gender,
      triggerType: reason,
      offer: '10% Mono Time Privilege Savings + Free Stainless Sizing Tool',
      code: 'MONOTIME10',
      clicked: false,
      converted: false,
    };

    setCurrentPitch(newPitch);
    setIsExitIntentOpen(true);

    // Update merchant stats
    setPitchEvents((prev) => [newPitch, ...prev.filter((p) => p.id !== newPitch.id)]);
    setMerchantStats((prev) => ({
      ...prev,
      pitchesTriggered: prev.pitchesTriggered + 1,
      ctrPercent: Math.round(((prev.pitchesClicked) / (prev.pitchesTriggered + 1)) * 100),
    }));
  };

  const claimOfferCode = async (code: string) => {
    setAppliedDiscount({ code, percent: 10 });
    setIsExitIntentOpen(false);

    if (currentPitch) {
      await claimPitchOfferApi(currentPitch.id, code);

      setPitchEvents((prev) =>
        prev.map((p) => (p.id === currentPitch.id ? { ...p, clicked: true } : p))
      );
      setMerchantStats((prev) => ({
        ...prev,
        pitchesClicked: prev.pitchesClicked + 1,
        ctrPercent: Math.round(((prev.pitchesClicked + 1) / prev.pitchesTriggered) * 100),
      }));
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
  };

  const completeCheckout = async (details?: {
    customerName?: string;
    email?: string;
    city?: string;
    paymentMethod?: PaymentMethod;
    cardNumber?: string;
    expiry?: string;
    cvc?: string;
    upiId?: string;
    phoneNumber?: string;
  }): Promise<{
    success: boolean;
    orderId: string;
    invoiceNumber?: string;
    paymentMethod?: string;
    paymentDetails?: any;
    error?: string;
  }> => {
    if (cart.length === 0) return { success: false, orderId: '', error: 'Cart is empty.' };

    // Stock check: Ensure none of the cart items are out of stock
    const outOfStockItem = cart.find((item) => item.product.inStock === false);
    if (outOfStockItem) {
      return {
        success: false,
        orderId: '',
        error: `Item "${outOfStockItem.product.title}" is currently out of stock. Please remove it from your cart to proceed.`,
      };
    }

    // Log recovery conversion
    const recoveredAmount = cartTotalINR;
    setMerchantStats((prev) => ({
      ...prev,
      cartsRecovered: prev.cartsRecovered + 1,
      recoveredRevenueINR: prev.recoveredRevenueINR + recoveredAmount,
      conversionRatePercent: Math.round(((prev.cartsRecovered + 1) / prev.pitchesTriggered) * 100),
    }));

    if (currentPitch) {
      setPitchEvents((prev) =>
        prev.map((p) => (p.id === currentPitch.id ? { ...p, converted: true } : p))
      );
    }

    // Prepare full item list for backend database reflection
    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      productTitle: item.product.title,
      brand: item.product.brand,
      quantity: item.quantity,
      priceINR: item.product.priceINR,
      image: item.product.image,
    }));

    // Intentional decline card check
    const cardClean = (details?.cardNumber || '').replace(/[\s•]/g, '');
    if (cardClean === '4000000000000002') {
      return {
        success: false,
        orderId: '',
        error: 'Your card was declined. Please use standard mock card 4242 4242 4242 4242.',
      };
    }

    let finalOrderId = `ORD-${Date.now().toString().slice(-6)}`;
    let finalInvoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${finalOrderId.split('-').pop()}`;
    let finalPaymentMethod = details?.paymentMethod || 'card';
    let finalPaymentDetails: any = {
      method: finalPaymentMethod,
      timestamp: new Date().toISOString(),
      card_last4: (details?.cardNumber || '4242').slice(-4),
      gateway: 'Stripe 3D-Secure Mock Sandbox',
      transaction_ref: `ch_mock_${Math.random().toString(36).substring(2, 14)}`,
    };

    // Call checkout confirmation API on backend to persist order in database
    try {
      const apiResult = await confirmCheckoutApi({
        amountINR: recoveredAmount,
        paymentMethod: details?.paymentMethod || 'card',
        customerName: details?.customerName || 'Anurag Sharma',
        customerEmail: details?.email || 'anurag@monotime.com',
        shippingCity: details?.city || 'New Delhi, India',
        cardNumber: details?.cardNumber || '4242424242424242',
        expiry: details?.expiry || '12/28',
        cvc: details?.cvc || '888',
        upiId: details?.upiId,
        phoneNumber: details?.phoneNumber,
        discountCode: appliedDiscount?.code,
        discountPercent: appliedDiscount?.percent || 0,
        items: orderItems,
      });

      if (apiResult && apiResult.orderId) {
        finalOrderId = apiResult.orderId;
        finalInvoiceNumber = apiResult.invoiceNumber || finalInvoiceNumber;
        finalPaymentMethod = (apiResult.paymentMethod as PaymentMethod) || finalPaymentMethod;
        finalPaymentDetails = apiResult.paymentDetails || finalPaymentDetails;
      }
    } catch (err: any) {
      // Respect explicit rejection from backend (such as out-of-stock items or declined card)
      if (err.message && (err.message.includes('declined') || err.message.includes('out of stock'))) {
        return {
          success: false,
          orderId: '',
          error: err.message,
        };
      }
      // If backend is offline or on a serverless deployment without separate Python backend, complete simulation smoothly
      console.warn('Backend order recording unavailable, completing in client simulation mode:', err);
    }

    clearCart();
    return {
      success: true,
      orderId: finalOrderId,
      invoiceNumber: finalInvoiceNumber,
      paymentMethod: finalPaymentMethod,
      paymentDetails: finalPaymentDetails,
    };
  };

  // Agent Intent Classifier & Multimodal Routing
  const sendMessage = async (text: string, productContext?: Product) => {
    const currentProduct = productContext || activeProduct || PRODUCTS[0];
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAgentTyping(true);

    try {
      // 1. Call FastAPI Gemini Agent Endpoint
      const apiResult = await sendChatMessageApi(text, currentProduct?.id);

      if (apiResult && apiResult.text) {
        const agentMsg: ChatMessage = {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          agentType: apiResult.agentType,
          text: apiResult.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          productCard: undefined,
          suggestedPrompts: apiResult.suggestedPrompts,
          sources: apiResult.sources || (currentProduct ? [`Spec sheet: ${currentProduct.title}`] : []),
        };
        setChatMessages((prev) => [...prev, agentMsg]);
        setIsAgentTyping(false);
        return;
      }
    } catch (apiErr) {
      console.warn('API error occurred, activating local horology engine:', apiErr);
    }

    // 2. Guaranteed Client-Side Horology Reasoning Engine
    try {
      const lower = text.toLowerCase();
      let responseText = '';
      let agentType: 'supervisor' | 'stylist' | 'rag' | 'concierge' = 'concierge';
      let attachedProduct: Product | undefined = undefined;
      let suggestedPrompts: string[] = [];

      // A. Order Tracking & Delivery Status
      if (lower.includes('track') || (lower.includes('order') && !lower.includes('order today'))) {
        agentType = 'concierge';
        responseText = `**Mono Time Order Tracking & Logistics Concierge:**\n\n• **Express Insured Transit**: All orders are dispatched within 24 hours via temperature-regulated, tamper-evident insured courier with signature confirmation.\n• **Track Your Parcel**: To look up real-time transit coordinates, please provide your **6-digit Order Reference Number** (sent via email/SMS upon acquisition) or your registered email address.\n• **Transit Times**: Indian metro areas arrive within **24–48 hours**; global destinations within **3–5 business days**.\n• **Direct Dispatch Desk**: Call Toll-Free **1800-266-8463** (or **+91 98200 66684**) or email **tracking@monotime.com** anytime.`;
        suggestedPrompts = [
          "How do I request complimentary bracelet sizing?",
          "What is the return policy?",
          "Apply promo code MONOTIME10",
        ];
      }
      // B. Complimentary Bracelet Sizing Before Shipping
      else if (lower.includes('sizing service') || lower.includes('strap adjustment') || lower.includes('adjust links') || lower.includes('remove links') || lower.includes('before shipping')) {
        agentType = 'stylist';
        responseText = `**Complimentary Pre-Dispatch Sizing Service:**\n\n• **Bespoke Wrist Tailoring**: Mono Time's certified master watchmakers custom-tailor steel bracelets and leather straps to your exact wrist circumference before your order departs our vault.\n• **How to Specify**: Simply enter your wrist measurement (e.g. *6.5 inches* or *16.5 cm*) in checkout notes, or tell our concierge here in chat.\n• **Preserved Links**: All removed links are packaged inside your luxury presentation box alongside an adjustment tool.\n• **Expansion Guarantee**: If you need extra room, up to two factory expansion links are provided free of charge.`;
        suggestedPrompts = [
          "Will a 40mm watch fit a 6.5-inch wrist?",
          "What is the return policy if sizing is off?",
          "Proceed to secure checkout",
        ];
      }
      // C. 2-Year Global Warranty & Authenticity
      else if (lower.includes('warranty') || lower.includes('guarantee') || (lower.includes('covered') && lower.includes('year'))) {
        agentType = 'rag';
        responseText = `**Mono Time 2-Year Global Manufacturer Warranty:**\n\n• **Full Movement Coverage**: Covers mechanical movement regulation, quartz calibres, crystal gaskets, dial hands, and factory manufacturing defects for 2 full years.\n• **Certificate of Authenticity**: Each timepiece is delivered with a serialized, tamper-proof Certificate of Authenticity.\n• **Authorized Servicing**: Servicing can be conducted at authorized manufacturer workshops or through Mono Time's master watchmaker network.`;
        suggestedPrompts = [
          "How does Mono Time verify authenticity?",
          "What is your return policy?",
          "Contact our certified watchmaker network",
        ];
      }
      // D. Return Policy & 14-Day Global Return Portal
      else if (lower.includes('return') || lower.includes('exchange') || lower.includes('refund')) {
        agentType = 'concierge';
        responseText = `**Mono Time 14-Day Insured Return & Exchange Portal:**\n\n• **14-Day Evaluation Window**: If the case proportions, dial aesthetic, or wrist drape do not delight you, you may initiate a return or exchange within 14 days of receipt.\n• **Complimentary Doorstep Pickup**: We arrange an insured express courier to collect the parcel from your home or office at zero charge.\n• **Zero Restocking Fees**: 100% full refund processed within 48 hours of verification by our horologists.\n• **Requirement**: Pieces must be unworn with original protective film and documentation intact.`;
        suggestedPrompts = [
          "Track an existing order",
          "Request complimentary bracelet sizing",
          "Apply discount code MONOTIME10",
        ];
      }
      // E. Authenticity Verification
      else if (lower.includes('authenticity') || lower.includes('authentic') || lower.includes('genuine') || lower.includes('verify')) {
        agentType = 'rag';
        responseText = `**Mono Time 100% Authenticity Guarantee:**\n\n• **Direct Lineage**: Every reference is sourced directly from brand manufactures (Titan, Casio, Timex, Fossil, Aethelgard) or accredited distributor vaults.\n• **12-Point Inspection**: Master horologists inspect each piece under 10x magnification—verifying movement amplitude, dial hand alignment, crystal laser-etchings, and serial number registration.\n• **Digital Verification**: Each purchase includes an NFC/QR serialized Certificate of Authenticity registered in our client database.`;
        suggestedPrompts = [
          "What is covered under the 2-year warranty?",
          "Tell me about the Mono Time 3D luxury watch",
          "Apply voucher code MONOTIME10",
        ];
      }
      // F. Haute Horology Care, Cleaning & Demagnetization
      else if (lower.includes('care') || lower.includes('clean') || lower.includes('demagnetiz') || lower.includes('magnet')) {
        agentType = 'rag';
        responseText = `**Haute Horology Care & Maintenance Protocol:**\n\n• **Daily Cleaning**: Wipe crystal and case surfaces with a soft microfiber cloth. For 5 ATM+ steel bracelets, use lukewarm water and mild non-detergent soap, followed by air drying.\n• **Demagnetization**: Avoid magnetic fields from smartphones, laptop speakers, iPad folios, and induction stovetops (>4,800 A/m). If a mechanical watch runs minutes fast per day, Mono Time offers complimentary demagnetization.\n• **Crown & Pushers**: Never actuate pushers or unscrew crowns when submerged. Gaskets should be pressure-tested every 24 months.\n• **Service Interval**: Mechanical movements should be serviced and lubricated every 4 to 5 years.`;
        suggestedPrompts = [
          "Tell me about the Timex Mechanical Movement",
          "What warranty is provided?",
          "Find authorized service centers",
        ];
      }
      // G. Data Privacy & Secure Transactions
      else if (lower.includes('privacy') || lower.includes('security') || lower.includes('secure transaction') || lower.includes('payment')) {
        agentType = 'concierge';
        responseText = `**Mono Time Client Privacy & Security Standards:**\n\n• **256-Bit SSL Encryption**: All sessions and checkout interactions are encrypted using bank-grade protocols.\n• **Tokenized Payment Rails**: Credit card and payment details are processed directly through Stripe 3D Secure 2.0 and never stored on our servers.\n• **Zero Data Selling**: We strictly safeguard your privacy and never sell or distribute your client information to third parties.`;
        suggestedPrompts = [
          "What is the return policy?",
          "Apply promo code MONOTIME10",
          "Proceed to checkout",
        ];
      }
      // H. Certified Watchmaker Network
      else if (lower.includes('watchmaker network') || lower.includes('service center') || lower.includes('repair') || lower.includes('overhaul')) {
        agentType = 'rag';
        responseText = `**Mono Time Certified Watchmaker Network:**\n\n• **WOSTEP & AWCI Certified Horologists**: Our international servicing network comprises master horologists specializing in Swiss, Japanese, and German movements.\n• **Clean-Room Workshops**: Equipped with Bergeon clean-room benches, Witschi rate analyzers, and high-pressure wet/dry testing chambers.\n• **Transparent Estimates**: All warranty interventions are complimentary; out-of-warranty services receive a full written estimate prior to work.`;
        suggestedPrompts = [
          "Check 2-year warranty details",
          "How to care for mechanical watches",
          "Call concierge hotline: 1800-266-8463 (India)",
        ];
      }
      // I1. 3D Classic Luxury Chronometer & Tourbillon Model
      else if (lower.includes('3d') || lower.includes('model') || lower.includes('tourbillon') || lower.includes('fluted') || lower.includes('chronometer')) {
        agentType = 'rag';
        responseText = `**Mono Time Classic Luxury 3D Chronometer:**\n\n• **Haute Horology Architecture**: Rendered in real-time 3D with a mirror-polished 316L platinum-steel case, 72-facet diamond-cut 18K champagne gold fluted bezel, and an authentic 5-link Jubilee bracelet.\n• **Malachite-Noir Sunburst Dial**: Embellished with 120 radial guilloché lathe rays, 3D applied faceted gold baton indices with luminous tritium inlays, and a beveled date aperture at 3 o'clock.\n• **Mechanical Complications**: Features an openwork tourbillon escapement cage oscillating at 28,800 vph with a ruby pivot jewel, accompanied by blued steel screws and real-time sweeping mechanical hands synced to local time.`;
        suggestedPrompts = [
          "Which watch pairs best with a black-tie suit?",
          "Show me classic dress watches",
          "Apply voucher code MONOTIME10",
        ];
      }
      // I2. Casio Heritage Models
      else if (lower.includes('casio') || lower.includes('retro') || lower.includes('vintage') || lower.includes('digital') || lower.includes('alarm') || lower.includes('a158') || lower.includes('a168')) {
        agentType = 'rag';
        const casioWatch = PRODUCTS.find((p) => p.brand === 'Casio') || PRODUCTS[1];
        attachedProduct = casioWatch;
        responseText = `**Casio Horology & Precision Heritage:**\n\n• **Premier Casio References**: Our catalog features the **Casio Edifice Solar Speed Chrono** (₹16,495: sapphire crystal, solar charging, high-accuracy chronograph module) and the **Casio Sheen Tonneau Gold** (₹14,995: tonneau jewelry case with Swarovski crystal hour markers for women).\n• **Authenticity & Warranty**: All Casio timepieces include original manufacturer warranty documentation and serialized Certificate of Authenticity.`;
        suggestedPrompts = [
          "Show Casio Edifice Solar Chrono details",
          "Show Casio Sheen Tonneau Gold for women",
          "Apply code MONOTIME10",
        ];
      }
      // J. Timex Waterbury Heritage
      else if (lower.includes('timex') || lower.includes('waterbury') || lower.includes('mechanical') || lower.includes('hand-wound')) {
        agentType = 'rag';
        const timexWatch = PRODUCTS.find((p) => p.brand === 'Timex') || PRODUCTS[2];
        attachedProduct = timexWatch;
        responseText = `**Timex Waterbury Heritage Hand-Winding Mechanical (₹14,995):**\n\n• **Tactile Vintage Horology**: Powered by a 21-jewel mechanical hand-wound calibre requiring no battery—celebrating the classic daily winding ritual.\n• **Vintage Aesthetics**: 38 mm stainless steel case, box-section domed acrylic crystal, exhibition mineral caseback, and cognac Horween leather strap.\n• **Fit Range**: Optimal for wrists from 6.0\" to 7.6\".`;
        suggestedPrompts = [
          "Will the 38mm Timex fit a 6.5-inch wrist?",
          "How does mechanical hand-winding work?",
          "Apply voucher code MONOTIME10",
        ];
      }
      // K. Titan Edge & Raga
      else if (lower.includes('titan') || lower.includes('edge') || lower.includes('raga')) {
        if (lower.includes('raga') || lower.includes('women') || lower.includes('flora') || lower.includes('bangle')) {
          agentType = 'stylist';
          const ragaWatch = PRODUCTS.find((p) => p.title.includes('Raga')) || PRODUCTS[5];
          attachedProduct = ragaWatch;
          responseText = `**Titan Raga Flora Crystal Bangle (₹18,995):**\n\n• **Jewelry Horology**: Features a natural mother-of-pearl iridescent dial surrounded by handset Swarovski crystal petals.\n• **Open-Cuff Bangle**: Asymmetrical jewelry silhouette in warm champagne gold finish.\n• **Occasions**: The premier selection for weddings, festive galas, and cocktail receptions.`;
          suggestedPrompts = [
            "Is the Titan Raga bangle adjustable?",
            "Show other Women's jewelry watches",
            "Apply MONOTIME10 voucher code",
          ];
        } else {
          agentType = 'stylist';
          const edgeWatch = PRODUCTS.find((p) => p.title.includes('Edge')) || PRODUCTS[0];
          attachedProduct = edgeWatch;
          responseText = `**Titan Edge Minimalist Slate Steel (₹24,999):**\n\n• **Ultra-Slim Engineering**: Measuring a razor-thin **7.2 mm** in solid 316L stainless steel.\n• **Dial & Crystal**: Monochromatic anthracite sunray dial with scratch-resistant sapphire crystal.\n• **Executive Presence**: Slides effortlessly under bespoke French shirt cuffs with zero bulk.`;
          suggestedPrompts = [
            "Will the 40mm Titan Edge fit a 6.5-inch wrist?",
            "Compare with the Casio Edifice Chronograph",
            "Apply code MONOTIME10",
          ];
        }
      }
      // L. Attire, Suits & Sartorial Guidance
      else if (lower.includes('suit') || lower.includes('formal') || lower.includes('tuxedo') || lower.includes('black-tie') || lower.includes('black tie') || lower.includes('wear') || lower.includes('wedding')) {
        agentType = 'stylist';
        attachedProduct = PRODUCTS[0];
        responseText = `**Sartorial Horology Guidance from Mono Time:**\n\n• **Black-Tie / Tuxedo**: Traditional etiquette calls for extreme understatement. An ultra-slim dress watch like the **Titan Edge Slate Steel** (7.2 mm) or **Timex Waterbury Heritage** on leather is ideal—never bulky sports divers.\n• **Navy & Charcoal Business Suits**: The clean anthracite dial and polished chamfers of 316L steel dress pieces offer sharp executive distinction.\n• **Cuff Clearance Rule**: The watch case must effortlessly slide beneath stiff cuffs without bunching your shirting.\n• **Evening Galas (Women)**: The **Titan Raga Flora** or **Casio Sheen Tonneau** harmonizes with gold jewelry and evening silks.`;
        suggestedPrompts = [
          "Show Titan Edge Minimalist Slate Steel",
          "Show Timex Waterbury Vintage",
          "Apply discount voucher MONOTIME10",
        ];
      }
      // M1. Smaller / Petite / Slender Wrist Recommendations
      else if (
        lower.includes('smaller wrist') ||
        lower.includes('small wrist') ||
        lower.includes('petite wrist') ||
        lower.includes('slender wrist') ||
        lower.includes('thin wrist') ||
        (lower.includes('small') && lower.includes('wrist') && !lower.includes('will this'))
      ) {
        agentType = 'stylist';
        attachedProduct = undefined;
        responseText = `**Recommended Timepieces for Smaller & Slender Wrists:**\n\nFor wrists under 6.5″ (16.5 cm), watches with case diameters between **28 mm and 38 mm** and lug-to-lug spans **under 44 mm** look best, as they sit comfortably within the flat top of your wrist without lug overhang.\n\nHere are premier references from Mono Time tailored for smaller wrists:\n\n• **Timex Waterbury Heritage Mechanical** (38 mm · 44 mm lug-to-lug · ₹14,995)\n  Classic vintage diameter with curved downward lugs and supple Horween leather that wraps naturally around leaner wrists.\n\n• **Casio Vintage A168 Retro Chrome** (36 mm · 38.6 mm lug-to-lug · ₹4,295)\n  Compact retro case with an easily adjustable sliding steel clasp—an effortless fit on slender wrists.\n\n• **Titan Edge Minimalist Slate Steel** (40 mm · 46.5 mm lug-to-lug · ₹24,999)\n  Although 40 mm, its razor-thin **7.2 mm profile** and low-mass architecture drape completely flat, wearing like a 37 mm piece.\n\n• **Fossil Jacqueline Blush Leather** (34 mm · 38 mm lug-to-lug · ₹11,995)\n  Refined 34 mm diameter with an 8 mm profile and soft Italian leather for elegant, understated presence.\n\n• **Aurora Petite Milanese Mesh** (32 mm · 36 mm lug-to-lug · ₹15,495)\n  Ultra-svelte 6.5 mm Scandinavian silhouette with micro-adjustable rose gold mesh.\n\n*(Tip: Specify your wrist measurement at checkout for complimentary bespoke bracelet sizing before dispatch.)*`;
        suggestedPrompts = [
          "Will the 38mm Timex Waterbury fit my wrist?",
          "Show Titan Edge Minimalist Slate Steel",
          "How do I request complimentary bracelet sizing?",
        ];
      }
      // M2. Larger / Broad Wrist Recommendations
      else if (
        lower.includes('larger wrist') ||
        lower.includes('large wrist') ||
        lower.includes('broad wrist') ||
        lower.includes('wide wrist') ||
        lower.includes('big wrist')
      ) {
        agentType = 'stylist';
        attachedProduct = undefined;
        responseText = `**Recommended Timepieces for Broader Wrists (7.0″+):**\n\nFor wrists measuring 7 inches (17.8 cm) or broader, substantial case diameters between **41 mm and 44 mm** with lug-to-lug spans of 48 mm to 50 mm achieve commanding, balanced proportions.\n\n• **Casio Edifice Solar Speed Chronograph** (44 mm · 49 mm lug-to-lug · ₹16,495)\n  Motorsport-inspired presence with integrated steel bracelet and 100-meter water resistance.\n\n• **Oceanic Pro Diver 300M Automatic** (42 mm · 49.5 mm lug-to-lug · ₹29,995)\n  Professional dive architecture with substantial 13.2 mm case thickness and diver extension clasp.\n\n• **Fossil Neutra Roman Chronograph** (42 mm · 48 mm lug-to-lug · ₹13,495)\n  Architectural gunmetal case with Roman numeral indices and rich saddle leather strap.\n\n*(Complimentary expansion links are included upon request for broader wrist drapes.)*`;
        suggestedPrompts = [
          "Show Casio Edifice Solar Chrono details",
          "Show Oceanic Pro Diver 300M",
          "Apply code MONOTIME10",
        ];
      }
      // M3. Wrist Proportions, Fit & Specific Dimension Checks
      else if (lower.includes('size') || lower.includes('wrist') || lower.includes('fit') || lower.includes('diameter') || lower.includes('mm') || lower.includes('inches')) {
        agentType = 'stylist';
        attachedProduct = currentProduct;
        const watchTitle = currentProduct?.title || 'Titan Edge Minimalist';
        const lug = currentProduct?.specs?.lugToLug || '46.5 mm';
        const diam = currentProduct?.specs?.caseDiameter || '40 mm';
        const thick = currentProduct?.specs?.caseThickness || '7.2 mm';
        responseText = `**Mono Time Proportional Wrist Fit Analysis for ${watchTitle}:**\n\n• **Anatomical Golden Ratio**: For an average 6.5-inch wrist, the flat top surface spans approximately **52 mm to 55 mm** across the carpal bones.\n• **Lug-to-Lug Geometry**: With a case diameter of ${diam} and a lug-to-lug distance of **${lug}**, this watch leaves comfortable border clearance on wrists 6.2″ and larger—ensuring **zero overhang**.\n• **Cuff Drape**: At ${thick} in thickness, the profile glides effortlessly under tailored cuffs without bunching.\n• **Complimentary Link Sizing**: Specify your wrist measurement at checkout and our watchmakers will size the bracelet before insured shipping.`;
        suggestedPrompts = [
          "How do I request complimentary bracelet sizing?",
          "What watches look best on smaller wrists?",
          "Apply code MONOTIME10",
        ];
      }
      // N. Discounts & Vouchers
      else if (lower.includes('discount') || lower.includes('coupon') || lower.includes('code') || lower.includes('offer') || lower.includes('voucher') || lower.includes('deal')) {
        agentType = 'concierge';
        responseText = `**Exclusive Privilege for Mono Time Clients:**\n\n• **Active Voucher Code**: Use **MONOTIME10** at checkout to unlock an immediate **10% discount** across our entire timepiece catalogue.\n• **Included Privileges**: Every order includes complimentary insured priority shipping, a serialized Certificate of Authenticity, and our 14-day global exchange guarantee.\n• **How to Redeem**: Enter **MONOTIME10** in the shopping bag drawer or during final checkout.`;
        suggestedPrompts = [
          "Open Shopping Bag",
          "Proceed to instant checkout",
          "Explore featured watches",
        ];
      }
      // O. General Greeting
      else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('who are you') || lower.includes('mono time')) {
        agentType = 'concierge';
        responseText = `Greetings and welcome to **Mono Time**. I am your dedicated AI Horology Concierge.\n\nI can assist you with:\n• **Wrist Proportions & Sizing**: Calculating case diameter and lug-to-lug drape for your wrist.\n• **Sartorial Styling**: Pairing watches with bespoke suits, black-tie attire, or casual wear.\n• **Horological Inquiries**: Mechanical calibres, fluted bezels, tourbillon escapements, or our live 3D luxury chronometer.\n• **Client Services**: Order tracking, 2-Year International Warranty, complimentary bracelet sizing, and returns.\n\nWhat style, occasion, or reference can I explore with you today?`;
        suggestedPrompts = [
          "Tell me about the Mono Time 3D luxury watch",
          "Which watch pairs best with a navy suit?",
          "Will a 40mm watch fit a 6.5-inch wrist?",
        ];
      }
      // P. Default Open-Ended Concierge Response
      else {
        agentType = 'concierge';
        responseText = `Thank you for contacting **Mono Time Concierge**.\n\nRegarding your inquiry ('*${text}*'): our curated collection features premier references from **Titan**, **Casio**, **Timex**, **Fossil**, and **Aethelgard**.\n\n• Every timepiece includes our **2-Year Global Warranty**, serialized Certificate of Authenticity, and complimentary pre-dispatch bracelet sizing.\n• You can apply voucher code **MONOTIME10** to enjoy 10% off with complimentary insured delivery.\n\nWould you like me to inspect wrist sizing, occasion styling combinations, or track an existing order?`;
        suggestedPrompts = [
          "Will a 40mm watch fit my wrist?",
          "Show me classic dress watches for formal suits",
          "Apply code MONOTIME10",
        ];
      }

      let fallbackSources: string[] = [];
      if (currentProduct) {
        fallbackSources.push(`Spec sheet: ${currentProduct.title}`);
      }
      if (lower.includes('return') || lower.includes('refund')) {
        fallbackSources.push('14-Day Insured Return Policy');
      } else if (lower.includes('warranty')) {
        fallbackSources.push('2-Year International Warranty Terms');
      } else if (lower.includes('track') || lower.includes('order')) {
        fallbackSources.push('Logistics & Insured Transit Policy');
      } else if (lower.includes('sizing') || lower.includes('wrist')) {
        fallbackSources.push('Bespoke Sizing & Atelier Guide');
      }

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        agentType,
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        productCard: undefined,
        suggestedPrompts,
        sources: fallbackSources.length > 0 ? fallbackSources : ['Mono Time Atelier Reference Document'],
      };

      setChatMessages((prev) => [...prev, agentMsg]);
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          agentType: 'supervisor',
          text: `Welcome to Mono Time. All timepieces include complimentary insured delivery, certificate of authenticity, and 10% off with voucher code MONOTIME10.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          productCard: undefined,
          suggestedPrompts: ["Check wrist fit guide", "Show men's collection", "Apply code MONOTIME10"],
        },
      ]);
    } finally {
      setIsAgentTyping(false);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        genderFilter,
        setGenderFilter: handleSetGenderFilter,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        activeProduct,
        setActiveProduct,
        selectProductById,
        isQuickViewOpen,
        setIsQuickViewOpen,

        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotalINR,

        isChatOpen,
        setIsChatOpen,
        chatMessages,
        sendMessage,
        isAgentTyping,

        isExitIntentOpen,
        setIsExitIntentOpen,
        currentPitch,
        triggerExitIntent,
        claimOfferCode,
        removeDiscount,
        appliedDiscount,

        isCheckoutOpen,
        setIsCheckoutOpen,
        completeCheckout,

        merchantStats,
        pitchEvents,

        userRole,
        setUserRole,
        toggleUserRole,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
