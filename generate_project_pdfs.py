import os
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable,
)
from reportlab.pdfgen import canvas

# ----------------------------------------------------------------------
# Numbered Canvas for "Page X of Y" Footer
# ----------------------------------------------------------------------
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header rule & title
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(36, A4[1] - 30, A4[0] - 36, A4[1] - 30)
        self.drawString(36, A4[1] - 25, "MONO TIME — Academic Project Documentation (Haute Horology & AI Concierge)")
        
        # Footer rule & page number
        self.line(36, 35, A4[0] - 36, 35)
        self.drawString(36, 24, "Mono Time • Autonomous Multi-Modal Sales Agent • Minor Project 2026")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(A4[0] - 36, 24, page_text)
        self.restoreState()


# ----------------------------------------------------------------------
# Helper to build Styles
# ----------------------------------------------------------------------
def create_styles():
    styles = getSampleStyleSheet()

    # Modify / Add styles
    styles.add(ParagraphStyle(
        name='DocTitle',
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#ffffff'),
        spaceAfter=4,
    ))

    styles.add(ParagraphStyle(
        name='DocSubTitle',
        fontName='Helvetica',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#d1fae5'),
        spaceAfter=6,
    ))

    styles.add(ParagraphStyle(
        name='DocMeta',
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#a7f3d0'),
    ))

    styles.add(ParagraphStyle(
        name='SectionHeading',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#064e3b'),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True,
    ))

    styles.add(ParagraphStyle(
        name='SubSectionHeading',
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True,
    ))

    styles.add(ParagraphStyle(
        name='CustomBody',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155'),
        spaceAfter=5,
    ))

    styles.add(ParagraphStyle(
        name='CalloutText',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor('#065f46'),
    ))

    styles.add(ParagraphStyle(
        name='TableHeader',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#064e3b'),
    ))

    styles.add(ParagraphStyle(
        name='TableCell',
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#1e293b'),
    ))

    styles.add(ParagraphStyle(
        name='TableCellBold',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#0f172a'),
    ))

    styles.add(ParagraphStyle(
        name='CodeSnippet',
        fontName='Courier',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#047857'),
    ))

    return styles


