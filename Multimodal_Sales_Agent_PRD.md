# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Autonomous Multi-Modal Sales & Clienteling Agent

**Document Version:** 1.0  
**Last Updated:** September 22, 2026  
**Project Owner:** Krrish (AI/ML Backend Developer)  
**Timeline:** 4 months (12 weeks)  
**Target Audience:** E-commerce merchants + Shoppers

---

## EXECUTIVE SUMMARY

### Problem Statement
**70% of e-commerce carts are abandoned.** The primary reason: lack of personalized assistance. When customers have questions about sizing, styling, materials, or fit, traditional chatbots offer generic FAQ links or fall silent. The result? Lost sales.

### Solution
An autonomous, multi-modal sales agent that:
- **Proactively engages** customers before they leave (exit-intent detection)
- **Visually pitches products** using Vision-Language AI + product images
- **Answers specific questions** about materials, sizing, and fit
- **Guides to checkout** with seamless cart recovery
- **Tracks ROI** with merchant analytics dashboard

### MVP Scope
Web-based chat interface + multimodal product recommendations + analytics dashboard. **No voice calls** (scope-cut for college project). **No real payments** (mock Stripe only).

### Expected Impact
- **Conversion Rate Lift:** 15-25% (recovery of abandoned carts)
- **Average Order Value:** +10% (upselling via recommendations)
- **Customer Satisfaction:** Improved (personalized, contextual help)

---

## 1. PRODUCT VISION

### 1.1 Vision Statement
*"From passive storefronts to active retail associates: AI-powered agents that know your products, understand your customers, and close sales."*

### 1.2 Long-term Goals (Beyond MVP)
1. ✅ Autonomous outbound calling (voice agents)
2. ✅ Real-time payment processing (Stripe live)
3. ✅ Multi-language support (Hindi, Tamil, Telugu)
4. ✅ Mobile app (iOS/Android)
5. ✅ Integration with Shopify/WooCommerce

### 1.3 MVP Goals (12 weeks)
1. ✅ Demonstrate core agentic capability (agent routing)
2. ✅ Prove multimodal product understanding (Vision-Language)
3. ✅ Show ROI tracking (merchant dashboard)
4. ✅ Build production-grade backend (security, scalability)
5. ✅ Deploy to production (cloud-hosted)

---

## 2. USE CASES & USER JOURNEYS

### 2.1 Primary User Persona #1: Shopper (Priya, 28, Fashion Enthusiast)

**Goal:** Find the perfect outfit for a summer event without hassle.

**Journey:**
```
1. DISCOVER
   Priya browses online store → sees "summer evening wear" collection
   Agent observes: 4 min on cotton shirt, zoom on fabric detail
   
2. ENGAGEMENT
   Priya hovers away from product
   Observer Agent triggers: "Hi Priya! This cotton-blend is perfect for summer. 
                             Breathes well, won't wrinkle. Questions about fit?"
   
3. INTERACTION
   Priya: "Does this shirt work for someone 5'6"?"
   Stylist Agent: [Analyzes image] "Yes! The length is 28 inches (tailored for 
                  5'5"-5'8"). Great proportions for your frame. 
                  The oversized collar trend suits taller silhouettes too."
   
4. CONVERSION
   Priya adds to cart → Checkout Agent offers 10% discount (abandoned cart recovery)
   Priya completes purchase
```

**Success Metric:** Cart recovered, order placed.

---

### 2.2 Primary User Persona #2: Merchant (Rajesh, 35, Store Owner)

**Goal:** Recover abandoned carts + understand customer behavior.

**Journey:**
```
1. SETUP
   Rajesh logs into merchant dashboard
   Uploads 50 products (images + metadata: material, size chart, price)
   
2. MONITOR
   Rajesh checks analytics dashboard
   Sees: 142 sessions today, 8 pitches triggered, 2 carts recovered
   Conversion rate: 25% (industry avg: 2-3%)
   
3. OPTIMIZE
   Rajesh reviews which products trigger most pitches
   Notes: Premium denim (₹4500) has 80% pitch-to-click rate
   Decides: Feature it more in recommendations
   
4. MEASURE
   Monthly report: +₹45,000 revenue from recovered carts
   ROI: 3.2x (invested ₹2K in API costs, recovered ₹6.4K+ in sales)
```

**Success Metric:** Increased conversion rate, ROI tracking, product optimization insights.

---

### 2.3 Use Case Flows

