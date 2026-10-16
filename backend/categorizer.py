import re
from typing import Dict, Any, Optional
from models import SessionLocal, Category, Subcategory, CategoryRule, Transaction

# Comprehensive keyword mapping engine for Indian & Global merchants/terms
DEFAULT_KEYWORD_RULES = [
    # --- Transportation ---
    (r'\b(uber|ola|rapido|taxi|cab|auto|rickshaw|chauffeur)\b', 'Transportation', 'Cab / Taxi', 'Cab'),
    (r'\b(namma\s*metro|metro|metro\s*card|dmrc|bmrc|smart\s*card\s*recharge)\b', 'Transportation', 'Metro', 'Metro'),
    (r'\b(bmtc|ksrtc|bus|redbus|chalo|volvo\s*bus)\b', 'Transportation', 'Bus', 'Bus'),
    (r'\b(petrol|diesel|fuel|cng|bunk|shell|hpcl|bpcl|ioc|gas\s*station)\b', 'Transportation', 'Fuel / Gas', 'Fuel'),
    (r'\b(service|repair|fastag|toll|parking|puncture|wheel\s*alignment|car\s*wash)\b', 'Transportation', 'Vehicle Maintenance', 'Maintenance'),
    (r'\b(train|flight|irctc|indigo|air\s*india|vistara|spicejet|railway)\b', 'Transportation', 'Train and Flight', 'Travel'),

    # --- Food and Groceries ---
    (r'\b(swiggy|zomato|eats|foodpanda|box8|faasos)\b', 'Food and Groceries', 'Food Delivery', 'Food Delivery'),
    (r'\b(restaurant|dining|hotel|cafe|bistro|diner|mcdonald|kfc|burger|pizza|domino|starbucks|subway|biryani|dosa|idli|barbeque)\b', 'Food and Groceries', 'Restaurants and Dining', 'Food'),
    (r'\b(tea|coffee|snack|chai|cafe|canteen|bakery|pastry|cake|sweets|haldiram)\b', 'Food and Groceries', 'Tea, Coffee, and Snacks', 'Snacks'),
    (r'\b(vegetable|vegetables|sabzi|tarkari)\b', 'Food and Groceries', 'Vegetables', 'Vegetables'),
    (r'\b(fruit|fruits|apple|banana|mango|orange)\b', 'Food and Groceries', 'Fruits', 'Fruits'),
    (r'\b(milk|dairy|nandini|amul|curd|paneer|cheese|butter)\b', 'Food and Groceries', 'Milk and Dairy Products', 'Milk & Dairy'),
    (r'\b(grocery|groceries|supermarket|mart|bigbasket|zepto|blinkit|instamart|nature\s*basket|reliance\s*fresh|dmart)\b', 'Food and Groceries', 'Groceries and Supermarket', 'Groceries'),
    (r'\b(meat|chicken|mutton|fish|prawn|egg|eggs|licious)\b', 'Food and Groceries', 'Meat, Fish, and Eggs', 'Meat & Fish'),

    # --- Shopping and Personal Expenses ---
    (r'\b(amazon|flipkart|myntra|ajio|meesho|nykaa|tata\s*cliq)\b', 'Shopping and Personal Expenses', 'Online Shopping', 'Shopping'),
    (r'\b(clothing|clothes|shirt|pants|dress|footwear|shoes|zara|h&m|uniqlo|trends|westside)\b', 'Shopping and Personal Expenses', 'Clothing and Footwear', 'Clothing'),
    (r'\b(electronics|gadget|mobile|laptop|croma|reliance\s*digital|apple|samsung|headphone)\b', 'Shopping and Personal Expenses', 'Electronics and Gadgets', 'Electronics'),
    (r'\b(washing\s*machine|refrigerator|fridge|microwave|appliances|ac|air\s*conditioner|tv)\b', 'Shopping and Personal Expenses', 'Home Appliances', 'Home Appliances'),
    (r'\b(salon|parlour|spa|haircut|cosmetics|perfume|grooming|skincare)\b', 'Shopping and Personal Expenses', 'Personal Care', 'Personal Care'),

    # --- Home and Living ---
    (r'\b(rent|house\s*rent|landlord|maintenance\s*fee|society\s*charge)\b', 'Home and Living', 'House Rent', 'Rent'),
    (r'\b(electricity|power|bescom|tneb|mseb|electric\s*bill)\b', 'Home and Living', 'Electricity Bill', 'Electricity'),
    (r'\b(water\s*bill|bwssb|water\s*tanker)\b', 'Home and Living', 'Water Bill', 'Water'),
    (r'\b(gas|cylinder|lpg|indane|bharat\s*gas|hp\s*gas|cooking\s*gas)\b', 'Home and Living', 'Gas Cylinder / Cooking Gas', 'Gas'),
    (r'\b(wifi|internet|broadband|act\s*fibernet|airtel\s*xtream|jio\s*fiber)\b', 'Home and Living', 'Internet and Wi-Fi', 'Internet'),
    (r'\b(mobile\s*recharge|recharge|prepaid|postpaid|airtel|jio|vi\s*recharge)\b', 'Home and Living', 'Mobile Recharge', 'Mobile'),
    (r'\b(furniture|repair|plumber|electrician|urban\s*company|cleaning|maid|sweep)\b', 'Home and Living', 'Cleaning Supplies', 'Home Care'),

    # --- Health and Fitness ---
    (r'\b(medicine|medicines|pharmacy|apollo|medplus|pharmeasy|1mg|tablet)\b', 'Health and Fitness', 'Medicines', 'Medicines'),
    (r'\b(doctor|clinic|consultation|hospital|physician|dentist)\b', 'Health and Fitness', 'Doctor Consultation', 'Doctor'),
    (r'\b(gym|fitness|cult\.?fit|workout|protein|supplement)\b', 'Health and Fitness', 'Gym and Fitness', 'Fitness'),
    (r'\b(medical\s*test|blood\s*test|lab|diagnostic|x-ray|mri)\b', 'Health and Fitness', 'Medical Tests', 'Tests'),

    # --- Entertainment and Lifestyle ---
    (r'\b(movie|cinema|pvr|inox|cinepolis|bookmyshow)\b', 'Entertainment and Lifestyle', 'Movies', 'Movies'),
    (r'\b(netflix|spotify|prime\s*video|hotstar|youtube\s*premium|disney\+|apple\s*music)\b', 'Entertainment and Lifestyle', 'OTT Subscriptions', 'Subscriptions'),
    (r'\b(games|gaming|steam|playstation|xbox)\b', 'Entertainment and Lifestyle', 'Games', 'Games'),
    (r'\b(hotel|resort|vacation|trip|flight|holiday|airbnb)\b', 'Entertainment and Lifestyle', 'Travel and Vacation', 'Travel'),

    # --- Financial and Other Expenses ---
    (r'\b(emi|loan|repayment|interest)\b', 'Financial and Other Expenses', 'Loan EMI', 'EMI'),
    (r'\b(insurance|lic|hdfc\s*ergo|premium)\b', 'Financial and Other Expenses', 'Insurance', 'Insurance'),
    (r'\b(bank\s*charges|atm\s*fee|annual\s*fee)\b', 'Financial and Other Expenses', 'Bank Charges', 'Bank Charges'),
    (r'\b(sip|investment|mutual\s*fund|zerodha|groww|stocks)\b', 'Financial and Other Expenses', 'Investments and Savings', 'Investments'),
    (r'\b(donation|charity|temple|relief\s*fund)\b', 'Financial and Other Expenses', 'Donations', 'Donations'),
    (r'\b(course|udemy|coursera|tuition|school\s*fee|college\s*fee)\b', 'Financial and Other Expenses', 'Education and Courses', 'Education')
]