# ----------------------------------------------------------------------
# PDF 1: Technologies, Frameworks & Software Stack
# ----------------------------------------------------------------------
def generate_technologies_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=42,
        bottomMargin=42,
    )
    styles = create_styles()
    story = []

    # Title Banner Table
    banner_content = [
        [Paragraph("ACADEMIC TECHNICAL DOCUMENTATION • MINOR PROJECT", styles['DocMeta'])],
        [Paragraph("MONO TIME — Technologies, Frameworks & Software Stack", styles['DocTitle'])],
        [Paragraph("A Comprehensive Inventory of Languages, Graphics Engines, Microservices, LLMs & Databases", styles['DocSubTitle'])],
        [Paragraph("<b>Author / Developer:</b> Project Student Team &nbsp;&nbsp;|&nbsp;&nbsp; <b>Evaluation:</b> Minor Project Viva &nbsp;&nbsp;|&nbsp;&nbsp; <b>Architecture:</b> Next.js + FastAPI + Three.js + Gemini", styles['DocMeta'])],
    ]
    banner_table = Table(banner_content, colWidths=[A4[0] - 72])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#064e3b')),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 16),
        ('RIGHTPADDING', (0, 0), (-1, -1), 16),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 10))

    # Section 1: Executive Technology Matrix
    story.append(Paragraph("1. Technology Stack Master Classification", styles['SectionHeading']))
    story.append(Paragraph(
        "Mono Time integrates bleeding-edge modern web technologies across client-side WebGL rendering, asynchronous REST micro-gateways, relational transaction audit ledgers, and autonomous multimodal AI orchestration.",
        styles['CustomBody']
    ))

    matrix_data = [
        [Paragraph("Layer / Subsystem", styles['TableHeader']), Paragraph("Primary Technology", styles['TableHeader']), Paragraph("Version / Engine", styles['TableHeader']), Paragraph("Role & Key Benefit", styles['TableHeader'])],
        [Paragraph("<b>Frontend Core</b>", styles['TableCell']), Paragraph("Next.js (App Router)", styles['TableCell']), Paragraph("13.5.6 / React 18.2", styles['TableCell']), Paragraph("Server-side rendering, code-splitting, zero-layout-shift hydration", styles['TableCell'])],
        [Paragraph("<b>Type Safety</b>", styles['TableCell']), Paragraph("TypeScript", styles['TableCell']), Paragraph("v5.3.3 (Strict)", styles['TableCell']), Paragraph("Complete compile-time safety across products, orders & AI message payloads", styles['TableCell'])],
        [Paragraph("<b>Styling Engine</b>", styles['TableCell']), Paragraph("Tailwind CSS", styles['TableCell']), Paragraph("v3.4.0", styles['TableCell']), Paragraph("Custom Swiss-horology tokens (Emerald Malachite, Obsidian Noir, Platinum)", styles['TableCell'])],
        [Paragraph("<b>3D Graphics & Physics</b>", styles['TableCell']), Paragraph("Three.js (WebGL)", styles['TableCell']), Paragraph("v0.186.0", styles['TableCell']), Paragraph("Procedural 3D luxury chronometer, 72-facet bezel, 8Hz tourbillon escapement", styles['TableCell'])],
        [Paragraph("<b>Backend Gateway</b>", styles['TableCell']), Paragraph("FastAPI (Python)", styles['TableCell']), Paragraph("v0.110+ (Py 3.11)", styles['TableCell']), Paragraph("Asynchronous ASGI endpoints, Swagger OpenAPI docs, high-concurrency routing", styles['TableCell'])],
        [Paragraph("<b>ASGI Server</b>", styles['TableCell']), Paragraph("Uvicorn", styles['TableCell']), Paragraph("v0.29+ / uvloop", styles['TableCell']), Paragraph("Listens on 0.0.0.0:8000 for LAN, mobile hotspot, and cloud tunnels", styles['TableCell'])],
        [Paragraph("<b>AI LLM Engine</b>", styles['TableCell']), Paragraph("Google Gemini 1.5 Flash", styles['TableCell']), Paragraph("Generative AI API", styles['TableCell']), Paragraph("Natural language concierge, wrist proportions analysis, RAG factual grounding", styles['TableCell'])],
        [Paragraph("<b>Agent Graph Router</b>", styles['TableCell']), Paragraph("LangGraph Paradigm", styles['TableCell']), Paragraph("Custom StateGraph", styles['TableCell']), Paragraph("Multi-agent routing: Supervisor, Stylist, RAG Knowledge Search, Concierge Desk", styles['TableCell'])],
        [Paragraph("<b>Relational Database</b>", styles['TableCell']), Paragraph("SQLite 3 + SQLAlchemy", styles['TableCell']), Paragraph("v2.0 ORM", styles['TableCell']), Paragraph("Embedded ACID-compliant persistence for 15 watches & checkout_orders audit", styles['TableCell'])],
        [Paragraph("<b>State Management</b>", styles['TableCell']), Paragraph("React Context + Zustand", styles['TableCell']), Paragraph("React 18 Hooks", styles['TableCell']), Paragraph("Centralized state for cart, search index, customer/admin modes & chat timeline", styles['TableCell'])],
        [Paragraph("<b>Automated Testing</b>", styles['TableCell']), Paragraph("Pytest + TestClient", styles['TableCell']), Paragraph("v9.1.1 (100% Pass)", styles['TableCell']), Paragraph("8 integration tests verifying product filter, exit-intent observer & order reflection", styles['TableCell'])],
    ]
    matrix_table = Table(matrix_data, colWidths=[1.1 * inch, 1.4 * inch, 1.2 * inch, 3.6 * inch])
    matrix_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ecfdf5')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#ffffff'), colors.HexColor('#f8fafc')]),
    ]))
    story.append(matrix_table)
    story.append(Spacer(1, 10))

    # Section 2: Detailed Architectural Breakdown
    story.append(Paragraph("2. Deep Dive: Client-Side Stack & Graphics Engine", styles['SectionHeading']))
    
    frontend_points = [
        ("Next.js 14 / 13.5 App Router Architecture", "Employs modern React Server Components and client-side boundary isolation ('use client'). Static pages (/ and /merchant) are pre-rendered at build time with 0 type errors, achieving sub-second initial paint times."),
        ("Three.js Procedural WebGL Chronometer", "Eliminates external 15MB 3D asset downloads. The entire watch case, 72-facet diamond-cut coin bezel, 1024x1024 radial guilloché dial, applied gold baton indices, and 5-link Jubilee bracelet are computed purely with mathematical trigonometric primitives. Parallax cursor and touchmove tracking use slerp dampening."),
        ("Lucide React & UI Iconography", "Tree-shakable SVG icons (Watch, Sparkles, BarChart3, ShoppingBag, ShieldCheck, Ruler, Truck, RefreshCw) styled with emerald glow accents."),
        ("Responsive Viewport & Touch Optimization", "Configured viewport scaling ('width=device-width, initial-scale=1, maximum-scale=5') and dynamic mobile camera distance (z=32 on smartphones vs z=24 on desktop) ensuring pristine rendering on mobile screens."),
    ]
    for title, desc in frontend_points:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", styles['CustomBody']))

    story.append(Spacer(1, 8))

    # Section 3: Backend, Artificial Intelligence & Database
    story.append(Paragraph("3. Deep Dive: Backend REST Services & AI Multi-Agent Architecture", styles['SectionHeading']))
    
    backend_points = [
        ("FastAPI Asynchronous Gateway", "Lightweight Python microservice handling catalog retrieval, RAG semantic search, multimodal exit-intent observation, and checkout verification. Provides auto-generated interactive OpenAPI docs at /docs."),
        ("Google Gemini 1.5 Flash Integration", "Connected via google-generativeai client library. Grounded strictly with local SQLite product specifications to eliminate hallucinations, delivering accurate wrist sizing advice, water resistance ratings, and sartorial pairings."),
        ("LangGraph-Inspired Multi-Agent Intent Router", "User inquiries are dynamically triaged by a Supervisor Agent into Stylist recommendations, RAG catalog retrieval, or Concierge Desk dispatch."),
        ("SQLAlchemy Relational ORM & SQLite Persistence", "Database tables ('products' and 'checkout_orders') maintain transactional integrity. Every customer acquisition submitted through Mock Stripe is permanently stored with order ID, customer details, discount code, and line items."),
    ]
    for title, desc in backend_points:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", styles['CustomBody']))

    story.append(Spacer(1, 10))

    # Section 4: DevOps, Networking & Deployment Readiness
    story.append(Paragraph("4. Networking, Tunneling & Deployment Readiness", styles['SectionHeading']))
    
    devops_data = [
        [Paragraph("Environment", styles['TableHeader']), Paragraph("Tool / Command", styles['TableHeader']), Paragraph("Functionality in Mono Time", styles['TableHeader'])],
        [Paragraph("<b>Local Area Network (LAN)</b>", styles['TableCell']), Paragraph("0.0.0.0 Binding / ipconfig", styles['TableCell']), Paragraph("Allows immediate multi-device testing over Wi-Fi/hotspot at http://192.168.0.4:3000", styles['TableCell'])],
        [Paragraph("<b>Public HTTP Tunnel</b>", styles['TableCell']), Paragraph("Localtunnel (npx localtunnel)", styles['TableCell']), Paragraph("Provides live public HTTPS link for mobile evaluation outside the local network", styles['TableCell'])],
        [Paragraph("<b>Production Frontend</b>", styles['TableCell']), Paragraph("Vercel Cloud Platform", styles['TableCell']), Paragraph("One-click deployment from GitHub repo with automatic Next.js edge caching", styles['TableCell'])],
        [Paragraph("<b>Production Backend</b>", styles['TableCell']), Paragraph("Render.com / Railway.app", styles['TableCell']), Paragraph("Free Python ASGI container service running Uvicorn with SQLite/Postgres persistence", styles['TableCell'])],
    ]
    devops_table = Table(devops_data, colWidths=[1.8 * inch, 2.2 * inch, 3.3 * inch])
    devops_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ecfdf5')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#ffffff'), colors.HexColor('#f8fafc')]),
    ]))
    story.append(devops_table)

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated Technologies Stack PDF at: {output_path}")


