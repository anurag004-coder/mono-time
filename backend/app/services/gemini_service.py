import os
import re
from typing import Dict, Any, List, Tuple, Optional
from app.config import settings
from app.services.rate_limiter import budget_shield, response_cache

def get_sources_for_response(
    user_message: str,
    product_dict: Optional[Dict[str, Any]] = None,
    agent_type: str = "concierge",
) -> List[str]:
    """Exposes source document names for retrieved RAG chunks, product specs, and atelier policies."""
    msg = user_message.lower()
    sources: List[str] = []

    # Specific product spec sheet if single product was the focus
    if product_dict and product_dict.get("title"):
        sources.append(f"Spec sheet: {product_dict['title']}")

    # Mentioned watches in user message or context
    if any(k in msg for k in ["titan", "edge"]):
        sources.append("Spec sheet: Titan Edge Minimalist Slate Steel")
    if any(k in msg for k in ["raga"]):
        sources.append("Spec sheet: Titan Raga Collection")
    if any(k in msg for k in ["casio", "edifice"]):
        sources.append("Spec sheet: Casio Edifice Solar Speed Chronograph")
    if any(k in msg for k in ["retro", "vintage", "a168"]):
        sources.append("Spec sheet: Casio Vintage A168 Retro Chrome")
    if any(k in msg for k in ["timex", "waterbury"]):
        sources.append("Spec sheet: Timex Waterbury Heritage Mechanical")
    if any(k in msg for k in ["marlin"]):
        sources.append("Spec sheet: Timex Marlin Automatic")
    if any(k in msg for k in ["fossil", "jacqueline"]):
        sources.append("Spec sheet: Fossil Jacqueline Blush Leather")
    if any(k in msg for k in ["neutra"]):
        sources.append("Spec sheet: Fossil Neutra Roman Chronograph")
    if any(k in msg for k in ["diver", "oceanic"]):
        sources.append("Spec sheet: Oceanic Pro Diver 300M Automatic")
    if any(k in msg for k in ["aurora", "petite"]):
        sources.append("Spec sheet: Aurora Petite Milanese Mesh")

    # Policy documents
    if any(k in msg for k in ["small", "smaller", "wrist", "size", "fit", "diameter", "lug", "sizing"]):
        sources.append("Bespoke Sizing & Atelier Guide")
    if any(k in msg for k in ["track", "order", "status", "shipment", "delivery", "dispatch"]):
        sources.append("Logistics & Insured Transit Policy")
    if any(k in msg for k in ["warranty", "guarantee", "defect"]):
        sources.append("2-Year International Warranty Terms")
    if any(k in msg for k in ["return", "exchange", "refund"]):
        sources.append("14-Day Insured Return Policy")
    if any(k in msg for k in ["authentic", "authenticity", "genuine"]):
        sources.append("Certificate of Authenticity Standards")
    if any(k in msg for k in ["care", "cleaning", "demagnetiz", "maintenance"]):
        sources.append("Haute Horology Care Manual")
    if any(k in msg for k in ["privacy", "security", "data", "payment"]):
        sources.append("Client Data & Security Protocol")

    if not sources:
        sources.append("Mono Time Horological Reference Manual")

    # Deduplicate while preserving order
    return list(dict.fromkeys(sources))