def auto_categorize_text(text: str, user_id: int = 1) -> Dict[str, Any]:
    """
    Intelligent categorization pipeline:
    1. Check user custom defined rules.
    2. Check user transaction history memory (learned merchant mappings).
    3. Built-in regex rule matches.
    4. Fuzzy keyword fallback.
    Returns structured categorization metadata.
    """
    clean_text = (text or '').strip()
    if not clean_text:
        return {
            'detected': False,
            'category_id': None,
            'category_name': None,
            'subcategory_id': None,
            'subcategory_name': None,
            'display_path': None,
            'reason': None,
            'confidence': 0.0
        }
        
    db = SessionLocal()
    try:
        # Step 1: User-defined Custom Rules (Highest priority)
        rules = db.query(CategoryRule).filter(CategoryRule.user_id == user_id).all()
        for r in rules:
            if r.keyword.lower() in clean_text.lower():
                cat = db.query(Category).filter(Category.id == r.category_id).first()
                sub = db.query(Subcategory).filter(Subcategory.id == r.subcategory_id).first() if r.subcategory_id else None
                return {
                    'detected': True,
                    'category_id': cat.id if cat else None,
                    'category_name': cat.name if cat else '',
                    'subcategory_id': sub.id if sub else None,
                    'subcategory_name': sub.name if sub else None,
                    'display_path': f"{cat.name} > {sub.name if sub else 'General'}",
                    'reason': f'Custom rule matched "{r.keyword}"',
                    'confidence': 1.0
                }

        # Step 2: User Confirmed Merchant History (Learning engine)
        past_tx = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.merchant_or_title.ilike(f"%{clean_text}%"),
            Transaction.category_id.isnot(None)
        ).order_by(Transaction.id.desc()).first()
        
        if past_tx and past_tx.category:
            cat = past_tx.category
            sub = past_tx.subcategory
            return {
                'detected': True,
                'category_id': cat.id,
                'category_name': cat.name,
                'subcategory_id': sub.id if sub else None,
                'subcategory_name': sub.name if sub else None,
                'display_path': f"{cat.name} > {sub.name if sub else 'General'}",
                'reason': f'Learned from past transaction "{past_tx.merchant_or_title}"',
                'confidence': 0.95
            }

        # Step 3: Default Regex Keyword Rules
        for pattern, cat_name, sub_name, short_label in DEFAULT_KEYWORD_RULES:
            match = re.search(pattern, clean_text, re.IGNORECASE)
            if match:
                matched_word = match.group(0)
                # Look up category in DB
                cat = db.query(Category).filter(Category.name.ilike(f"%{cat_name}%")).first()
                sub = None
                if cat:
                    sub = db.query(Subcategory).filter(
                        Subcategory.category_id == cat.id,
                        Subcategory.name.ilike(f"%{sub_name}%")
                    ).first()
                
                # Friendly display category name
                display_cat = "Transportation" if "Transport" in cat_name else (
                    "Groceries" if "Groceries" in cat_name and any(k in sub_name.lower() for k in ['vegetable', 'fruit', 'milk']) else (
                        "Food" if "Food" in cat_name else (
                            "Shopping" if "Shopping" in cat_name else (
                                "Home" if "Home" in cat_name else cat_name
                            )
                        )
                    )
                )
                
                sub_disp = sub.name if sub else short_label
                if " > " in sub_disp:
                    sub_disp = sub_disp.split(" > ")[-1]

                return {
                    'detected': True,
                    'category_id': cat.id if cat else None,
                    'category_name': cat.name if cat else cat_name,
                    'subcategory_id': sub.id if sub else None,
                    'subcategory_name': sub.name if sub else sub_name,
                    'display_path': f"{display_cat} > {sub_disp}",
                    'reason': f'Auto detected based on "{matched_word}"',
                    'confidence': 0.90
                }

        # Step 4: Fallback partial search across all Categories & Subcategories
        all_subs = db.query(Subcategory).all()
        for sub in all_subs:
            words = sub.name.lower().replace('/', ' ').replace(',', ' ').split()
            for w in words:
                if len(w) > 3 and w in clean_text.lower():
                    cat = sub.category
                    return {
                        'detected': True,
                        'category_id': cat.id if cat else None,
                        'category_name': cat.name if cat else '',
                        'subcategory_id': sub.id,
                        'subcategory_name': sub.name,
                        'display_path': f"{cat.name} > {sub.name}",
                        'reason': f'Matched keyword "{w}"',
                        'confidence': 0.70
                    }

        return {
            'detected': False,
            'category_id': None,
            'category_name': None,
            'subcategory_id': None,
            'subcategory_name': None,
            'display_path': None,
            'reason': None,
            'confidence': 0.0
        }
    finally:
        db.close()