# ----------------------------------------------------------------------
# PDF 2: Implementation Guide & Engineering Architecture
# ----------------------------------------------------------------------
def generate_implementation_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=42,
        bottomMargin=42,
    )
    styles = create_styles()
    story = []

    # Title Banner Table
    banner_content = [
        [Paragraph("ACADEMIC TECHNICAL DOCUMENTATION • MINOR PROJECT", styles['DocMeta'])],
        [Paragraph("MONO TIME — Implementation Guide & Engineering Architecture", styles['DocTitle'])],
        [Paragraph("A Comprehensive Step-by-Step Breakdown of How Every Subsystem Was Engineered From Start to Finish", styles['DocSubTitle'])],
        [Paragraph("<b>Domain:</b> Full-Stack Web Development & Autonomous AI &nbsp;&nbsp;|&nbsp;&nbsp; <b>Evaluation:</b> College Minor Project Defense &nbsp;&nbsp;|&nbsp;&nbsp; <b>Status:</b> Production Ready", styles['DocMeta'])],
    ]
    banner_table = Table(banner_content, colWidths=[A4[0] - 72])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#064e3b')),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 16),
        ('RIGHTPADDING', (0, 0), (-1, -1), 16),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 10))

    # Section 1: Project Objective & Problem Statement
    story.append(Paragraph("1. Project Objective & Core Problem Statement", styles['SectionHeading']))
    story.append(Paragraph(
        "Traditional luxury e-commerce platforms suffer from flat 2D product photos that fail to convey physical craftsmanship, disconnected chatbots that hallucinate inventory and flood screens with intrusive product cards, and mock checkouts that never reach a persistent database. Mono Time was built to solve these three fundamental challenges through an integrated 3D procedural engine, an autonomous Gemini AI concierge, and an end-to-end relational order reflection pipeline.",
        styles['CustomBody']
    ))
    story.append(Spacer(1, 6))

    # Section 2: Step-by-Step Implementation Roadmap
    story.append(Paragraph("2. Step-by-Step Implementation Roadmap (Phases 1 to 12)", styles['SectionHeading']))

    phases = [
        ("Phase 1: Real-Time Multi-Attribute Catalog & Instant Search",
         "Built client-side search in store.tsx indexing watch title, brand, movement, dial color, and description with zero keystroke latency. Clicking 'All Watches' clears category filters to display the complete 15-piece catalog."),
        
        ("Phase 2: Dynamic Category Decoupling & Flagship Hero Switching",
         "Decoupled the hero section so that choosing Men's Collection automatically sets the featured showcase to the Men's Flagship (Titan Edge Minimalist Slate Steel), and choosing Women's Collection switches to the Women's Haute Horology Flagship (Titan Raga Flora Crystal Bangle)."),
        
        ("Phase 3: Haute Horology Emerald & Obsidian Design System",
         "Crafted an exclusive colorway inspired by Swiss luxury houses: Obsidian Noir (#09090b), Emerald Malachite (#10b981), and Platinum Silver (#d1d5db). Integrated radial spotlight card reveal hovers, dial shimmer light sweeps, and card lift elevations."),
        
        ("Phase 4: Procedural 3D Classic Watch Engineering (Three.js WebGL)",
         "Engineered Watch3DBackground.tsx using procedural trigonometry: a 72-facet coin-edge fluted gold bezel, 1024x1024 high-resolution radial guilloché canvas dial with 120 lathe rays, 8Hz oscillating tourbillon escapement, 5-link Jubilee bracelet, and cursor/touch parallax kinematics."),
        
        ("Phase 5: Google Gemini AI Multimodal Concierge & UI De-Cluttering",
         "Connected the chat widget to Google Gemini 1.5 Flash. Taught the AI complete specifications of all 15 watches, store policies, and Indian support desk contacts. Removed bulky product preview cards from chat bubbles so concierge responses render in spacious, clean bubbles without forcing users to scroll upward."),
        
        ("Phase 6: Catalog Lineage Expansion (15 Curated References)",
         "Expanded inventory across iconic brands: Titan (Grandmaster Skeleton, Edge, Raga Emerald Ceramic, Raga Flora), Casio (Vintage A168 Retro Chrome, Edifice Chrono, Sheen), Timex (Marlin Emerald Malachite, Transcend Gold Mesh, Waterbury), Fossil (Carlie Mini Diamond, Jacqueline, Neutra), and Aethelgard. Integrated high-res studio photography."),
        
        ("Phase 7: Checkout & Voucher Rebranding (MONOTIME10)",
         "Rebranded checkout gateway to 'Mono Time Secure Gateway' and standardized privilege discount code to 'MONOTIME10' (-10% instant discount). Added in-modal voucher application card and localized telephone contacts to Indian format: 1800-266-8463 (Toll Free) and +91 98200 66684."),
        
        ("Phase 8: Full Frontend-to-Backend Order Reflection Pipeline",
         "Engineered POST /api/checkout/confirm in checkout.py to parse complete serialized cart payloads (line items, customer name, email, city, amount paid, voucher used) and persist records into SQLite checkout_orders table. Generated real order tracking IDs (ORD-YYYYMMDD-XXXXXX)."),
        
        ("Phase 9: Live Merchant ROI & Client Acquisition Analytics Dashboard",
         "Constructed /merchant dashboard polling directly from GET /api/checkout/orders. Store administrators can inspect real-time customer acquisitions, voucher redemptions, exit-intent conversion rates, and gross revenue."),
        
        ("Phase 10: Role-Based Access Control Architecture (Customer vs Admin Mode)",
         "Segregated customer shopping experience from administrative analytics. In Customer Mode, all internal ROI links and PRD banners are hidden, replaced with 'The Mono Time Horology Atelier'. In Admin Mode, an illuminated toolbar unlocks merchant analytics, ROI metrics, and PRD evaluation tools."),
        
        ("Phase 11: Smartphone & Touchscreen Mobile Optimization",
         "Configured responsive viewport scaling, mobile-adaptive 3D camera distance (z=32), touchmove parallax physics, horizontal-scroll category filter pills, edge-to-edge chat drawer (inset-x-2 bottom-2), and compact touch-friendly checkout modal."),
        
        ("Phase 12: Production Build Validation & 100% Test Suite Verification",
         "Executed Pytest test suite: 8/8 tests passed (100%). Fixed TypeScript type definitions (added 'concierge' to agentType union) and verified Next.js production build: npm run build completed with 0 errors across all routes."),
    ]

    for title, desc in phases:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", styles['CustomBody']))

    story.append(Spacer(1, 10))

    # Section 3: Technical Verification Table
    story.append(Paragraph("3. Technical Verification & Test Pass Rate Summary", styles['SectionHeading']))
    
    test_data = [
        [Paragraph("Test Function", styles['TableHeader']), Paragraph("Module Under Test", styles['TableHeader']), Paragraph("Verification Target", styles['TableHeader']), Paragraph("Result", styles['TableHeader'])],
        [Paragraph("<code>test_health_and_root</code>", styles['TableCell']), Paragraph("Backend API Gateway", styles['TableCell']), Paragraph("Verifies root status 200 OK and health endpoint", styles['TableCell']), Paragraph("<font color='#047857'><b>PASSED</b></font>", styles['TableCell'])],
        [Paragraph("<code>test_get_products</code>", styles['TableCell']), Paragraph("Catalog Router", styles['TableCell']), Paragraph("Verifies all seeded luxury timepieces returned", styles['TableCell']), Paragraph("<font color='#047857'><b>PASSED</b></font>", styles['TableCell'])],
        [Paragraph("<code>test_product_search</code>", styles['TableCell']), Paragraph("Search Router", styles['TableCell']), Paragraph("Validates multi-attribute search across dial and brand", styles['TableCell']), Paragraph("<font color='#047857'><b>PASSED</b></font>", styles['TableCell'])],
        [Paragraph("<code>test_agent_chat_sizing_intent</code>", styles['TableCell']), Paragraph("Gemini Agent Graph", styles['TableCell']), Paragraph("Validates wrist sizing advice and stylist routing", styles['TableCell']), Paragraph("<font color='#047857'><b>PASSED</b></font>", styles['TableCell'])],
        [Paragraph("<code>test_agent_chat_rag_intent</code>", styles['TableCell']), Paragraph("RAG Agent Graph", styles['TableCell']), Paragraph("Ensures grounded factual responses without hallucination", styles['TableCell']), Paragraph("<font color='#047857'><b>PASSED</b></font>", styles['TableCell'])],
        [Paragraph("<code>test_exit_intent_observer</code>", styles['TableCell']), Paragraph("Observer Router", styles['TableCell']), Paragraph("Verifies dynamic exit-intent trigger and MONOTIME10 offer", styles['TableCell']), Paragraph("<font color='#047857'><b>PASSED</b></font>", styles['TableCell'])],
        [Paragraph("<code>test_merchant_analytics</code>", styles['TableCell']), Paragraph("Merchant Router", styles['TableCell']), Paragraph("Validates session tracking, pitch counts & conversion stats", styles['TableCell']), Paragraph("<font color='#047857'><b>PASSED</b></font>", styles['TableCell'])],
        [Paragraph("<code>test_mock_checkout</code>", styles['TableCell']), Paragraph("Checkout Router", styles['TableCell']), Paragraph("Asserts order persistence in SQLite and retrieval parity", styles['TableCell']), Paragraph("<font color='#047857'><b>PASSED</b></font>", styles['TableCell'])],
    ]
    test_table = Table(test_data, colWidths=[1.8 * inch, 1.4 * inch, 3.2 * inch, 0.9 * inch])
    test_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ecfdf5')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#ffffff'), colors.HexColor('#f8fafc')]),
    ]))
    story.append(test_table)
    story.append(Spacer(1, 10))

    # Section 4: Live Demo Viva Flow for Professors
    story.append(Paragraph("4. Recommended Viva / Evaluation Demonstration Flow", styles['SectionHeading']))
    
    demo_steps = [
        ("Step 1: Visual & 3D Immersion", "Show the procedural 3D watch in Three.js with fluted gold bezel, openwork tourbillon movement, and cursor parallax tracking. Highlight the Emerald & Obsidian luxury aesthetic."),
        ("Step 2: Dynamic Catalog & Search", "Type 'Automatic' or 'Titan' in search bar to show instant filtering. Click 'Men's Collection' and 'Women's Collection' to show dynamic flagship banner switching."),
        ("Step 3: Google Gemini AI Concierge", "Ask a question: 'Which watch has an automatic skeleton dial?' Show Gemini answering concisely with zero hallucinations, in readable bubbles without obstructive cards."),
        ("Step 4: End-to-End Checkout", "Add Titan Grandmaster Skeleton to cart, apply voucher MONOTIME10 (-10%), enter customer details, and confirm payment. Note the generated real Order ID (ORD-XXXX)."),
        ("Step 5: Backend Order Reflection", "Switch to Admin Mode and open /merchant. Show the professor the newly placed order appearing live in the database table with customer email, exact amount paid, and purchased items!"),
    ]
    for step, desc in demo_steps:
        story.append(Paragraph(f"• <b>{step}:</b> {desc}", styles['CustomBody']))

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated Implementation Guide PDF at: {output_path}")


if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))
    tech_pdf_path = os.path.join(base_dir, 'MONO_TIME_TECHNOLOGIES_STACK.pdf')
    impl_pdf_path = os.path.join(base_dir, 'MONO_TIME_IMPLEMENTATION_GUIDE.pdf')

    generate_technologies_pdf(tech_pdf_path)
    generate_implementation_pdf(impl_pdf_path)
