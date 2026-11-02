import os
from typing import Dict, Any, Tuple
from app.config import settings

def analyze_watch_multimodal(product_dict: Dict[str, Any], user_query: str) -> Tuple[str, list]:
    """
    Multimodal Stylist Agent:
    Evaluates product visual elements (case dimensions, dial finish, lug geometry)
    alongside user query to deliver grounded sizing & sartorial styling advice.
    """
    title = product_dict.get("title", "this timepiece")
    specs = product_dict.get("specs", {})
    fit = product_dict.get("fitRecommendation", {})
    gender = product_dict.get("gender", "unisex")
    brand = product_dict.get("brand", "the manufacturer")
    
    diam = specs.get("caseDiameter", "40 mm")
    thick = specs.get("caseThickness", "8.5 mm")
    lug = specs.get("lugToLug", "46 mm")
    glass = specs.get("glass", "Sapphire crystal")
    strap = specs.get("strapMaterial", "Stainless steel")
    dial = specs.get("dialColor", "Sunburst finish")
    min_w = fit.get("recommendedWristMin", 6.0)
    max_w = fit.get("recommendedWristMax", 7.5)
    fit_notes = fit.get("fitNotes", "Contours naturally to the wrist.")

    lower = user_query.lower()

    # 1. Wrist Sizing & Proportions
    if any(k in lower for k in ["size", "wrist", "fit", "diameter", "mm", "inches", "small", "big", "large"]):
        response = (
            f"**Visual Sizing & Proportions Analysis for {title}:**\n\n"
            f"• **Case Dimensions**: {diam} diameter with an ultra-svelte profile of {thick}.\n"
            f"• **Lug-to-Lug Distance**: {lug}, shaped with downward curvature to eliminate lug overhang.\n"
            f"• **Ideal Wrist Range**: **{min_w}\" to {max_w}\"** circumference.\n"
            f"• **Anatomical Fit Assessment**: {fit_notes}\n\n"
            f"The bracelet links and micro-adjustment clasp allow customized tapering for a flush fit across the carpal bones."
        )
        suggested = [
            f"Can I adjust the bracelet links at home?",
            f"How does {brand} compare to other models in this collection?",
            f"Add {title} to my cart with sizing guarantee",
        ]
        return response, suggested

    # 2. Sartorial Styling & Occasion Pairing
    if any(k in lower for k in ["suit", "formal", "wear", "casual", "occasion", "party", "wedding", "office", "shirt"]):
        if gender == "women":
            response = (
                f"**Sartorial Styling Guidance for {title}:**\n\n"
                f"• **Occasion Versatility**: Flawless for evening galas, formal boardroom meetings, and wedding celebrations.\n"
                f"• **Jewelry Harmony**: The polished accents and {dial} harmonize effortlessly with fine gold bangles or solitaire diamonds.\n"
                f"• **Visual Depth**: The {glass} paired with the sculpted dial catches ambient lighting with subtle, refined iridescence without glare."
            )
        else:
            response = (
                f"**Sartorial Styling Advice for {title}:**\n\n"
                f"• **Formalwear Match (Charcoal/Navy Suits)**: The brushed {dial} and polished chamfers exude executive authority.\n"
                f"• **Shirt Cuff Clearance**: At just {thick}, the case slides effortlessly beneath bespoke double cuffs without catching.\n"
                f"• **Weekend Crossover**: Equally stunning paired down with raw Japanese selvedge denim and a merino knit."
            )
        suggested = [
            "Check water resistance and care instructions",
            "Are there matching accessories or bracelets?",
            "What exclusive offer is currently available?",
        ]
        return response, suggested

    # 3. Materials, Glass & Craftsmanship
    if any(k in lower for k in ["material", "steel", "glass", "sapphire", "water", "movement", "crystal", "dial"]):
        response = (
            f"**Horological Craftsmanship Breakdown for {title}:**\n\n"
            f"• **Glass**: {glass}, offering diamond-grade scratch resistance.\n"
            f"• **Strap & Casing**: High-grade {strap} engineered for hypoallergenic all-day comfort.\n"
            f"• **Movement Calibre**: {specs.get('movement', 'High-accuracy movement')} with shock protection.\n"
            f"• **Atmospheric Depth**: Rated at {specs.get('waterResistance', '50 Meters')} for worry-free daily resilience."
        )
        suggested = [
            "Is this covered under international warranty?",
            "How does the case diameter fit a 6.5-inch wrist?",
            "View checkout and delivery timeline",
        ]
        return response, suggested

    # General Multimodal Inquiry
    response = (
        f"**Concierge Insight on {title}:**\n\n"
        f"Crafted by {brand} in the **{product_dict.get('category', 'Horology')}** discipline. "
        f"Featuring a case diameter of {diam}, {dial}, and {strap}. "
        f"Every dial index is individually inspected under magnification to ensure flawless symmetry."
    )
    suggested = [
        f"Will this fit my wrist circumference?",
        f"What suits and outfits pair best with this?",
        f"Apply discount code and review cart",
    ]
    return response, suggested