def call_gemini_concierge(
    user_message: str,
    product_dict: Optional[Dict[str, Any]] = None,
    all_products: Optional[List[Dict[str, Any]]] = None,
    chat_history: Optional[List[dict]] = None,
) -> Tuple[str, List[str], str]:
    """
    Mono Time AI Horology Concierge:
    Handles any shopper inquiry with sartorial and technical horological accuracy.
    Guarded by the Budget Shield:
    - Checks in-memory cache first to eliminate redundant calls.
    - If Gemini API is available and daily/hourly limits are not exceeded, invokes Gemini 1.5 Flash.
    - Enforces hard daily/hourly limits so live traffic never incurs unanticipated bills.
    - Seamlessly falls back to the deterministic horology reasoning engine ($0.00 cost).
    """
    msg_lower = user_message.lower().strip()
    cache_key = f"{msg_lower}:{product_dict.get('id') if product_dict else 'global'}"

    cached = response_cache.get(cache_key)
    if cached:
        text, prompts, agent_type, _ = cached
        return text, prompts, agent_type

    # =========================================================================
    # 1. Wrist Sizing & Proportion Intelligence
    # =========================================================================

    # A. "Smaller Wrists" / Petite / Slender Wrist Recommendation Query
    if any(k in msg_lower for k in [
        "smaller wrist", "small wrist", "petite wrist", "slender wrist", 
        "thin wrist", "narrow wrist", "wrist is small", "wrists are small",
        "best on smaller wrists", "watches for smaller wrists", "watches for small wrists"
    ]) or ("small" in msg_lower and "wrist" in msg_lower and not ("will this" in msg_lower or "will it" in msg_lower)):
        answer = (
            "**Recommended Timepieces for Smaller & Slender Wrists:**\n\n"
            "For wrists under 6.5″ (16.5 cm), watches with case diameters between **28 mm and 38 mm** "
            "and lug-to-lug spans **under 44 mm** look best, as they sit flush without lug overhang.\n\n"
            "Here are the premier references from the Mono Time catalogue tailored for smaller wrists:\n\n"
            "• **Timex Waterbury Heritage Mechanical** (38 mm · 44 mm lug-to-lug · ₹14,995)\n"
            "  Classic vintage diameter with curved downward lugs and supple Horween leather that wraps naturally around leaner wrists.\n\n"
            "• **Casio Vintage A168 Retro Chrome** (36 mm · 38.6 mm lug-to-lug · ₹4,295)\n"
            "  Compact retro case with an easily adjustable sliding steel clasp—an effortless fit on any slender wrist.\n\n"
            "• **Titan Edge Minimalist Slate Steel** (40 mm · 46.5 mm lug-to-lug · ₹24,999)\n"
            "  Although 40 mm, its razor-thin **7.2 mm profile** and low-mass architecture drape completely flat, wearing like a 37 mm piece.\n\n"
            "• **Fossil Jacqueline Blush Leather** (34 mm · 38 mm lug-to-lug · ₹11,995)\n"
            "  Refined 34 mm diameter with an 8 mm profile and soft Italian leather for elegant, understated presence.\n\n"
            "• **Aurora Petite Milanese Mesh** (32 mm · 36 mm lug-to-lug · ₹15,495)\n"
            "  Ultra-svelte 6.5 mm Scandinavian silhouette with micro-adjustable rose gold mesh.\n\n"
            "*(Tip: Specify your wrist measurement at checkout for complimentary bespoke bracelet sizing before dispatch.)*"
        )
        suggested = [
            "Will the 38mm Timex Waterbury fit my wrist?",
            "Show Titan Edge Minimalist Slate Steel",
            "How do I request complimentary bracelet sizing?",
        ]
        response_cache.set(cache_key, answer, suggested, "stylist", ["Bespoke Sizing & Atelier Guide", "Spec sheet: Timex Waterbury Heritage Mechanical"])
        return answer, suggested, "stylist"

    # B. "Larger Wrists" / Broad Wrists Recommendation Query
    if any(k in msg_lower for k in [
        "larger wrist", "large wrist", "broad wrist", "wide wrist", "big wrist",
        "watches for large wrists", "best on large wrists", "wrist is big"
    ]):
        answer = (
            "**Recommended Timepieces for Broader Wrists (7.0″+):**\n\n"
            "For wrists measuring 7 inches (17.8 cm) or broader, substantial case diameters between **41 mm and 44 mm** "
            "with lug-to-lug spans of 48 mm to 50 mm achieve commanding, balanced proportions.\n\n"
            "• **Casio Edifice Solar Speed Chronograph** (44 mm · 49 mm lug-to-lug · ₹16,495)\n"
            "  Motorsport-inspired presence with integrated steel bracelet and 100-meter water resistance.\n\n"
            "• **Oceanic Pro Diver 300M Automatic** (42 mm · 49.5 mm lug-to-lug · ₹29,995)\n"
            "  Professional dive architecture with substantial 13.2 mm case thickness and diver extension clasp.\n\n"
            "• **Fossil Neutra Roman Chronograph** (42 mm · 48 mm lug-to-lug · ₹13,495)\n"
            "  Architectural gunmetal case with Roman numeral indices and rich saddle leather strap.\n\n"
            "*(Complimentary expansion links are included upon request for broader wrist drapes.)*"
        )
        suggested = [
            "Show Casio Edifice Solar Chrono details",
            "Show Oceanic Pro Diver 300M",
            "Apply code MONOTIME10",
        ]
        response_cache.set(cache_key, answer, suggested, "stylist", ["Bespoke Sizing & Atelier Guide", "Spec sheet: Casio Edifice Solar Speed Chronograph"])
        return answer, suggested, "stylist"

    # C. Specific Wrist Dimension Check (e.g. "Will this fit a 6.5 inch wrist?" or specific inches/cm)
    wrist_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:inch|inches|″|\"|cm)", msg_lower)
    if ("fit" in msg_lower or "will it" in msg_lower or "will this" in msg_lower or "wrist" in msg_lower) and (wrist_match or "6.5" in msg_lower or "7" in msg_lower or "6" in msg_lower):
        wrist_val = 6.5
        is_cm = False
        if wrist_match:
            try:
                raw_num = float(wrist_match.group(1))
                if "cm" in msg_lower and raw_num > 10:
                    wrist_val = raw_num / 2.54
                    is_cm = True
                else:
                    wrist_val = raw_num
            except Exception:
                wrist_val = 6.5

        # Calculate approximate flat top width of wrist (circumference * 25.4 * ~0.32)
        flat_wrist_mm = round(wrist_val * 25.4 * 0.32, 1)

        watch_title = product_dict.get("title", "Titan Edge Minimalist") if product_dict else "40 mm Timepiece"
        specs = product_dict.get("specs", {}) if product_dict else {}
        lug_str = specs.get("lugToLug", "46.5 mm")
        lug_num = 46.5
        try:
            lug_num = float(re.search(r"(\d+(?:\.\d+)?)", lug_str).group(1))
        except Exception:
            lug_num = 46.5

        clearance = flat_wrist_mm - lug_num
        if clearance >= 3.0:
            fit_verdict = f"**Excellent fit with zero overhang**. The {lug_num} mm lug-to-lug leaves approximately {round(clearance/2, 1)} mm of border clearance on either side of your carpal bones."
        elif clearance >= -1.0:
            fit_verdict = f"**Close borderline fit**. The {lug_num} mm lug-to-lug spans almost the exact width of your {flat_wrist_mm} mm wrist. Downward curved lugs keep it flush, but you may prefer a compact case (<38 mm) if you prefer zero overhang."
        else:
            fit_verdict = f"**May overhang**. A {lug_num} mm lug span exceeds your flat wrist top of ~{flat_wrist_mm} mm. We recommend references with lug-to-lug under {round(flat_wrist_mm - 2, 0)} mm."

        answer = (
            f"**Mono Time Wrist Proportions Analysis for {watch_title}:**\n\n"
            f"• **Your Wrist Profile**: {wrist_val:.1f}″ ({round(wrist_val * 2.54, 1)} cm) circumference yields an anatomical flat width of approximately **{flat_wrist_mm} mm**.\n"
            f"• **Watch Dimensions**: Case diameter {specs.get('caseDiameter', '40 mm')} with a lug-to-lug distance of **{lug_num} mm** and thickness of {specs.get('caseThickness', '7.2 mm')}.\n"
            f"• **Verdict**: {fit_verdict}\n\n"
            f"• **Complimentary Atelier Sizing**: Enter your {wrist_val:.1f}″ measurement in the order notes, and our certified master watchmakers will adjust the bracelet before insured dispatch."
        )
        suggested = [
            "What watches look best on smaller wrists?",
            "How do I request complimentary bracelet sizing?",
            "Apply code MONOTIME10",
        ]
        return answer, suggested, "stylist"

    # =========================================================================
    # 2. Curated Collection Recommendations & Search
    # =========================================================================

    # Women's Collection
    if any(k in msg_lower for k in ["women", "womens", "women's", "ladies", "gift for her", "jewelry"]):
        answer = (
            "**Mono Time Curated Women's & Jewelry Collection:**\n\n"
            "• **Titan Raga Flora Sculpted Bangle** (₹18,995): Natural mother-of-pearl dial with Swarovski crystal petal motifs.\n"
            "• **Casio Sheen Tonneau Gold** (₹12,995): High-polish gold tonneau silhouette with faceted sapphire crystal.\n"
            "• **Fossil Jacqueline Blush Leather** (₹11,995): 34 mm rose-gold case on supple blush Italian leather.\n"
            "• **Aurora Petite Milanese Mesh** (₹15,495): Ultra-slim 6.5 mm profile with rose-gold Milanese mesh.\n"
            "• **Titan Raga Emerald Ceramic** (₹17,995): Rich emerald ceramic and rose-gold links with faceted crystal.\n\n"
            "All women's references include complimentary gift packaging, warranty card, and code **MONOTIME10** for 10% off."
        )
        suggested = [
            "Show Titan Raga Flora details",
            "Show Casio Sheen Tonneau details",
            "Apply promo code MONOTIME10",
        ]
        return answer, suggested, "stylist"

    # Men's Collection
    if any(k in msg_lower for k in ["men's", "mens", "male", "gentlemen", "gift for him"]):
        answer = (
            "**Mono Time Curated Men's Collection:**\n\n"
            "• **Titan Edge Minimalist Slate Steel** (₹24,999): Razor-thin 7.2 mm profile in 316L steel with sapphire glass.\n"
            "• **Casio Edifice Solar Speed Chronograph** (₹16,495): High-precision solar chronograph with 10 ATM rating.\n"
            "• **Timex Waterbury Heritage Mechanical** (₹14,995): 21-jewel hand-wound mechanical horology on Horween leather.\n"
            "• **Oceanic Pro Diver 300M Automatic** (₹29,995): Automatic diver with ceramic bezel and 30 ATM rating.\n"
            "• **Fossil Neutra Roman Chronograph** (₹13,495): Gunmetal executive chronograph with Roman numerals."
        )
        suggested = [
            "Which men's watch is best for a formal suit?",
            "Compare Titan Edge with Timex Waterbury",
            "Apply code MONOTIME10",
        ]
        return answer, suggested, "stylist"

    # Mechanical & Automatic Watches
    if any(k in msg_lower for k in ["mechanical", "automatic", "hand-wound", "winding", "calibre", "jewel"]):
        answer = (
            "**Mechanical & Automatic References at Mono Time:**\n\n"
            "• **Oceanic Pro Diver 300M Automatic** (₹29,995): Calibre 8215 automatic self-winding movement with 42-hour power reserve and 300-meter depth rating.\n"
            "• **Timex Waterbury Heritage Mechanical** (₹14,995): 21-jewel tactile hand-wound calibre celebrating classic watchmaking rituals—requires no battery.\n"
            "• **Titan Grandmaster Skeleton Automatic** (₹26,995): Openwork dial showcasing balance wheel oscillations at 21,600 vph.\n"
            "• **Timex Marlin Automatic Emerald Malachite** (₹18,495): Miyota 21-jewel automatic movement with striking malachite green dial."
        )
        suggested = [
            "How does a mechanical watch compare to quartz?",
            "What warranty covers mechanical movements?",
            "Apply voucher MONOTIME10",
        ]
        return answer, suggested, "rag"

    # Sartorial & Attire Pairing (Suits, Tuxedos, Weddings)
    if any(k in msg_lower for k in ["suit", "formal", "tuxedo", "black tie", "black-tie", "wear", "wedding", "office", "shirt"]):
        answer = (
            "**Sartorial Horology Guidance from Mono Time:**\n\n"
            "• **Black-Tie / Tuxedo**: Understated elegance is mandatory. An ultra-slim dress watch like the **Titan Edge Slate Steel** (7.2 mm) or **Timex Waterbury Heritage** on clean leather is ideal—never bulky chronographs or colorful dive bezels.\n"
            "• **Business Suits (Navy / Charcoal)**: The clean anthracite dial and polished chamfers of the 316L steel Titan Edge offer sharp executive distinction.\n"
            "• **Cuff Drape Rule**: The watch case must effortlessly slide beneath stiff shirt cuffs without bunching fabric.\n"
            "• **Cocktail / Galas (Women)**: Pair the **Titan Raga Flora** or **Casio Sheen Tonneau** with gold evening accents."
        )
        suggested = [
            "Show Titan Edge Minimalist Slate Steel",
            "Show Timex Waterbury Vintage",
            "Apply discount voucher MONOTIME10",
        ]
        return answer, suggested, "stylist"

    # Water Resistance & Diving
    if any(k in msg_lower for k in ["water", "swim", "dive", "diving", "atm", "meters", "submerged", "shower"]):
        answer = (
            "**Water Resistance Standards at Mono Time:**\n\n"
            "• **Oceanic Pro Diver 300M**: **30 ATM (300 meters / 1,000 ft)** — Certified for scuba diving, ocean swimming, and high-pressure watersports.\n"
            "• **Casio Edifice Solar Speed**: **10 ATM (100 meters / 330 ft)** — Safe for recreational swimming and watersports.\n"
            "• **Titan Edge Minimalist & Timex Waterbury**: **5 ATM (50 meters / 165 ft)** — Resists heavy rain, splashes, and shallow immersion.\n"
            "• **Titan Raga & Fossil Jacqueline**: **3 ATM (30 meters)** — Light splashes only; remove before showering or bathing.\n\n"
            "*(Never actuate crowns or pushers while underwater.)*"
        )
        suggested = [
            "Show Oceanic Pro Diver 300M",
            "Show Casio Edifice Solar Chrono",
            "Apply code MONOTIME10",
        ]
        return answer, suggested, "rag"

    # =========================================================================
    # 3. Store Client Services & Support
    # =========================================================================

    # Order Tracking
    if any(k in msg_lower for k in ["track", "order", "status", "shipment", "courier", "delivery"]):
        answer = (
            "**Mono Time Order Tracking & Insured Transit Concierge:**\n\n"
            "• **Insured Courier**: Every order is dispatched within 24 hours in tamper-evident, climate-protected packaging with signature confirmation.\n"
            "• **Track Your Order**: To look up tracking coordinates, reply with your **6-digit Order ID** (found in your email/SMS confirmation) or registered email address.\n"
            "• **Transit Time**: Metro cities arrive within **24–48 hours**; global deliveries within **3–5 business days**.\n"
            "• **Concierge Desk**: You may also reach our logistics team at **tracking@monotime.com**."
        )
        suggested = [
            "How do I request complimentary bracelet sizing?",
            "What is your return policy?",
            "Apply promo code MONOTIME10",
        ]
        return answer, suggested, "concierge"

    # Complimentary Sizing
    if any(k in msg_lower for k in ["sizing service", "strap adjustment", "adjust links", "remove links", "bracelet sizing", "pre-dispatch"]):
        answer = (
            "**Complimentary Pre-Dispatch Atelier Sizing:**\n\n"
            "• **Tailored to Your Wrist**: Mono Time's master watchmakers size your steel bracelet or leather strap to your exact wrist circumference before your timepiece departs our vault.\n"
            "• **How to Specify**: Simply enter your wrist measurement (e.g. *6.5 inches* or *16.5 cm*) in the checkout notes, or message us here in chat.\n"
            "• **Preserved Links**: All removed links are packaged securely inside your luxury presentation box with a complimentary pin tool.\n"
            "• **Expansion Guarantee**: If extra room is needed, up to two factory expansion links are provided free of charge."
        )
        suggested = [
            "What watches look best on smaller wrists?",
            "What is the return policy?",
            "Proceed to secure checkout",
        ]
        return answer, suggested, "stylist"

    # Warranty & Authenticity
    if any(k in msg_lower for k in ["warranty", "guarantee", "defect", "covered"]):
        answer = (
            "**Mono Time 2-Year International Manufacturer Warranty:**\n\n"
            "• **Full Calibre Protection**: Covers mechanical movement regulation, quartz modules, crystal gaskets, and manufacturing defects for 2 full years.\n"
            "• **Certificate of Authenticity**: Every piece includes a serialized, tamper-proof Certificate of Authenticity.\n"
            "• **Authorized Servicing**: Servicing is honored across authorized brand service centers and our master horologist network."
        )
        suggested = [
            "How does Mono Time verify authenticity?",
            "What is the return policy?",
            "Apply code MONOTIME10",
        ]
        return answer, suggested, "rag"

    # Returns & Exchanges
    if any(k in msg_lower for k in ["return", "exchange", "refund", "money back"]):
        answer = (
            "**Mono Time 14-Day Insured Return & Exchange Portal:**\n\n"
            "• **14-Day Evaluation Window**: If the case proportions, wrist drape, or aesthetic presence do not satisfy you, initiate a return within 14 days of receipt.\n"
            "• **Doorstep Pickup**: We arrange complimentary insured express pickup from your residence at zero fee.\n"
            "• **Zero Restocking Fees**: 100% full refund processed within 48 hours of inspection.\n"
            "• **Requirement**: Timepieces must be unworn with original protective film and documentation intact."
        )
        suggested = [
            "Track an existing order",
            "Request complimentary bracelet sizing",
            "Contact concierge hotline",
        ]
        return answer, suggested, "concierge"

    # Authenticity
    if any(k in msg_lower for k in ["authentic", "authenticity", "genuine", "original", "counterfeit"]):
        answer = (
            "**Mono Time 100% Authenticity Guarantee:**\n\n"
            "• **Direct Brand Lineage**: Every piece is acquired directly from brand manufactures (Titan, Casio, Timex, Fossil, Aethelgard) or accredited authorized distributor vaults.\n"
            "• **12-Point Inspection**: Master horologists verify movement amplitude, hand alignment, laser-engravings, and serial number registration prior to delivery.\n"
            "• **Digital NFC / QR Card**: Included with every order for lifelong provenance and authenticity verification."
        )
        suggested = [
            "What warranty is provided?",
            "Show curated collection",
            "Apply code MONOTIME10",
        ]
        return answer, suggested, "rag"

    # Discounts & Coupons
    if any(k in msg_lower for k in ["discount", "coupon", "code", "offer", "voucher", "promo"]):
        answer = (
            "**Exclusive Privilege for Mono Time Clients:**\n\n"
            "• **Active Promo Code**: Apply **MONOTIME10** at checkout to receive **10% off** across the entire timepiece collection.\n"
            "• **Complimentary Privileges**: Includes free insured express delivery, 2-Year International Warranty, and complimentary bracelet sizing.\n"
            "• **How to Redeem**: Enter **MONOTIME10** in the shopping bag drawer or during final checkout."
        )
        suggested = [
            "Open Shopping Bag",
            "What watches look best on smaller wrists?",
            "View featured timepieces",
        ]
        return answer, suggested, "concierge"

    # Greetings & Boutique Identity
    if any(k in msg_lower for k in ["hello", "hi", "hey", "who are you", "what is this", "mono time"]):
        answer = (
            "Greetings and welcome to **Mono Time**. I am your dedicated AI Horology Concierge.\n\n"
            "I can assist you with:\n"
            "• **Wrist Proportions & Sizing**: Calculating case diameter, lug-to-lug, and overhang for your wrist.\n"
            "• **Sartorial Styling**: Pairing watches with bespoke suits, evening galas, or everyday wear.\n"
            "• **Curated References**: Recommending mechanical, solar, quartz, or jewelry timepieces from Titan, Casio, Timex, Fossil, and Aethelgard.\n"
            "• **Client Privileges**: Complimentary bracelet sizing, 2-Year Global Warranty, and insured delivery.\n\n"
            "What style, occasion, or wrist measurement can I assist you with today?"
        )
        suggested = [
            "What watches look best on smaller wrists?",
            "Which watch pairs best with a navy suit?",
            "Tell me about the Timex mechanical watch",
        ]
        return answer, suggested, "concierge"

    # =========================================================================
    # 4. Live Gemini API Call (Guarded by Budget Shield)
    # =========================================================================
    api_key = getattr(settings, "GEMINI_API_KEY", "") or os.getenv("GEMINI_API_KEY", "")

    if api_key and budget_shield.can_call_gemini():
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=(
                    "You are the elite AI Horology Concierge for 'Mono Time', a luxury watch boutique. "
                    "You provide sartorially astute and technically accurate guidance on timepieces, "
                    "case diameters (28mm–44mm), lug-to-lug proportions, movements (quartz, automatic, mechanical hand-wound), "
                    "materials (316L surgical steel, sapphire crystal, ceramic), and boutique services (pre-dispatch sizing, "
                    "2-year warranty, 14-day insured returns, 10% code MONOTIME10). "
                    "For smaller wrists (under 6.5″ / 16.5cm), recommend cases between 28mm and 38mm with lug-to-lug under 44mm "
                    "(e.g. Timex Waterbury 38mm, Casio Vintage 36mm, Fossil Jacqueline 34mm, Aurora Petite 32mm, Titan Edge 7.2mm). "
                    "Keep answers concise (under 140 words), elegant, structured with bullet points, and authoritative. "
                    "Do NOT invent watch brands outside Mono Time's catalog (Titan, Casio, Timex, Fossil, Aethelgard)."
                ),
                generation_config={
                    "max_output_tokens": 250,
                    "temperature": 0.3,
                }
            )
            response = model.generate_content(user_message)
            if response and response.text and response.text.strip():
                gemini_text = response.text.strip()
                budget_shield.record_gemini_call()
                suggested_res = [
                    "What watches look best on smaller wrists?",
                    "How do I request complimentary bracelet sizing?",
                    "Apply code MONOTIME10",
                ]
                sources_res = get_sources_for_response(user_message, product_dict, "gemini")
                response_cache.set(cache_key, gemini_text, suggested_res, "gemini", sources_res)
                return gemini_text, suggested_res, "gemini"
        except Exception as e:
            print(f"[Gemini Concierge fallback to local engine]: {e}")

    # =========================================================================
    # 5. Intelligent Default Concierge Response
    # =========================================================================
    answer = (
        f"Thank you for contacting **Mono Time Concierge**.\n\n"
        f"Regarding your inquiry ('*{user_message}*'): our curated collection features premier references from "
        f"**Titan**, **Casio**, **Timex**, **Fossil**, and **Aethelgard**.\n\n"
        f"• **Bespoke Proportions**: Every timepiece is matched with our anatomical wrist-sizing guide to guarantee zero lug overhang.\n"
        f"• **Atelier Privileges**: Includes complimentary pre-dispatch bracelet sizing, our **2-Year Global Warranty**, and serialized Certificate of Authenticity.\n"
        f"• **Exclusive Code**: Apply voucher code **MONOTIME10** to enjoy 10% savings with complimentary worldwide insured delivery.\n\n"
        f"Would you like me to inspect wrist proportions, explore dress watches for suits, or assist with bracelet sizing?"
    )
    suggested = [
        "What watches look best on smaller wrists?",
        "Will a 40mm watch fit my wrist?",
        "Show me classic mechanical watches",
    ]
    sources = get_sources_for_response(user_message, product_dict, "concierge")
    response_cache.set(cache_key, answer, suggested, "concierge", sources)
    return answer, suggested, "concierge"
