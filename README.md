# Mono Time

Mono Time is an e-commerce platform and clienteling system for curated mechanical, automatic, and quartz timepieces. It combines an interactive boutique storefront with real-time wrist sizing calculations, an AI horology concierge, and an administrative dashboard for order and pitch analytics.

---

## Features

- **Storefront & Product Detail**: Boutique visual design built with warm surfaces, Newsreader display typography, and DM Mono tabular specifications. Includes interactive perspective thumbnails and full spec breakdowns.
- **Wrist Fit Calculator**: Real-time top-down SVG wrist diagram that calculates flat wrist width from circumference and evaluates lug-to-lug proportions to determine lug overhang.
- **Horology Concierge**: Docked assistant providing sizing recommendations, dress code styling pairings, movement breakdowns, and policy queries with documented source citations.
- **Budget Shield & Cost Protection**: In-memory IP rate limiting (6 req/min) and daily call capping that prevents unauthorized billing spikes from public links by seamlessly delegating to an offline local RAG engine.
- **Admin & Merchant Dashboard**: Secure cookie-authenticated management portal (`/admin`) for inspecting customer dwell sessions, pitch conversion metrics, and order histories.
- **Checkout & Sizing Request**: Multi-rail checkout simulation (Card, UPI, Net Banking) with automatic complimentary bracelet sizing notes.

---

## Tech Stack

### Frontend
- Next.js 13 (App Router)
- React 18
- Tailwind CSS
- Lucide React

### Backend
- FastAPI
- SQLite with SQLAlchemy ORM
- Pydantic v2
- Uvicorn
- Optional: Google Generative AI (Gemini 1.5 Flash)

---

## Project Structure

```
minor_project/
├── backend/
│   ├── app/
│   │   ├── models/         # SQLAlchemy database models (products, orders, chat, pitches)
│   │   ├── routers/        # API endpoints (agent, admin, checkout, products, sessions)
│   │   ├── schemas/        # Pydantic request and response schemas
│   │   ├── services/       # Concierge engine, rate limiting, and observer logic
│   │   ├── config.py       # Application settings and environment variables
│   │   ├── database.py     # SQLite database connection
│   │   └── main.py         # FastAPI application entrypoint
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router pages and layout
│   │   ├── components/     # UI components (ProductHero, CartDrawer, ChatWidget, Navbar)
│   │   ├── lib/            # State management, API clients, and product datasets
│   │   └── types/          # TypeScript definitions
│   ├── public/             # Static assets and reference images
│   ├── package.json
│   └── tailwind.config.ts
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18 or higher
- Python 3.10 or higher
- Git

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv

# Windows
.\.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run FastAPI backend
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend API documentation is available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local

# Run Next.js dev server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Environment Configuration

Configuration variables are managed through environment files:

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | SQLite or PostgreSQL connection string | `sqlite:///./sales_agent.db` |
| `ADMIN_USERNAME` | Admin login username | `admin` |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash for admin authentication | (set in `.env`) |
| `SESSION_SECRET` | Secret key for signing admin session tokens | (random string) |
| `GEMINI_API_KEY` | Optional Google Gemini API key | `""` |
| `ENABLE_GEMINI_API` | Toggle external Gemini API usage | `True` |
| `MAX_GEMINI_CALLS_PER_DAY` | Hard cap on daily external API calls | `50` |
| `RATE_LIMIT_PER_MINUTE_PER_IP` | Max chat requests per IP per minute | `6` |

When `GEMINI_API_KEY` is not provided or when the daily call cap is reached, the backend operates entirely on its built-in local horology reasoning engine with zero external network calls.

---

## License

This project is licensed under the MIT License.