#### **Use Case 1: Semantic Product Search**
```
Actor: Shopper
Trigger: Customer types vague query: "I need something breathable for office"

Flow:
1. User enters query in chat
2. Supervisor Agent detects intent: "product_search"
3. Routes to RAG Agent
4. RAG Agent:
   - Converts query to embedding (OpenAI)
   - Searches Pinecone vector DB
   - Finds top-5 cotton/linen shirts (semantic match)
   - Fetches product metadata from PostgreSQL
   - Generates LLM response: "Based on your needs, I'd suggest..."
5. Returns recommendations with images
6. User clicks product → Stylist Agent takes over

Success Criteria:
- Response time < 2 seconds
- Recommendations match user intent
- User clicks at least 1 recommendation
```

#### **Use Case 2: Sizing/Fit Question**
```
Actor: Shopper
Trigger: Customer asks: "I'm usually M in other brands, what size should I pick?"

Flow:
1. User message received in context of current product
2. Supervisor Agent detects intent: "sizing_question"
3. Routes to Multimodal Stylist Agent
4. Stylist Agent:
   - Retrieves product size chart (JSONB from DB)
   - Uses GPT-4o Vision to analyze product image
   - Generates response: "This brand runs small. 
     For your typical M, I'd recommend L. 
     The fit through shoulders is generous; sleeves might be slightly long."
5. Stores pitch in chat_history + pitches_generated
6. User adds to cart

Success Criteria:
- Answer is grounded in actual product data
- No hallucinations (e.g., doesn't invent size info)
- User satisfaction (no returns due to fit)
```

#### **Use Case 3: Exit Intent & Pitch Triggering**
```
Actor: Shopper, Observer Agent
Trigger: User spends 3+ min on high-value product (₹3000+) then moves mouse toward close button

Flow:
1. Session tracking detects: mouse_y < 50 (leaving), high_value_product=true
2. Observer Agent activates
3. Checks exit signals:
   - Time on page > 2 minutes? ✓
   - High-value product (>₹2000)? ✓
   - Previously abandoned similar? (optional)
4. Decision: Trigger pitch
5. Generates pitch via LLM:
   "Hi! I noticed you love this denim shirt. 
    Wondering about anything? I can apply a 15% code if you checkout now."
6. Stores in pitches_generated (for analytics)
7. User clicks pitch OR leaves

Success Criteria:
- Pitch appears at right moment (not too early/late)
- Conversion rate from pitch: >15%
- No user complaints about "spammy" behavior
```

#### **Use Case 4: Merchant Analytics & Decision-Making**
```
Actor: Merchant
Trigger: Merchant logs into dashboard to check daily performance

Flow:
1. Dashboard loads merchant analytics:
   - Total sessions: 247
   - Products viewed: 1,203
   - High-value product views: 89
   - Pitches triggered: 23
   - Pitch click-through rate: 34%
   - Carts recovered: 8
   - Revenue from recovered carts: ₹18,500
   
2. Merchant drills down: "Which products have highest pitch CTR?"
   Results: Premium denim (42%), summer shirt (38%), casual shoes (22%)
   
3. Merchant drills down: "Where are drop-offs happening?"
   Results: 60% drop at checkout (Stripe gateway perceived as slow)
   Action: Optimize payment flow
   
4. Merchant A/B tests pitch copy:
   - Version A: "Hi! Notice you love this item. Questions?"
   - Version B: "This shirt breathes well in summer. Good fit?"
   Version B wins: 41% CTR vs 32%

Success Criteria:
- Dashboard loads in <1 second
- Metrics are accurate (real-time or 5-min delay max)
- Merchant can identify top/bottom performers
- Data-driven decisions improve conversion rate
```

---

## 3. FEATURES & REQUIREMENTS

### 3.1 Feature: Session Tracking & Analytics

**Description:** Track individual shopper behavior across browsing session.

**Functional Requirements:**
- Generate unique session ID on page load (no login required)
- Track: product views, time spent, cart additions, exit signals
- Store in PostgreSQL `sessions` + `product_views` tables
- Update `last_activity` timestamp every 30 seconds (to detect idle)

**Technical Requirements:**
- Frontend: Send beacon/API call to `/api/sessions/{id}/track` every 30s
- Backend: Validate session token, update DB
- Performance: Tracking call < 100ms

**Data Captured:**
```json
{
  "session_id": "uuid",
  "product_id": "uuid",
  "viewed_at": "2026-09-22T10:15:33Z",
  "time_spent_seconds": 145,
  "mouse_position": {"x": 240, "y": 560},
  "scroll_depth": 0.75,
  "added_to_cart": false
}
```

