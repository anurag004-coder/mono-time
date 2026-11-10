export type GenderCategory = 'all' | 'men' | 'women';

export type WatchStyle = 'All' | 'Dress' | 'Chronograph' | 'Minimalist' | 'Jewelry' | 'Diver' | 'Vintage';

export interface WatchSpecs {
  caseDiameter: string;
  caseThickness: string;
  waterResistance: string;
  movement: string;
  dialColor: string;
  strapMaterial: string;
  glass: string;
  clasp: string;
  warranty: string;
  lugToLug?: string;
}

export interface FitRecommendation {
  recommendedWristMin: number; // in inches
  recommendedWristMax: number;
  fitNotes: string;
}

export interface Product {
  id: string;
  title: string;
  brand: 'Titan' | 'Casio' | 'Timex' | 'Fossil' | 'Aethelgard';
  gender: 'men' | 'women';
  category: WatchStyle;
  priceINR: number;
  priceUSD: number;
  originalPriceINR?: number;
  image: string;
  badge?: string;
  tagline: string;
  description: string;
  shortSpecs: string[];
  specs: WatchSpecs;
  fitRecommendation: FitRecommendation;
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  isHero?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedWristSize: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agentType?: 'supervisor' | 'stylist' | 'rag' | 'observer' | 'concierge';
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
  productCard?: Product;
  confidenceScore?: number;
  sources?: string[];
}

export interface PitchEvent {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  gender: 'men' | 'women';
  triggerType: 'exit_intent' | 'idle_dwell' | 'cart_hesitation';
  offer: string;
  code: string;
  clicked: boolean;
  converted: boolean;
}

export interface MerchantStats {
  totalSessions: number;
  pitchesTriggered: number;
  pitchesClicked: number;
  cartsRecovered: number;
  recoveredRevenueINR: number;
  conversionRatePercent: number;
  ctrPercent: number;
  forecast?: {
    projected30DayRevenueINR: number;
    expectedOrdersCount: number;
    topVelocityReference: string;
    inventoryDepletionDays: number;
    highIntentCartProbability: number;
  };
}

export type PaymentMethod = 'card' | 'upi' | 'cod';

export interface InvoiceItem {
  productId: string;
  productTitle: string;
  brand?: string;
  quantity: number;
  priceINR: number;
  image?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  orderId: string;
  invoiceDate: string;
  company: {
    name: string;
    cin: string;
    gstin: string;
    registeredOffice: string;
    supportEmail: string;
    contactPhone: string;
    website: string;
  };
  customer: {
    name: string;
    email: string;
    shippingAddress: string;
    phone?: string;
  };
  payment: {
    method: string;
    status: string;
    details: Record<string, any>;
  };
  financials: {
    currency: string;
    totalAmount: number;
    taxableAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    discountCode?: string | null;
    discountPercent?: number;
    insuredShipping: string;
  };
  items: InvoiceItem[];
  authenticityGuarantee?: {
    certificateSerial: string;
    warrantyPeriod: string;
    authenticityVerified: boolean;
  };
}


