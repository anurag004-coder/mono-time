import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timedelta
from app.database import Base, engine, SessionLocal
from app.models.product import ProductModel
from app.models.session import SessionModel
from app.models.pitch import PitchEventModel
from app.models.checkout import CheckoutOrderModel

PRODUCTS_DATA = [
    {
        "id": "titan-edge-slate",
        "title": "Titan Edge Minimalist Slate Steel Dress Watch",
        "brand": "Titan",
        "gender": "men",
        "category": "Minimalist",
        "priceINR": 24999,
        "priceUSD": 299,
        "originalPriceINR": 28999,
        "image": "/images/products/titan_edge_minimalist_mens.jpg",
        "badge": "Flagship Reference",
        "isHero": True,
        "tagline": "Sculpted in surgical 316L stainless steel with a brushed anthracite dial.",
        "description": "Inspired by the pinnacle of contemporary minimalist horology. Features an ultra-slim profile with a monochromatic sunburst anthracite dial, hand-applied faceted baton markers, and an integrated three-link bracelet with concealed butterfly deployment clasp. Built for seamless versatility from black-tie galas to bespoke tailoring.",
        "shortSpecs": ["316L Surgical Steel", "Anthracite Sunray Dial", "Sapphire Crystal", "Slim 7.2mm Case"],
        "specs": {
            "caseDiameter": "40 mm",
            "caseThickness": "7.2 mm (Ultra-Slim)",
            "lugToLug": "46.5 mm",
            "waterResistance": "5 ATM (50 Meters)",
            "movement": "Swiss Precision Slim Quartz Calibre",
            "dialColor": "Brushed Gunmetal / Anthracite",
            "strapMaterial": "Solid 316L Stainless Steel Bracelet",
            "glass": "Scratch-Resistant Sapphire with Anti-Reflective Coating",
            "clasp": "Dual-Push Butterfly Deployment",
            "warranty": "2-Year International Manufacturer Warranty"
        },
        "fitRecommendation": {
            "recommendedWristMin": 6.2,
            "recommendedWristMax": 7.8,
            "fitNotes": "The 40mm diameter and 46.5mm lug-to-lug contour gently on average to broader male wrists. Sleek profile easily slips beneath tailored dress cuffs."
        },
        "inStock": True,
        "rating": 4.9,
        "reviewsCount": 342
    },
    {
        "id": "casio-edifice-speed",
        "title": "Casio Edifice Solar Speed Chronograph",
        "brand": "Casio",
        "gender": "men",
        "category": "Chronograph",
        "priceINR": 16495,
        "priceUSD": 199,
        "originalPriceINR": 19995,
        "image": "/images/products/casio_edifice_chronograph_mens.jpg",
        "badge": "Solar Powered",
        "isHero": False,
        "tagline": "High-octane motorsport aesthetic with carbon fiber dial & electric blue indices.",
        "description": "Engineered for precision and automotive performance. Featuring a forged octagonal bezel, carbon fiber multi-layer dial, and solar-charging cell that never needs a battery replacement. Independent 1/10th second chronograph sub-dials with luminous Neo-Brite hands.",
        "shortSpecs": ["Tough Solar Tech", "Carbon Fiber Dial", "100M Water Resistance", "Octagonal Bezel"],
        "specs": {
            "caseDiameter": "44 mm",
            "caseThickness": "11.8 mm",
            "lugToLug": "49 mm",
            "waterResistance": "10 ATM (100 Meters)",
            "movement": "Casio Solar Chronograph Quartz Module",
            "dialColor": "Carbon Weave Black with Cyan Accents",
            "strapMaterial": "Brushed & Polished Stainless Steel",
            "glass": "Hardened Mineral Crystal",
            "clasp": "Three-Fold One-Touch Clasp",
            "warranty": "2-Year Casio India Warranty"
        },
        "fitRecommendation": {
            "recommendedWristMin": 6.5,
            "recommendedWristMax": 8.2,
            "fitNotes": "Bold 44mm case presence with athletic heft. Ideal for sporty and smart casual attire."
        },
        "inStock": True,
        "rating": 4.8,
        "reviewsCount": 512
    },
    {
        "id": "timex-waterbury-vintage",
        "title": "Timex Waterbury Heritage Hand-Winding Mechanical",
        "brand": "Timex",
        "gender": "men",
        "category": "Vintage",
        "priceINR": 14995,
        "priceUSD": 179,
        "originalPriceINR": 17495,
        "image": "/images/products/timex_waterbury_heritage_mens.jpg",
        "badge": "Hand-Wound Mechanical",
        "isHero": False,
        "tagline": "Authentic 1960s mid-century aesthetic with domed crystal & vintage typography.",
        "description": "A tribute to American horological tradition. Features a tactile hand-winding 21-jewel mechanical movement visible through the exhibition caseback. Warm champagne sunburst dial with vintage stylized Arabic numerals, complemented by a distressed Horween leather strap that patinas gracefully with age.",
        "shortSpecs": ["Hand-Wound Calibre", "Domed Vintage Crystal", "Champagne Sunburst", "Horween Leather"],
        "specs": {
            "caseDiameter": "38 mm",
            "caseThickness": "10.5 mm",
            "lugToLug": "44 mm",
            "waterResistance": "5 ATM (50 Meters)",
            "movement": "21-Jewel Hand-Winding Mechanical",
            "dialColor": "Champagne Warm Sunburst",
            "strapMaterial": "Handcrafted Horween Leather (Tan)",
            "glass": "Domed Acrylic Vintage Crystal",
            "clasp": "Signed Stainless Steel Pin Buckle",
            "warranty": "1-Year Timex Official Guarantee"
        },
        "fitRecommendation": {
            "recommendedWristMin": 5.8,
            "recommendedWristMax": 7.2,
            "fitNotes": "Classic 38mm golden ratio proportions. Sits elegantly on slender and medium wrists with timeless vintage charm."
        },
        "inStock": True,
        "rating": 4.9,
        "reviewsCount": 218
    },
    {
        "id": "fossil-neutra-navy",
        "title": "Fossil Neutra Roman Chronograph Gunmetal",
        "brand": "Fossil",
        "gender": "men",
        "category": "Chronograph",
        "priceINR": 13495,
        "priceUSD": 165,
        "originalPriceINR": 15995,
        "image": "/images/products/fossil_neutra_chrono_mens.jpg",
        "badge": "Best Seller",
        "isHero": False,
        "tagline": "Deep navy dial with rose-gold Roman numerals and smoked gunmetal case.",
        "description": "Balanced mid-century architectural balance meets modern American casual design. Features an expressive deep navy dial with rose gold-tone Roman indices at XII and VI, three sub-dials for 24-hour time and stopwatch tracking, set against a rich saddle-brown genuine leather strap.",
        "shortSpecs": ["Gunmetal Finish", "Deep Navy Dial", "Rose-Gold Roman Markers", "Saddle Leather"],
        "specs": {
            "caseDiameter": "42 mm",
            "caseThickness": "12 mm",
            "lugToLug": "48 mm",
            "waterResistance": "5 ATM (50 Meters)",
            "movement": "Multi-Function Chronograph Quartz",
            "dialColor": "Sunray Navy Blue",
            "strapMaterial": "Genuine Saddle Brown Leather Strap",
            "glass": "Hardened Mineral Crystal",
            "clasp": "Prong Buckle",
            "warranty": "2-Year Fossil International Warranty"
        },
        "fitRecommendation": {
            "recommendedWristMin": 6.3,
            "recommendedWristMax": 7.9,
            "fitNotes": "Versatile 42mm size. Beautifully pairs with blazers, knitwear, and denim."
        },
        "inStock": True,
        "rating": 4.7,
        "reviewsCount": 684
    },
    {
        "id": "oceanic-diver-pro",
        "title": "Oceanic Pro Diver 300M Automatic",
        "brand": "Aethelgard",
        "gender": "men",
        "category": "Diver",
        "priceINR": 29995,
        "priceUSD": 360,
        "originalPriceINR": 35000,
        "image": "/images/products/oceanic_diver_pro_mens.jpg",
        "badge": "300M Professional",
        "isHero": False,
        "tagline": "Deep ocean ceramic bezel, laser-engraved wave dial, and automatic caliber.",
        "description": "A formidable diving instrument crafted for oceanic depths and urban sophistication. Unidirectional ceramic bezel with laser-etched diving scale, Grade A Super-LumiNova on skeletonized hands, helium escape valve, and an automatic movement with 42-hour power reserve.",
        "shortSpecs": ["300M Water Resistance", "Ceramic Bezel", "Super-LumiNova", "Automatic Calibre"],
        "specs": {
            "caseDiameter": "42 mm",
            "caseThickness": "13.2 mm",
            "lugToLug": "49.5 mm",
            "waterResistance": "30 ATM (300 Meters)",
            "movement": "Automatic Self-Winding (42h Reserve)",
            "dialColor": "Textured Ocean Navy Wave",
            "strapMaterial": "316L Solid Steel Oyster Bracelet with Extension",
            "glass": "Double-Domed Sapphire Crystal",
            "clasp": "Diver Extension Safety Clasp",
            "warranty": "3-Year Premium Guarantee"
        },
        "fitRecommendation": {
            "recommendedWristMin": 6.5,
            "recommendedWristMax": 8.0,
            "fitNotes": "Commanding wrist presence with substantial steel weight. Perfect for active lifestyles and maritime use."
        },
        "inStock": False,
        "rating": 4.9,
        "reviewsCount": 147
    },
    {
        "id": "titan-grandmaster-skeleton",
        "title": "Titan Grandmaster Automatic Skeleton Anthracite",
        "brand": "Titan",
        "gender": "men",
        "category": "Dress",
        "priceINR": 26995,
        "priceUSD": 325,
        "originalPriceINR": 31995,
        "image": "/images/products/titan_grandmaster_skeleton_mens.jpg",
        "badge": "Skeleton Automatic",
        "isHero": False,
        "tagline": "Multi-layered openworked dial revealing a 24-jewel self-winding movement.",
        "description": "Mastery of mechanical artistry. The Grandmaster Skeleton reveals the heartbeat of fine watchmaking through an intricate dual-tone anthracite and champagne dial plate. Sapphire crystal reveals the oscillating balance wheel and golden geartrain, complemented by a hand-stitched crocodile grain leather strap.",
        "shortSpecs": ["24-Jewel Automatic", "Openwork Skeleton", "Sapphire Glass", "Alligator Grain Leather"],
        "specs": {
            "caseDiameter": "41 mm",
            "caseThickness": "11.2 mm",
            "lugToLug": "47 mm",
            "waterResistance": "5 ATM (50 Meters)",
            "movement": "Calibre 7X24 Automatic Skeleton (42h Reserve)",
            "dialColor": "Anthracite & Champagne Openwork Skeleton",
            "strapMaterial": "Handcrafted Espresso Leather Strap",
            "glass": "Scratch-Proof Sapphire Crystal",
            "clasp": "Steel Deployment Buckle",
            "warranty": "2-Year Titan Official International Warranty"
        },
        "fitRecommendation": {
            "recommendedWristMin": 6.2,
            "recommendedWristMax": 7.9,
            "fitNotes": "Substantial 41mm presence. Openwork dial creates captivating mechanical depth on the wrist."
        },
        "inStock": True,
        "rating": 4.9,
        "reviewsCount": 278
    },
    {
        "id": "casio-vintage-a168-chrome",
        "title": "Casio Vintage A168 Retro Chrome Illuminator",
        "brand": "Casio",
        "gender": "men",
        "category": "Vintage",
        "priceINR": 4295,
        "priceUSD": 55,
        "originalPriceINR": 4995,
        "image": "/images/products/casio_vintage_a168_chrome_mens.jpg",
        "badge": "Heritage Digital",
        "isHero": False,
        "tagline": "Timeless 1980s retro icon with electroluminescent backlight and folded steel bracelet.",
        "description": "The definitive cult classic of vintage horology. Built with an octagonal chrome-plated case, vivid teal Electro-Luminescence screen backlight, and a classic segmented folded-link stainless steel bracelet. Features 1/100-second stopwatch, daily alarm, hourly time chime, and 7-year battery autonomy.",
        "shortSpecs": ["EL Backlight", "1/100s Stopwatch", "Folded Steel Bracelet", "7-Year Battery"],
        "specs": {
            "caseDiameter": "38.6 mm × 36.3 mm",
            "caseThickness": "9.6 mm",
            "lugToLug": "38.6 mm",
            "waterResistance": "Water Resistant (Daily Splash)",
            "movement": "Casio Digital Quartz Module 3298",
            "dialColor": "Classic Grey LCD with Teal Border",
            "strapMaterial": "Folded Stainless Steel Band",
            "glass": "Hardened Mineral Resin Glass",
            "clasp": "Self-Adjustable Sliding Clasp",
            "warranty": "2-Year Casio India Warranty"
        },
        "fitRecommendation": {
            "recommendedWristMin": 5.5,
            "recommendedWristMax": 7.8,
            "fitNotes": "Universal retro profile that fits comfortably on any wrist size with a self-adjustable sliding clasp."
        },
        "inStock": True,
        "rating": 4.9,
        "reviewsCount": 940
    },
    {
        "id": "timex-marlin-emerald",
        "title": "Timex Marlin Automatic Emerald Malachite Edition",
        "brand": "Timex",
        "gender": "men",
        "category": "Dress",
        "priceINR": 18495,
        "priceUSD": 220,
        "originalPriceINR": 21995,
        "image": "/images/products/timex_marlin_emerald_mens.jpg",
        "badge": "Malachite Edition",
        "isHero": False,
        "tagline": "Rich emerald sunburst dial with vintage domed acrylic crystal & 21-jewel calibre.",
        "description": "A mid-century classic revived in Mono Time’s signature emerald malachite hue. Features a radiant sunburst green dial with polished silver baton indices, date window at 3 o’clock, and a domed vintage acrylic crystal. Driven by a 21-jewel automatic movement with an exhibition caseback.",
        "shortSpecs": ["21-Jewel Automatic", "Malachite Sunburst Dial", "Exhibition Caseback", "Vintage Domed Crystal"],
        "specs": {
            "caseDiameter": "40 mm",
            "caseThickness": "13 mm",
            "lugToLug": "46 mm",
            "waterResistance": "5 ATM (50 Meters)",
            "movement": "Miyota 21-Jewel Automatic Self-Winding",
            "dialColor": "Emerald Malachite Sunburst",
            "strapMaterial": "Cognac Tan Croc-Embossed Natural Leather",
            "glass": "Domed Vintage Acrylic Crystal",
            "clasp": "Polished Stainless Steel Pin Buckle",
            "warranty": "1-Year Timex International Guarantee"
        },
        "fitRecommendation": {
            "recommendedWristMin": 6.0,
            "recommendedWristMax": 7.7,
            "fitNotes": "Ideal 40mm dress proportions. The domed crystal catches atmospheric light with vintage elegance."
        },
        "inStock": True,
        "rating": 4.8,
        "reviewsCount": 312
    },
    {
        "id": "titan-raga-flora",
        "title": "Titan Raga Flora Sculpted Bangle Watch",
        "brand": "Titan",
        "gender": "women",
        "category": "Jewelry",
        "priceINR": 18995,
        "priceUSD": 229,
        "originalPriceINR": 21995,
        "image": "/images/products/titan_raga_flora_womens.jpg",
        "badge": "Jewelry Collection",
        "isHero": True,
        "tagline": "Sculpted rose gold vine bangle with Swarovski crystal leaves & mother-of-pearl.",
        "description": "Celebrating the graceful poetry of nature. Each leaf in the openwork rose-gold bangle is individually cast and hand-embellished with genuine Swarovski crystals. The oval dial glows with genuine white mother-of-pearl, transforming this timepiece into an exquisite jewel for celebratory occasions and festive galas.",
        "shortSpecs": ["Rose Gold Bangle", "Swarovski Crystal Leaves", "Mother-of-Pearl Dial", "Jewelry Clasp"],
        "specs": {
            "caseDiameter": "28 mm × 34 mm (Oval)",
            "caseThickness": "6.8 mm",
            "lugToLug": "38 mm",
            "waterResistance": "3 ATM (30 Meters)",
            "movement": "Swiss Quartz High-Precision Movement",
            "dialColor": "Genuine Natural Mother-of-Pearl",
            "strapMaterial": "Cast Brass & Rose-Gold Plated Open Bangle",
            "glass": "Faceted Mineral Crystal",
            "clasp": "Self-Adjustable Jewelry Clasp",
            "warranty": "2-Year Titan Official Warranty"
        },
        "fitRecommendation": {
            "recommendedWristMin": 5.2,
            "recommendedWristMax": 6.8,
            "fitNotes": "Fits like high jewelry. Removable clasp links allow effortless customization for petite and slender wrists."
        },
        "inStock": True,
        "rating": 4.9,
        "reviewsCount": 420
    },
    {
        "id": "casio-sheen-tonneau",
        "title": "Casio Sheen Tonneau Mother-of-Pearl",
        "brand": "Casio",
        "gender": "women",
        "category": "Dress",
        "priceINR": 12995,
        "priceUSD": 159,
        "originalPriceINR": 15495,
        "image": "/images/products/casio_sheen_tonneau_womens.jpg",
        "badge": "Crystal Accents",
        "isHero": False,
        "tagline": "Art deco rectangular silhouette in yellow gold with sparkling crystal indices.",
        "description": "Chic Parisian sophistication designed for the modern professional. The elongated tonneau case features polished yellow gold plating, Roman numeral XII, date display at 6 o’clock, and brilliant crystal hour markers that catch the light effortlessly. Paired with a comfortable 5-link bracelet.",
        "shortSpecs": ["Art-Deco Tonneau Case", "Yellow Gold Plated", "Date Aperture", "Crystal Indices"],
        "specs": {
            "caseDiameter": "26 mm × 35 mm",
            "caseThickness": "7.8 mm",
            "lugToLug": "37 mm",
            "waterResistance": "5 ATM (50 Meters)",
            "movement": "Japanese Precision Quartz with Date",
            "dialColor": "White Shimmer Mother-of-Pearl",
            "strapMaterial": "5-Link Gold Ion-Plated Stainless Steel",
            "glass": "Faceted Sapphire Crystal",
            "clasp": "One-Touch Fold-Over Clasp",
            "warranty": "2-Year Casio Sheen Guarantee"
        },
        "fitRecommendation": {
            "recommendedWristMin": 5.3,
            "recommendedWristMax": 7.0,
            "fitNotes": "The rectangular silhouette lengthens the wrist profile, delivering a slender and structured look for corporate and evening settings."
        },
        "inStock": True,
        "rating": 4.8,
        "reviewsCount": 310
    },
    {
        "id": "fossil-jacqueline-blush",
        "title": "Fossil Jacqueline Rose Gold & Blush Leather",
        "brand": "Fossil",
        "gender": "women",
        "category": "Minimalist",
        "priceINR": 11995,
        "priceUSD": 145,
        "originalPriceINR": 13995,
        "image": "/images/products/fossil_jacqueline_blush_womens.jpg",
        "badge": "Classic Favorite",
        "isHero": False,
        "tagline": "Classic 34mm circular rose-gold case with soft blush Italian leather strap.",
        "description": "Effortless everyday luxury. The Jacqueline draws inspiration from vintage pocket watch cases, featuring ultra-fine wire lugs, a parchment white dial, and rose-gold Roman numerals. The supple blush-pink leather band softens over time, delivering unmatched daily comfort.",
        "shortSpecs": ["34mm Slim Case", "Rose-Gold Finish", "Parchment White Dial", "Blush Italian Leather"],
        "specs": {
            "caseDiameter": "34 mm",
            "caseThickness": "8 mm",
            "lugToLug": "38 mm",
            "waterResistance": "3 ATM (30 Meters)",
            "movement": "Three-Hand Quartz Calibre",
            "dialColor": "Parchment Matte White",
            "strapMaterial": "Genuine Soft Italian Leather (Blush)",
            "glass": "Scratch-Resistant Mineral Crystal",
            "clasp": "Rose Gold-Plated Pin Buckle",
            "warranty": "2-Year Fossil International Warranty"
        },
        "fitRecommendation": {
            "recommendedWristMin": 5.4,
            "recommendedWristMax": 7.1,
            "fitNotes": "Flattering 34mm size that works universally across almost all female wrist profiles. Very lightweight and soft."
        },
        "inStock": True,
        "rating": 4.8,
        "reviewsCount": 540
    },
    {
        "id": "aurora-petite-mesh",
        "title": "Aurora Petite Milanese Mesh Rose Gold",
        "brand": "Aethelgard",
        "gender": "women",
        "category": "Minimalist",
        "priceINR": 15495,
        "priceUSD": 189,
        "originalPriceINR": 17995,
        "image": "/images/products/aurora_petite_mesh_womens.jpg",
        "badge": "Milanese Mesh",
        "isHero": False,
        "tagline": "32mm sleek rose gold watch with natural mother-of-pearl dial and woven mesh band.",
        "description": "Pure minimalist elegance. Featuring an ultra-thin 6.5mm rose-gold case, shimmering natural mother-of-pearl face, and slender diamond-cut baton hands. The finely woven Milanese mesh strap glides around the wrist like silk fabric, fastening securely with a magnetic sliding buckle.",
        "shortSpecs": ["32mm Case", "Milanese Mesh Strap", "Mother-of-Pearl Dial", "Ultra-Thin 6.5mm"],
        "specs": {
            "caseDiameter": "32 mm",
            "caseThickness": "6.5 mm",
            "lugToLug": "36 mm",
            "waterResistance": "5 ATM (50 Meters)",
            "movement": "Swiss Ronda Slim Quartz Calibre",
            "dialColor": "Iridescent Natural Mother-of-Pearl",
            "strapMaterial": "Stainless Steel Milanese Mesh (Rose Gold)",
            "glass": "Sapphire Crystal with Anti-Glare Coating",
            "clasp": "Micro-Adjustable Safety Clasp",
            "warranty": "2-Year International Warranty"
        },
        "fitRecommendation": {
            "recommendedWristMin": 5.0,
            "recommendedWristMax": 6.9,
            "fitNotes": "Ideal for petite wrists. The Milanese mesh is infinitely adjustable without needing pin removal tools."
        },
        "inStock": True,
        "rating": 4.9,
        "reviewsCount": 186
    },
    {
        "id": "titan-raga-emerald-ceramic",
        "title": "Titan Raga Emerald Faceted Ceramic Jewelry Watch",
        "brand": "Titan",
        "gender": "women",
        "category": "Jewelry",
        "priceINR": 17995,
        "priceUSD": 215,
        "originalPriceINR": 20995,
        "image": "/images/products/titan_raga_emerald_womens.jpg",
        "badge": "Faceted Ceramic",
        "isHero": False,
        "tagline": "Lustrous emerald green ceramic link bracelet with diamond-cut crystal glass & rose-gold bezel.",
        "description": "Jewelry horology at its finest. High-tech emerald green ceramic links interlock with warm rose-gold stainless steel. The multi-faceted crystal glass reflects light like a brilliant-cut gemstone, shielding a deep green dial punctuated with genuine diamond hour markers.",
        "shortSpecs": ["Emerald High-Tech Ceramic", "Diamond-Cut Crystal", "Genuine Diamond Index", "Rose Gold PVD"],
        "specs": {
            "caseDiameter": "30 mm",
            "caseThickness": "7.1 mm",
            "lugToLug": "35 mm",
            "waterResistance": "3 ATM (30 Meters)",
            "movement": "Swiss Precision Quartz Calibre",
            "dialColor": "Emerald Shimmer Sunburst",
            "strapMaterial": "Emerald Ceramic & Rose-Gold Plated Steel",
            "glass": "Faceted Prismatic Mineral Crystal",
            "clasp": "Concealed Butterfly Deployment",
            "warranty": "2-Year Titan Official Warranty"
        },
        "fitRecommendation": {
            "recommendedWristMin": 5.1,
            "recommendedWristMax": 6.8,
            "fitNotes": "Petite 30mm jewel presence. The polished ceramic links feel cool and luxurious against the skin."
        },
        "inStock": True,
        "rating": 4.9,
        "reviewsCount": 265
    },
    {
        "id": "timex-transcend-gold-mesh",
        "title": "Timex Transcend Ultra-Slim Champagne Gold Mesh",
        "brand": "Timex",
        "gender": "women",
        "category": "Minimalist",
        "priceINR": 8995,
        "priceUSD": 110,
        "originalPriceINR": 10495,
        "image": "/images/products/timex_transcend_gold_womens.jpg",
        "badge": "Ultra-Slim 6.5mm",
        "isHero": False,
        "tagline": "Understated 31mm champagne sunray dial with supple micro-woven gold Milanese mesh strap.",
        "description": "Quiet luxury in a slender silhouette. The Transcend features an ultra-thin 6.5mm polished yellow-gold case and an uninterrupted champagne sunburst dial with slender baton markers. The micro-woven gold Milanese mesh bracelet conforms seamlessly to the wrist for all-day comfort.",
        "shortSpecs": ["Ultra-Slim 6.5mm", "Champagne Sunray Dial", "Milanese Mesh Band", "Yellow Gold Tone"],
        "specs": {
            "caseDiameter": "31 mm",
            "caseThickness": "6.5 mm (Ultra-Slim)",
            "lugToLug": "36 mm",
            "waterResistance": "3 ATM (30 Meters)",
            "movement": "Ultra-Thin Quartz Calibre",
            "dialColor": "Champagne Sunray Gold",
            "strapMaterial": "Stainless Steel Milanese Mesh (Gold Tone)",
            "glass": "Scratch-Resistant Mineral Crystal",
            "clasp": "Adjustable Sliding Clasp",
            "warranty": "1-Year Timex Warranty"
        },
        "fitRecommendation": {
            "recommendedWristMin": 5.0,
            "recommendedWristMax": 7.0,
            "fitNotes": "The sliding clasp allows instant micro-sizing for any wrist without tools. Very light and comfortable."
        },
        "inStock": True,
        "rating": 4.8,
        "reviewsCount": 380
    },
    {
        "id": "fossil-carlie-mini-twotone",
        "title": "Fossil Carlie Mini Two-Tone Diamond Accent",
        "brand": "Fossil",
        "gender": "women",
        "category": "Dress",
        "priceINR": 12995,
        "priceUSD": 155,
        "originalPriceINR": 14995,
        "image": "/images/products/fossil_carlie_mini_womens.jpg",
        "badge": "Petite 28mm",
        "isHero": False,
        "tagline": "Two-tone silver & rose gold T-bar bracelet with pavé crystal bezel and natural mother-of-pearl dial.",
        "description": "Delicate vintage charm with contemporary two-tone versatility. Features a sparkling pavé crystal bezel, slender curved T-bar lugs, and a luminous natural white mother-of-pearl dial with Roman numerals. The two-tone stainless steel and rose-gold bracelet pairs effortlessly with mixed jewelry.",
        "shortSpecs": ["28mm Petite Case", "Mother-of-Pearl Dial", "Two-Tone Bracelet", "Pavé Crystal Bezel"],
        "specs": {
            "caseDiameter": "28 mm",
            "caseThickness": "7.5 mm",
            "lugToLug": "34 mm",
            "waterResistance": "5 ATM (50 Meters)",
            "movement": "Three-Hand Quartz Module",
            "dialColor": "Genuine White Mother-of-Pearl",
            "strapMaterial": "Stainless Steel & Rose Gold-Tone Bracelet",
            "glass": "Mineral Crystal",
            "clasp": "Adjust-O-Matic Removable Links",
            "warranty": "2-Year Fossil International Warranty"
        },
        "fitRecommendation": {
            "recommendedWristMin": 5.0,
            "recommendedWristMax": 6.7,
            "fitNotes": "Ideal for petite wrists desiring delicate, jewelry-like proportions for formal and daily wear."
        },
        "inStock": True,
        "rating": 4.9,
        "reviewsCount": 415
    }
]

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Upsert Products
        print(f"Seeding {len(PRODUCTS_DATA)} luxury watch models...")
        for pdata in PRODUCTS_DATA:
            existing = db.query(ProductModel).filter(ProductModel.id == pdata["id"]).first()
            if not existing:
                prod = ProductModel(**pdata)
                db.add(prod)
            else:
                for k, v in pdata.items():
                    setattr(existing, k, v)
        db.commit()

        # 2. Seed Pitch History for Merchant Analytics
        existing_pitches = db.query(PitchEventModel).count()
        if existing_pitches == 0:
            print("Seeding baseline pitch events for merchant analytics...")
            pitches = [
                PitchEventModel(
                    id="pe-101",
                    session_id="sess-demo-1",
                    product_id="titan-edge-slate",
                    product_name="Titan Edge Minimalist Slate Steel",
                    gender="men",
                    trigger_type="exit_intent",
                    offer="10% Exclusive Horology Welcome Code",
                    code="HOROLOGY10",
                    clicked=True,
                    converted=True,
                    created_at=datetime.utcnow() - timedelta(minutes=28),
                ),
                PitchEventModel(
                    id="pe-102",
                    session_id="sess-demo-2",
                    product_id="titan-raga-flora",
                    product_name="Titan Raga Flora Sculpted Bangle Watch",
                    gender="women",
                    trigger_type="idle_dwell",
                    offer="Complimentary Velvet Travel Pouch",
                    code="RAGAJEWEL",
                    clicked=True,
                    converted=False,
                    created_at=datetime.utcnow() - timedelta(hours=1, minutes=12),
                ),
                PitchEventModel(
                    id="pe-103",
                    session_id="sess-demo-3",
                    product_id="casio-edifice-speed",
                    product_name="Casio Edifice Solar Speed Chronograph",
                    gender="men",
                    trigger_type="exit_intent",
                    offer="Free Express Shipping + 10% Discount",
                    code="EDIFICE10",
                    clicked=False,
                    converted=False,
                    created_at=datetime.utcnow() - timedelta(hours=2, minutes=45),
                ),
            ]
            db.add_all(pitches)

            # Orders
            orders = [
                CheckoutOrderModel(
                    id="order_rec_1",
                    session_id="sess-demo-1",
                    amount_inr=22499,
                    discount_code="HOROLOGY10",
                    discount_percent=10,
                    status="succeeded",
                    customer_email="collector@horology.ai",
                    created_at=datetime.utcnow() - timedelta(minutes=25),
                )
            ]
            db.add_all(orders)

            # Baseline Sessions
            for i in range(1, 10):
                db.add(SessionModel(
                    id=f"sess-demo-{i}",
                    created_at=datetime.utcnow() - timedelta(hours=i),
                    last_activity=datetime.utcnow() - timedelta(hours=i, minutes=15),
                    current_product_id="titan-edge-slate",
                    total_dwell_seconds=180,
                ))

            db.commit()

        print("Database seeding completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