**Acceptance Criteria:**
- ✅ Session created on first page load
- ✅ Product views logged accurately
- ✅ Time spent calculated correctly
- ✅ No data loss if network drops
- ✅ Privacy: no personally identifiable info (unless user logs in)

---

### 3.2 Feature: Semantic Product Search (RAG Agent)

**Description:** Find products via natural language, not keywords.

**Functional Requirements:**
- User types: "I need something lightweight for summer" → Agent finds cotton/linen products
- Use OpenAI embedding API to vectorize query + product descriptions
- Search Pinecone vector DB (top-5 results)
- Rank by relevance + inventory availability
- Return: product name, image, description, price

**Technical Requirements:**
- Pinecone integration: `query()` with embedding + filters
- PostgreSQL: fetch full product metadata for top-5
- LLM: GPT-4o generates natural language explanation
- Latency: <2 seconds (embedding + search + LLM)

**Search Example:**
```
User query: "I want something casual but formal enough for office"

Embeddings search finds:
1. Casual Oxford Shirt (cotton, 80% match)
2. Premium Linen Blend (linen, 78% match)
3. Structured Casual Shirt (poly-cotton, 76% match)

LLM generates:
"Based on your needs, I'd suggest these three. The Oxford Shirt 
is timeless—works for casual Friday or dinner. The Linen Blend 
breathes in summer but needs ironing. The Structured Casual 
bridges both worlds."
```

**Acceptance Criteria:**
- ✅ Search latency < 2 seconds
- ✅ Results match user intent (qualitative review)
- ✅ No results returned for nonsensical queries
- ✅ Handles typos gracefully (e.g., "sumer" → "summer")

---

### 3.3 Feature: Multimodal Stylist Agent (Vision-Language)

**Description:** Answer product-specific questions using image + metadata.

**Functional Requirements:**
- User asks: "Does this breathe well?" OR "What color is this really?"
- Agent analyzes: product image (vision) + material metadata (RAG)
- Generates answer grounded in ACTUAL product data (not hallucination)
- Stores response in chat history

**Technical Requirements:**
- GPT-4o Vision API integration
- Input: image URL + product metadata + user question
- Output: detailed answer + confidence score
- Guardrail: If confident < 0.7, add disclaimer ("I'm not 100% sure, check care tag")

**Example Interaction:**
```
User: "I have sensitive skin. Is this shirt hypoallergenic?"

Agent analysis:
- Image: White cotton shirt
- Metadata: "100% organic cotton, pre-shrunk, no dyes"
- GPT-4o Vision: "Appears to be soft fabric, good for sensitive skin"

Response: "Yes! This is 100% organic cotton with no synthetic dyes, 
which is great for sensitive skin. The soft finish suggests low-abrasion 
weave. However, I'd always patch-test first if you have severe allergies."
```

**Acceptance Criteria:**
- ✅ Answers grounded in product metadata (no made-up info)
- ✅ Vision analysis accurate (can identify colors, patterns, fabric appearance)
- ✅ Response time < 3 seconds
- ✅ Confidence score attached to answers

---

### 3.4 Feature: Exit Intent Detection & Pitch Triggering

**Description:** Detect when customer is about to leave → trigger personalized pitch.

**Functional Requirements:**
- Monitor: mouse movement, time on page, scroll behavior
- Detect exit signals:
  - Mouse moving toward close button (top-left corner)
  - User idle for 2+ minutes on high-value product
  - User opens new tab (if traceable)
- Generate pitch: "Hi! I noticed you love this item. Any questions?"
- Pitch text should be personalized (mention product name, offer if applicable)

**Technical Requirements:**
- Frontend: Detect mouse position, send to backend via `/api/observer/check-exit-intent`
- Backend: Evaluate exit_intent_score, decide whether to trigger
- Only trigger if: high_value_product (price > ₹2000) AND exit_signal_present
- Store pitch in `pitches_generated` table (for merchant analytics)

**Exit Intent Logic:**
```python
exit_signals = {
    "mouse_leaving": mouse_y < 50,  # Mouse near top
    "time_on_page": session_duration > 120,  # 2+ minutes
    "high_value": product_price > 2000,
}

should_trigger = (
    exit_signals["mouse_leaving"] or exit_signals["time_on_page"]
) and exit_signals["high_value"] and not recently_pitched

if should_trigger:
    pitch = generate_pitch(product, "exit_intent")
    store_pitch(session_id, product_id, pitch)
    send_to_user(pitch)
```

**Acceptance Criteria:**
- ✅ Pitch triggers at right moment (not too early)
- ✅ Only triggers for high-value products
- ✅ Not triggered if user already received pitch for same product
- ✅ Pitch click-through rate > 10%
- ✅ No user complaints about "spam"

