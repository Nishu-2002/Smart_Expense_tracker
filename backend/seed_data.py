from datetime import datetime, timedelta
from models import (
    SessionLocal, User, Account, Category, Subcategory, Transaction, Budget, CategoryRule
)

def seed_defaults_if_empty():
    db = SessionLocal()
    try:
        # Check if already seeded
        cat_count = db.query(Category).count()
        if cat_count > 0:
            return

        print("[Seed] Populating initial default user, categories, accounts and sample transactions...")

        # 1. Create User
        user = db.query(User).first()
        if not user:
            user = User(
                name="Nishanth",
                email="kmnishanth2002@gmail.com",
                currency="₹",
                timezone="Asia/Kolkata"
            )
            db.add(user)
            db.flush()

        # 2. Create Accounts
        accounts = [
            Account(user_id=user.id, name="HDFC Bank", account_type="Bank Account", balance=25000.0, icon="landmark", color="#0f766e"),
            Account(user_id=user.id, name="Cash Wallet", account_type="Cash", balance=2500.0, icon="wallet", color="#16a34a"),
            Account(user_id=user.id, name="UPI / Paytm", account_type="Wallet", balance=5000.0, icon="smartphone", color="#0284c7"),
        ]
        db.add_all(accounts)
        db.flush()

        # 3. Create Categories & Subcategories
        categories_data = [
            {
                "name": "Food and Groceries",
                "icon": "utensils",
                "color": "#F97316",
                "bg_color": "#FFF3E0",
                "subs": ["Food Delivery", "Restaurants and Dining", "Tea, Coffee, and Snacks", "Vegetables", "Fruits", "Milk and Dairy Products", "Groceries and Supermarket"]
            },
            {
                "name": "Transportation",
                "icon": "car",
                "color": "#10B981",
                "bg_color": "#E8F5E9",
                "subs": ["Cab / Taxi", "Metro", "Bus", "Fuel / Gas", "Vehicle Maintenance", "Train and Flight"]
            },
            {
                "name": "Shopping and Personal Expenses",
                "icon": "shopping-bag",
                "color": "#F59E0B",
                "bg_color": "#FEF3C7",
                "subs": ["Online Shopping", "Clothing and Footwear", "Electronics and Gadgets", "Home Appliances", "Personal Care"]
            },
            {
                "name": "Home and Living",
                "icon": "home",
                "color": "#6366F1",
                "bg_color": "#EEF2FF",
                "subs": ["House Rent", "Electricity Bill", "Water Bill", "Gas Cylinder / Cooking Gas", "Internet and Wi-Fi", "Mobile Recharge"]
            },
            {
                "name": "Bills and Utilities",
                "icon": "zap",
                "color": "#0D9488",
                "bg_color": "#CCFBF1",
                "subs": ["Credit Card Bill", "Subscriptions", "Insurance", "Loan EMI"]
            },
            {
                "name": "Health and Medical",
                "icon": "heart-pulse",
                "color": "#EF4444",
                "bg_color": "#FEE2E2",
                "subs": ["Doctor Consultation", "Medicines and Pharmacy", "Diagnostic Tests"]
            },
            {
                "name": "Entertainment and Leisure",
                "icon": "film",
                "color": "#EC4899",
                "bg_color": "#FCE7F3",
                "subs": ["Movies", "Gaming", "Outings"]
            },
            {
                "name": "Others",
                "icon": "more-horizontal",
                "color": "#64748B",
                "bg_color": "#F1F5F9",
                "subs": ["General", "Donations", "Miscellaneous"]
            }
        ]

        cat_map = {}
        sub_map = {}
        for cdata in categories_data:
            cat = Category(
                name=cdata["name"],
                icon=cdata["icon"],
                color=cdata["color"],
                bg_color=cdata["bg_color"],
                type="expense",
                is_custom=False,
                user_id=user.id
            )
            db.add(cat)
            db.flush()
            cat_map[cat.name] = cat

            for sname in cdata["subs"]:
                sub = Subcategory(category_id=cat.id, name=sname, icon=cdata["icon"])
                db.add(sub)
                db.flush()
                sub_map[f"{cat.name}:{sname}"] = sub

        # 4. Create Sample Transactions
        now = datetime.now()
        sample_txs = [
            # Today's expenses
            Transaction(
                user_id=user.id,
                amount=350.0,
                type="expense",
                category_id=cat_map["Food and Groceries"].id,
                subcategory_id=sub_map.get("Food and Groceries:Food Delivery", None).id if sub_map.get("Food and Groceries:Food Delivery") else None,
                merchant_or_title="Swiggy Lunch Delivery",
                payment_method="UPI",
                account_name="UPI / Paytm",
                transaction_date=now - timedelta(hours=2),
                is_auto_categorized=True,
                auto_detected_reason="Keyword 'Swiggy' matched Food and Groceries"
            ),
            Transaction(
                user_id=user.id,
                amount=220.0,
                type="expense",
                category_id=cat_map["Transportation"].id,
                subcategory_id=sub_map.get("Transportation:Cab / Taxi", None).id if sub_map.get("Transportation:Cab / Taxi") else None,
                merchant_or_title="Uber Cab to Office",
                payment_method="UPI",
                account_name="UPI / Paytm",
                transaction_date=now - timedelta(hours=5),
                is_auto_categorized=True,
                auto_detected_reason="Keyword 'Uber' matched Transportation"
            ),
            Transaction(
                user_id=user.id,
                amount=130.0,
                type="expense",
                category_id=cat_map["Food and Groceries"].id,
                subcategory_id=sub_map.get("Food and Groceries:Tea, Coffee, and Snacks", None).id if sub_map.get("Food and Groceries:Tea, Coffee, and Snacks") else None,
                merchant_or_title="Chai Point Snacks",
                payment_method="Cash",
                account_name="Cash Wallet",
                transaction_date=now - timedelta(hours=7),
                is_auto_categorized=True,
                auto_detected_reason="Keyword 'Chai' matched Food and Groceries"
            ),
            # This week
            Transaction(
                user_id=user.id,
                amount=450.0,
                type="expense",
                category_id=cat_map["Food and Groceries"].id,
                subcategory_id=sub_map.get("Food and Groceries:Vegetables", None).id if sub_map.get("Food and Groceries:Vegetables") else None,
                merchant_or_title="Vegetable Market",
                payment_method="Cash",
                account_name="Cash Wallet",
                transaction_date=now - timedelta(days=2),
                is_auto_categorized=True
            ),
            Transaction(
                user_id=user.id,
                amount=1800.0,
                type="expense",
                category_id=cat_map["Bills and Utilities"].id,
                subcategory_id=sub_map.get("Bills and Utilities:Credit Card Bill", None).id if sub_map.get("Bills and Utilities:Credit Card Bill") else None,
                merchant_or_title="BESCOM Electricity Bill",
                payment_method="Net Banking",
                account_name="HDFC Bank",
                transaction_date=now - timedelta(days=3),
                is_auto_categorized=True
            ),
            # This month
            Transaction(
                user_id=user.id,
                amount=12000.0,
                type="expense",
                category_id=cat_map["Home and Living"].id,
                subcategory_id=sub_map.get("Home and Living:House Rent", None).id if sub_map.get("Home and Living:House Rent") else None,
                merchant_or_title="Monthly House Rent",
                payment_method="Net Banking",
                account_name="HDFC Bank",
                transaction_date=now - timedelta(days=10),
                is_auto_categorized=True
            ),
            Transaction(
                user_id=user.id,
                amount=3470.0,
                type="expense",
                category_id=cat_map["Shopping and Personal Expenses"].id,
                subcategory_id=sub_map.get("Shopping and Personal Expenses:Online Shopping", None).id if sub_map.get("Shopping and Personal Expenses:Online Shopping") else None,
                merchant_or_title="Amazon Electronics Order",
                payment_method="Credit Card",
                account_name="HDFC Bank",
                transaction_date=now - timedelta(days=12),
                is_auto_categorized=True
            ),
        ]
        db.add_all(sample_txs)

        # 5. Create Budgets
        budgets = [
            Budget(user_id=user.id, category_id=cat_map["Transportation"].id, amount=3000.0, period="monthly", alert_threshold_pct=80),
            Budget(user_id=user.id, category_id=cat_map["Food and Groceries"].id, amount=6000.0, period="monthly", alert_threshold_pct=80),
            Budget(user_id=user.id, category_id=cat_map["Shopping and Personal Expenses"].id, amount=5000.0, period="monthly", alert_threshold_pct=80),
            Budget(user_id=user.id, category_id=cat_map["Home and Living"].id, amount=15000.0, period="monthly", alert_threshold_pct=80),
        ]
        db.add_all(budgets)

        db.commit()
        print("[Seed] Successfully seeded initial default database data!")
    except Exception as e:
        db.rollback()
        print(f"[Seed] Error seeding default data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    from models import init_db
    init_db()
    seed_defaults_if_empty()