---

### 3.5 Feature: Chat History & Multi-Turn Conversation

**Description:** Agent remembers what user asked, provides contextual responses.

**Functional Requirements:**
- Store all user messages + agent responses in `chat_history` table
- On each new message, fetch last 5-10 messages as context
- Pass context to LLM so agent can reference previous questions
- Display chat timeline in UI (scrollable conversation)

**Technical Requirements:**
- Database: `chat_history` table with indexed queries on session_id
- LLM context: Include last 5 messages in system prompt
- Frontend: React component for chat UI (MessageList + InputBox)

**Example Multi-Turn:**
```
User Message 1: "What material is this?"
Agent: "100% organic cotton, soft finish."

User Message 2: "Does it wrinkle easily?"
Agent: "Good question! Since it's 100% cotton (mentioned earlier), 
yes, it wrinkles more than cotton-blends. 
But the pre-shrunk weave minimizes it. 
Many customers love the natural texture."

[Note: Agent references "mentioned earlier" = awareness of context]
```

**Acceptance Criteria:**
- ✅ Chat history persists across page refreshes
- ✅ Agent can reference previous messages
- ✅ No repeated information in responses
- ✅ Conversation feels natural (not robotic)

---

### 3.6 Feature: Merchant Dashboard & Analytics

**Description:** Merchants see real-time metrics: sessions, pitches, conversions, revenue.

**Functional Requirements:**
- Dashboard displays:
  - Total sessions (today, this week, this month)
  - High-value product views (>₹2000)
  - Pitches triggered + click-through rate
  - Carts recovered (abandoned carts brought back)
  - Revenue from recovered carts
  - Top products (by pitch engagement)
- Drill-down capabilities: filter by date, product, pitch type
- Export analytics as CSV

**Technical Requirements:**
- Merchant authentication: API key-based (header: `Authorization: Bearer sk_test_...`)
- Backend endpoints:
  - `GET /api/merchant/analytics` → Summary stats
  - `GET /api/merchant/sessions` → List sessions
  - `GET /api/merchant/pitches` → List all pitches
- Frontend: React dashboard with charts (Recharts or Chart.js)

**Dashboard Wireframe:**
```
┌─────────────────────────────────────────────────────────────┐
│  Sales Agent Dashboard                        [Logout]       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
│  │ Sessions    │ Pitches     │ Conversions │ Revenue     │  │
│  │ 247         │ 23          │ 8           │ ₹18,500     │  │
│  │ +12% ↑      │ +34% ↑      │ +8% ↑       │ +15% ↑      │  │
│  └─────────────┴─────────────┴─────────────┴─────────────┘  │
│                                                               │
│  Pitch CTR by Product                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Premium Denim         ███████████████ 42%            │   │
│  │ Summer Shirt          ██████████████ 38%             │   │
│  │ Casual Shoes          ████████ 22%                   │   │
│  │ Evening Wear          ██████ 18%                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Recent Pitches                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Premium Denim | Exit Intent | Clicked ✓ | 2h ago    │   │
│  │ Summer Shirt  | High Value  | Clicked ✓ | 4h ago    │   │
│  │ Casual Shoes  | Exit Intent | —         | 6h ago    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- ✅ Dashboard loads in <1 second
- ✅ Metrics update in real-time (or 5-min refresh)
- ✅ Drill-down works (filter by date/product)
- ✅ Export CSV is accurate
- ✅ Mobile-responsive design

---

### 3.7 Feature: Mock Stripe Checkout

**Description:** Simulate payment flow (no real money).

**Functional Requirements:**
- User clicks "Checkout" → redirected to payment page
- Mock Stripe form: card number, expiry, CVC
- On submit: create payment intent (mock)
- Simulate success/failure (with configurable ratio)
- Store checkout attempt in `checkout_attempts` table

**Technical Requirements:**
- Stripe sandbox mode (test API keys)
- Frontend: Stripe.js (Elements) for card input
- Backend: `/api/checkout/create-intent` + `/api/checkout/confirm`
- No real payments (test data only)

**Test Card Numbers:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
```

**Acceptance Criteria:**
- ✅ Payment form accepts test cards
- ✅ Successful payments recorded in DB
- ✅ Failed payments show error message
- ✅ Order created after successful payment
- ✅ No real charges (sandbox only)

---

### 3.8 Feature: Product Catalog Management

**Description:** Merchants upload products with images, metadata.

**Functional Requirements:**
- Merchant can upload products:
  - Product name, description, category
  - Price, stock count
  - Product image (JPG/PNG)
  - Material, size chart, care instructions
- Images stored on Cloudinary (free tier: 25 GB/month)
- Product embeddings generated automatically (OpenAI API)
- Embeddings stored in Pinecone for semantic search

**Technical Requirements:**
- Backend: `POST /api/products/upload` (multipart form)
- Image processing: Upload to Cloudinary, store URL in DB
- Embedding generation: Async task (don't block upload)
- Pinecone: Upsert embeddings after generation

**Example Product Upload:**
```json
{
  "name": "Premium Denim Shirt",
  "description": "Classic button-up denim, perfect for casual or smart-casual.",
  "category": "shirts",
  "price": 2500,
  "stock_count": 45,
  "material": "100% cotton denim",
  "size_chart": {
    "XS": "28 inches",
    "S": "29 inches",
    "M": "30 inches",
    "L": "31 inches"
  },
  "care_instructions": "Machine wash cold, hang dry",
  "image": "<file upload>"
}
```

**Acceptance Criteria:**
- ✅ Upload completes in <5 seconds
- ✅ Images stored on Cloudinary with CDN URL
- ✅ Embeddings generated within 30 seconds
- ✅ Product searchable immediately after upload
- ✅ No duplicate products

---

## 4. TECHNICAL ARCHITECTURE

### 4.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  CLIENT LAYER                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Frontend: React/Next.js                              │ │
│  │  - Chat interface + Product display                   │ │
│  │  - Merchant dashboard                                 │ │
│  │  - Product upload form                                │ │
│  └────────────────────┬─────────────────────────────────┘ │
└─────────────────────────┼──────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  API GATEWAY (FastAPI)                      │
│  - Authentication (JWT)                                    │
│  - Rate limiting (100 req/min)                             │
│  - Request validation                                      │
│  - CORS configuration                                      │
└────────────────┬─────────────────────────┬─────────────────┘
                 │                         │
        ┌────────▼────────┐       ┌────────▼────────┐
        │  Agent Service  │       │ Product Service │
        │  (LLM routing)  │       │  (CRUD)         │
        └────────┬────────┘       └────────┬────────┘
                 │                         │
        ┌────────▼────────┐       ┌────────▼────────┐
        │ LLM APIs        │       │  Vector DB      │
        │ - OpenAI        │       │  - Pinecone     │
        │ - GPT-4o        │       │  - Embeddings   │
        └─────────────────┘       └────────┬────────┘
                                           │
                    ┌──────────────────────┼─────────────┐
                    │                      │             │
        ┌───────────▼────────┐  ┌─────────▼──────┐  ┌───▼───────────┐
        │  PostgreSQL        │  │   Redis        │  │  Cloudinary   │
        │  - Users           │  │   - Sessions   │  │  - Images     │
        │  - Products        │  │   - Cache      │  │  - CDN        │
        │  - Sessions        │  │   - Rate limit │  │               │
        │  - Chat history    │  │                │  │               │
        │  - Analytics       │  │                │  │               │
        └────────────────────┘  └────────────────┘  └───────────────┘
```

### 4.2 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, Next.js 14, TailwindCSS | UI, SSR, styling |
| **Backend** | FastAPI, Python 3.11 | API, agent orchestration |
| **Database** | PostgreSQL 15, pgvector | Persistent data, vector search |
| **Cache** | Redis 7 | Session state, rate limiting |
| **Vector DB** | Pinecone (free tier) | Product embeddings, semantic search |
| **LLM** | OpenAI (GPT-4o, GPT-4o Vision) | Chat, reasoning, vision analysis |
| **Images** | Cloudinary | Image hosting, CDN |
| **Agent Orchestration** | LangChain, LangGraph | Agent routing, memory |
| **Deployment** | Docker, Railway/Render | Containerization, hosting |
| **Monitoring** | Sentry, DataDog | Error tracking, logging |

### 4.3 Database Schema (Detailed)

See Section 3.2 of MVP spec (already provided in earlier response).

### 4.4 API Specification

See Section 3.2 of MVP spec (endpoints, authentication, response formats).

---

## 5. USER INTERFACE MOCKUPS

### 5.1 Shopper Chat Interface

```
┌─────────────────────────────────────────────────────────────┐
│  Style Agent                                         [×]     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Hi! I'm your style assistant. I can help you find      │ │
│  │  perfect outfits and answer questions about products.   │ │
│  │  What are you looking for today?                        │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  User: I need something casual but office-appropriate       │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Perfect! Based on your needs, I'd suggest these:       │ │
│  │                                                          │ │
│  │  ┌───────────────┐  ┌───────────────┐  ┌────────────┐  │ │
│  │  │ [image]       │  │ [image]       │  │ [image]    │  │ │
│  │  │ Casual Oxford │  │ Linen Blend   │  │ Structured │  │ │
│  │  │ ₹1,800        │  │ ₹2,200        │  │ Casual     │  │ │
│  │  │ [View Details]│  │ [View Details]│  │ ₹2,000     │  │ │
│  │  └───────────────┘  └───────────────┘  │ [View Det] │  │ │
│  │                                         └────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Type your message here...                         [Send] │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Product Detail Page with Exit-Intent Pitch

```
┌─────────────────────────────────────────────────────────────┐
│  Premium Denim Shirt                              [← Back]   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐                                            │
│  │              │   Premium Denim Shirt                      │
│  │   [IMAGE]    │   Material: 100% cotton denim              │
│  │              │   Price: ₹2,500                            │
│  │              │   Stock: 45 units                          │
│  │              │   ⭐⭐⭐⭐⭐ (234 reviews)                  │
│  │              │                                             │
│  └──────────────┘   Size Guide: S M L XL                     │
│                     ┌─────────────────────────────────────┐  │
│                     │ [Button] Add to Cart  [Button] Chat │  │
│                     └─────────────────────────────────────┘  │
│                                                               │
│  Description                                                 │
│  Classic button-up denim, perfect for casual or smart-      │
│  casual. Pre-shrunk, durable weave.                         │
│                                                               │
│  Care Instructions                                           │
│  Machine wash cold, hang dry                                │
│                                                               │
│  ◄─────────── EXIT-INTENT PITCH APPEARS HERE ──────────────► │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  💬 Hi! I noticed you love this denim shirt.            │ │
│  │     Do you have any questions about fit or care?        │ │
│  │     I can also apply a 15% code for you right now.      │ │
│  │                                                          │ │
│  │  [Get Code]  [View Size Guide]  [Dismiss]              │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Merchant Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│  📊 Sales Agent Dashboard                          [Logout]   │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Filter: [Today] [This Week] [This Month]                    │
│                                                                │
│  ┌──────────────┬──────────────┬──────────────┬────────────┐ │
│  │ 📊 Sessions  │ 💬 Pitches   │ 🎯 Conversions│ 💰 Revenue│ │
│  │ 247          │ 23           │ 8            │ ₹18,500   │ │
│  │ +12% ↑       │ +34% ↑       │ +8% ↑        │ +15% ↑    │ │
│  └──────────────┴──────────────┴──────────────┴────────────┘ │
│                                                                │
│  📈 Pitch Performance by Product                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Premium Denim      ███████████ 42% CTR  [View Details] │ │
│  │ Summer Shirt       ██████████ 38% CTR   [View Details] │ │
│  │ Casual Shoes       ██████ 22% CTR       [View Details] │ │
│  │ Evening Wear       ████ 18% CTR         [View Details] │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                │
│  🛒 Recent Conversions                                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Order #1847 | ₹5,600  | Premium Denim | 2 hours ago   │ │
│  │ Order #1846 | ₹3,200  | Summer Shirt  | 5 hours ago   │ │
│  │ Order #1845 | ₹2,100  | Casual Shoes  | 8 hours ago   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                │
│  [Export as CSV]  [View Full Report]                         │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. SUCCESS METRICS & KPIs

### 6.1 Business Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Conversion Rate (recovered carts) | 15-25% | Month 2 |
| Average Order Value increase | +10% | Month 2 |
| Pitch Click-Through Rate | >15% | Week 6 |
| Customer Satisfaction Score | >4.2/5 | Month 3 |
| Merchant ROI | 3x+ | Month 3 |

### 6.2 Technical Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| API Response Time (chat) | <2 seconds | Including LLM |
| API Response Time (search) | <2 seconds | Including embeddings |
| Database Query Latency | <100ms | 95th percentile |
| Vector DB Query Latency | <500ms | 95th percentile |
| Uptime | 99.5% | Excluding maintenance |
| Error Rate | <0.1% | 5xx errors |

### 6.3 User Engagement Metrics

| Metric | Target |
|--------|--------|
| Session duration (avg) | >3 minutes |
| Chat messages per session | >5 |
| Pitch triggered % | >10% of sessions |
| Pitch clicked % | >15% of triggered |
| Add-to-cart conversion | >25% |

### 6.4 Product Quality Metrics

| Metric | Target | How to Measure |
|--------|--------|-----------------|
| LLM Accuracy (no hallucinations) | 95%+ | Manual review of 100 pitches |
| Vision Model Accuracy | 90%+ | Test on unseen product images |
| Search Relevance | 85%+ | Human raters score top-5 results |
| Chat Sentiment | >4.0/5 | User feedback survey |

---

## 7. TIMELINE & MILESTONES

### Phase 1: Foundation (Weeks 1-3)
**Goal:** Backend infrastructure ready for agents.

- [ ] FastAPI boilerplate + project structure
- [ ] PostgreSQL schema + migrations
- [ ] Authentication (JWT) implemented
- [ ] Basic CRUD endpoints for products
- [ ] Redis integration for sessions
- [ ] Deployment pipeline (Docker + Railway/Render)

**Deliverable:** Backend running locally + deployed to staging.

---

### Phase 2: Product Catalog & Search (Weeks 4-6)
**Goal:** Product discovery working via semantic search.

- [ ] Pinecone integration + embedding generation
- [ ] Product upload endpoint (multipart form)
- [ ] Semantic search endpoint (`POST /api/products/search`)
- [ ] Product recommendations algorithm
- [ ] Cloudinary integration for images
- [ ] Basic React frontend (product listing)

**Deliverable:** Users can search for products by description + see recommendations.

---

### Phase 3: Agent Core (Weeks 7-9)
**Goal:** Agentic routing + multimodal responses.

- [ ] Supervisor Agent (intent routing logic)
- [ ] RAG Agent (inventory + metadata)
- [ ] Multimodal Stylist Agent (GPT-4o Vision integration)
- [ ] Chat history + context management
- [ ] Session analytics tracking
- [ ] Observer Agent (exit-intent detection)
- [ ] Pitch triggering logic

**Deliverable:** Chat interface working; agent responds to product questions.

---

### Phase 4: Analytics & Dashboard (Weeks 10-11)
**Goal:** Merchants can see ROI.

- [ ] Merchant dashboard backend endpoints
- [ ] Analytics aggregation queries
- [ ] React dashboard components (charts, metrics)
- [ ] Export functionality (CSV)
- [ ] Pitch performance tracking

**Deliverable:** Merchant can log in, see conversion metrics, ROI.

---

### Phase 5: Polish & Launch (Week 12)
**Goal:** Production-ready demo.

- [ ] End-to-end testing (user flows)
- [ ] Security audit (SQL injection, XSS, CSRF)
- [ ] Performance optimization (caching, query tuning)
- [ ] Documentation (API, deployment, architecture)
- [ ] Demo video + README
- [ ] Bug fixes + refinements

**Deliverable:** Live demo + GitHub repo with full code.

---

## 8. RISKS & MITIGATION

| Risk | Severity | Mitigation |
|------|----------|-----------|
| **LLM Hallucination** (agent invents product info) | High | Implement guardrails: only mention metadata from DB; add confidence scores; use retrieval-augmented generation (RAG) |
| **Voice Latency** (if attempted) | High | **Scope cut:** No outbound calling in MVP |
| **Scope Creep** (feature requests mid-project) | High | Maintain strict MVP scope; document "Phase 2" features separately |
| **OpenAI API Costs** (unexpectedly high) | Medium | Set usage limits; use free/cheaper alternatives (e.g., Mixtral 8x7B for non-critical flows) |
| **Database Performance** (queries slow at scale) | Medium | Add indexes on session_id, product_id; use connection pooling; monitor query times |
| **Image Processing Delays** | Low | Use async task queue (Celery); don't block product upload |
| **Regulatory Issues** (telecom rules if voice added) | Medium | Stay web-only; document TRAI compliance for future phases |

---

## 9. ACCEPTANCE CRITERIA

### For MVP to be "Complete"

- ✅ Shopper can chat with agent about products
- ✅ Agent provides personalized recommendations (semantically relevant)
- ✅ Agent answers questions grounded in actual product data (no hallucinations)
- ✅ Exit-intent pitch triggers correctly (>10% of sessions)
- ✅ Merchant dashboard shows real-time conversion metrics
- ✅ Chat history preserved across sessions
- ✅ Mock checkout works (no real payments)
- ✅ Product upload + embedding generation works
- ✅ Performance: chat response <2s, search <2s, dashboard load <1s
- ✅ Backend 99.5% uptime (over 2-week test period)
- ✅ Zero data loss (DB backups, recovery tested)
- ✅ Security: no SQL injection, XSS, CSRF vulnerabilities (pen-tested)
- ✅ Documentation: API docs (Swagger), deployment guide, README
- ✅ Code: GitHub repo, clean commits, tests (>70% coverage)

---

## 10. POST-MVP ROADMAP

### Phase 2: Voice & Outbound Calling (Q1 2027)
- Real outbound calling via VAPI/Retell
- <500ms latency voice interaction
- Autonomous pitch delivery over phone
- Call transcription + analytics

### Phase 3: Real Payments & Integrations (Q1 2027)
- Live Stripe checkout (real payments)
- Shopify/WooCommerce integration
- Inventory sync (real-time)
- Email notifications (abandoned cart)

### Phase 4: Personalization & Scale (Q2 2027)
- User authentication + saved preferences
- A/B testing framework (pitch copy variants)
- Multi-language support (Hindi, Tamil, Telugu)
- Mobile app (iOS/Android)
- Analytics ML: predict which products will sell

### Phase 5: Enterprise Features (Q3 2027)
- Multiple agent types (e.g., VIP support agent, bulk buyer agent)
- Custom LLM fine-tuning per merchant
- White-label solution for agencies
- API for third-party integrations

---

## 11. GLOSSARY

| Term | Definition |
|------|-----------|
| **Agent** | Autonomous LLM-powered system that performs tasks (e.g., RAG Agent searches products) |
| **Supervisor Agent** | Meta-agent that routes user queries to appropriate sub-agents |
| **RAG** | Retrieval-Augmented Generation; LLM + database for accurate answers |
| **Vector DB** | Database optimized for semantic search (Pinecone) |
| **Embedding** | Numerical representation of text/image (used for similarity search) |
| **Exit Intent** | User behavior signaling they're about to leave (e.g., mouse toward close button) |
| **Pitch** | Personalized message to customer (e.g., "Try this item") |
| **CTR** | Click-Through Rate; % of pitches clicked |
| **Conversion** | User completes purchase |
| **Cart Abandonment** | User adds items to cart but doesn't checkout |

---

## 12. APPENDIX: TECHNICAL DEEP DIVES

### A. LangGraph State Machine for Agent Routing

```python
from langgraph.graph import StateGraph

# Define agent state
class AgentState(TypedDict):
    user_message: str
    session_id: str
    detected_intent: str
    response: str
    confidence: float

# Build graph
graph = StateGraph(AgentState)

# Add nodes (agents)
graph.add_node("intent_detector", detect_intent)
graph.add_node("rag_agent", rag_agent)
graph.add_node("stylist_agent", stylist_agent)
graph.add_node("fallback_agent", fallback_agent)

# Add edges (routing logic)
graph.add_edge("START", "intent_detector")
graph.add_conditional_edges(
    "intent_detector",
    lambda state: state["detected_intent"],
    {
        "product_search": "rag_agent",
        "styling_question": "stylist_agent",
        "default": "fallback_agent"
    }
)
graph.add_edge("rag_agent", "END")
graph.add_edge("stylist_agent", "END")
graph.add_edge("fallback_agent", "END")

# Compile & run
compiled_graph = graph.compile()
result = compiled_graph.invoke(initial_state)
```

### B. Pinecone Integration Example

```python
from pinecone import Pinecone

# Initialize
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

# Upsert product embeddings
products_with_embeddings = [
    {
        "id": "prod_123",
        "values": [0.1, 0.2, 0.3, ...],  # 1536-dim embedding
        "metadata": {"name": "Cotton Shirt", "price": 2000}
    }
]
index.upsert(vectors=products_with_embeddings)

# Query
query_embedding = encode_text("I want breathable summer wear")
results = index.query(
    vector=query_embedding,
    top_k=5,
    include_metadata=True
)
# Results: [{id: "prod_123", score: 0.87, metadata: {...}}, ...]
```

### C. GPT-4o Vision Integration Example

```python
from openai import OpenAI

client = OpenAI(api_key=OPENAI_API_KEY)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": f"""
                    Product: {product['name']}
                    Material: {product['material']}
                    
                    User question: Does this breathe well in summer?
                    
                    Answer based on the image and metadata.
                    """
                },
                {
                    "type": "image_url",
                    "image_url": {"url": product['image_url']}
                }
            ]
        }
    ],
    temperature=0.7,
    max_tokens=300
)

answer = response.choices[0].message.content
```

---

## APPROVAL & SIGN-OFF

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Project Owner | Krrish | Sept 22, 2026 | ✅ |
| Tech Lead | — | — | — |
| Product Manager | — | — | — |

---

**Document Status:** ✅ DRAFT (Ready for Review)

**Last Modified:** September 22, 2026  
**Next Review:** October 6, 2026 (after Phase 1 completion)
