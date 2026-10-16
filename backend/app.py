import io
import csv
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from sqlalchemy import func, or_, and_, desc, asc
import pandas as pd

from models import (
    SessionLocal, init_db, User, Account, Category, Subcategory,
    Transaction, Budget, CategoryRule, RecurringExpense
)
from categorizer import auto_categorize_text

import os
from pathlib import Path

# Static frontend directory (when built with npm run build)
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))

if os.path.exists(FRONTEND_DIST):
    app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path='')
else:
    app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": "*"}})

init_db()

def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        pass

# ----------------- AUTH & USER -----------------
@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    db = SessionLocal()
    try:
        user = db.query(User).first()
        if not user:
            return jsonify({
                'id': 1,
                'name': 'User',
                'email': '',
                'avatar_url': '',
                'currency': '₹',
                'timezone': 'Asia/Kolkata',
                'accounts': []
            })
        accounts = db.query(Account).filter_by(user_id=user.id).all()
        return jsonify({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'avatar_url': user.avatar_url,
            'currency': user.currency,
            'timezone': user.timezone,
            'accounts': [{
                'id': a.id,
                'name': a.name,
                'type': a.account_type,
                'balance': a.balance,
                'icon': a.icon
            } for a in accounts]
        })
    finally:
        db.close()

@app.route('/api/accounts', methods=['GET'])
def get_accounts():
    db = SessionLocal()
    try:
        user_id = request.args.get('user_id', 1, type=int)
        accounts = db.query(Account).filter_by(user_id=user_id).all()
        return jsonify([{
            'id': a.id,
            'name': a.name,
            'type': a.account_type,
            'balance': a.balance,
            'icon': a.icon
        } for a in accounts])
    finally:
        db.close()

# ----------------- CATEGORIZATION -----------------
@app.route('/api/categorize', methods=['POST'])
def auto_categorize():
    data = request.get_json() or {}
    text = data.get('text', '')
    user_id = data.get('user_id', 1)
    result = auto_categorize_text(text, user_id=user_id)
    return jsonify(result)

# ----------------- CATEGORIES -----------------
@app.route('/api/categories', methods=['GET'])
def get_categories():
    db = SessionLocal()
    try:
        categories = db.query(Category).all()
        res = []
        for cat in categories:
            subs = [{
                'id': s.id,
                'name': s.name,
                'icon': s.icon
            } for s in cat.subcategories]
            res.append({
                'id': cat.id,
                'name': cat.name,
                'icon': cat.icon,
                'color': cat.color,
                'bg_color': cat.bg_color,
                'type': cat.type,
                'is_custom': cat.is_custom,
                'subcategories': subs,
                'subcategories_summary': ", ".join([s.name for s in cat.subcategories[:3]]) + ("..." if len(cat.subcategories) > 3 else "")
            })
        return jsonify(res)
    finally:
        db.close()

@app.route('/api/categories', methods=['POST'])
def create_category():
    db = SessionLocal()
    try:
        data = request.get_json() or {}
        name = data.get('name')
        if not name:
            return jsonify({'error': 'Name is required'}), 400
        user_id = data.get('user_id', 1)
        user = db.query(User).filter_by(id=user_id).first()
        if not user:
            user = User(id=user_id, name="User", email="user@example.com")
            db.add(user)
            db.commit()

        cat = Category(
            name=name,
            icon=data.get('icon', 'tag'),
            color=data.get('color', '#10B981'),
            bg_color=data.get('bg_color', '#E8F5E9'),
            type=data.get('type', 'expense'),
            is_custom=True,
            user_id=user_id
        )
        db.add(cat)
        db.commit()
        db.refresh(cat)
        
        subs = data.get('subcategories', [])
        for sname in subs:
            if sname.strip():
                sub = Subcategory(category_id=cat.id, name=sname.strip(), icon=cat.icon)
                db.add(sub)
        db.commit()
        return jsonify({'message': 'Category created successfully', 'id': cat.id}), 201
    finally:
        db.close()

# ----------------- TRANSACTIONS -----------------
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    db = SessionLocal()
    try:
        user_id = request.args.get('user_id', 1, type=int)
        search = request.args.get('search', '').strip()
        cat_id = request.args.get('category_id', type=int)
        tx_type = request.args.get('type')
        payment_method = request.args.get('payment_method')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        sort_by = request.args.get('sort_by', 'date_desc')

        query = db.query(Transaction).filter(Transaction.user_id == user_id)

        if search:
            query = query.filter(
                or_(
                    Transaction.merchant_or_title.ilike(f"%{search}%"),
                    Transaction.notes.ilike(f"%{search}%")
                )
            )
        if cat_id:
            query = query.filter(Transaction.category_id == cat_id)
        if tx_type:
            query = query.filter(Transaction.type == tx_type)
        if payment_method:
            query = query.filter(Transaction.payment_method == payment_method)
        if start_date:
            try:
                sd = datetime.fromisoformat(start_date)
                query = query.filter(Transaction.transaction_date >= sd)
            except Exception:
                pass
        if end_date:
            try:
                ed = datetime.fromisoformat(end_date)
                query = query.filter(Transaction.transaction_date <= ed)
            except Exception:
                pass

        if sort_by == 'amount_desc':
            query = query.order_by(desc(Transaction.amount))
        elif sort_by == 'amount_asc':
            query = query.order_by(asc(Transaction.amount))
        elif sort_by == 'date_asc':
            query = query.order_by(asc(Transaction.transaction_date))
        else:
            query = query.order_by(desc(Transaction.transaction_date))

        txs = query.all()
        
        now = datetime.now()
        today_date = now.date()
        yesterday_date = today_date - timedelta(days=1)

        grouped = {}
        total_amount = 0.0

        items = []
        for t in txs:
            if t.type == 'expense':
                total_amount += t.amount
            
            d = t.transaction_date.date()
            if d == today_date:
                group_key = f"Today · {t.transaction_date.strftime('%d %b %Y')}"
            elif d == yesterday_date:
                group_key = f"Yesterday · {t.transaction_date.strftime('%d %b %Y')}"
            else:
                group_key = t.transaction_date.strftime('%d %b %Y')

            cat = t.category
            sub = t.subcategory
            
            # Subtitle format matching screenshot: "Cab · Transportation"
            cat_display = cat.name if cat else "Uncategorized"
            sub_display = sub.name if sub else ""
            if sub_display:
                subtitle = f"{sub_display} · {cat_display}"
            else:
                subtitle = cat_display

            item = {
                'id': t.id,
                'amount': t.amount,
                'type': t.type,
                'merchant_or_title': t.merchant_or_title,
                'category_id': t.category_id,
                'category_name': cat.name if cat else None,
                'category_icon': cat.icon if cat else 'tag',
                'category_color': cat.color if cat else '#64748B',
                'category_bg_color': cat.bg_color if cat else '#F1F5F9',
                'subcategory_id': t.subcategory_id,
                'subcategory_name': sub.name if sub else None,
                'subtitle': subtitle,
                'payment_method': t.payment_method,
                'account_name': t.account_name,
                'transaction_date': t.transaction_date.isoformat(),
                'time_display': t.transaction_date.strftime('%I:%M %p'),
                'notes': t.notes or '',
                'receipt_url': t.receipt_url,
                'is_auto_categorized': t.is_auto_categorized,
                'auto_detected_reason': t.auto_detected_reason
            }
            items.append(item)

            if group_key not in grouped:
                grouped[group_key] = {
                    'date_label': group_key,
                    'raw_date': d.isoformat(),
                    'total': 0.0,
                    'transactions': []
                }
            if t.type == 'expense':
                grouped[group_key]['total'] += t.amount
            grouped[group_key]['transactions'].append(item)

        return jsonify({
            'total_count': len(items),
            'grand_total': total_amount,
            'items': items,
            'grouped_by_date': list(grouped.values())
        })
    finally:
        db.close()

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    db = SessionLocal()
    try:
        data = request.get_json() or {}
        amount = float(data.get('amount', 0))
        merchant = data.get('merchant_or_title', '').strip()
        if not amount or not merchant:
            return jsonify({'error': 'Amount and merchant/description are required'}), 400

        user_id = data.get('user_id', 1)
        # Ensure user exists for foreign key constraint
        user = db.query(User).filter_by(id=user_id).first()
        if not user:
            user = User(id=user_id, name="User", email="user@example.com")
            db.add(user)
            db.commit()

        tx_type = data.get('type', 'expense')
        
        # Parse transaction date
        raw_date = data.get('transaction_date')
        if raw_date:
            try:
                tx_date = datetime.fromisoformat(raw_date.replace('Z', ''))
            except Exception:
                tx_date = datetime.now()
        else:
            tx_date = datetime.now()

        # Duplicate detection within last 10 minutes for same merchant and amount
        ten_mins_ago = tx_date - timedelta(minutes=10)
        ten_mins_after = tx_date + timedelta(minutes=10)
        dup = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.merchant_or_title.ilike(merchant),
            Transaction.amount == amount,
            Transaction.transaction_date >= ten_mins_ago,
            Transaction.transaction_date <= ten_mins_after
        ).first()

        is_auto = data.get('is_auto_categorized', False)
        reason = data.get('auto_detected_reason', '')
        cat_id = data.get('category_id')
        sub_id = data.get('subcategory_id')

        # If not provided, try categorizing
        if not cat_id and tx_type == 'expense':
            cat_res = auto_categorize_text(merchant, user_id=user_id)
            if cat_res['detected']:
                cat_id = cat_res['category_id']
                sub_id = cat_res['subcategory_id']
                is_auto = True
                reason = cat_res['reason']

        tx = Transaction(
            user_id=user_id,
            amount=amount,
            type=tx_type,
            merchant_or_title=merchant,
            category_id=cat_id,
            subcategory_id=sub_id,
            payment_method=data.get('payment_method', 'UPI'),
            account_name=data.get('account_name', 'HDFC Bank'),
            transaction_date=tx_date,
            notes=data.get('notes'),
            receipt_url=data.get('receipt_url'),
            is_auto_categorized=is_auto,
            auto_detected_reason=reason
        )
        db.add(tx)

        # Update account balance if account configured
        acc_name = data.get('account_name')
        if acc_name:
            acc = db.query(Account).filter(Account.user_id == user_id, Account.name == acc_name).first()
            if acc:
                if tx_type == 'expense':
                    acc.balance -= amount
                elif tx_type == 'income':
                    acc.balance += amount

        db.commit()
        db.refresh(tx)

        return jsonify({
            'message': 'Transaction recorded successfully',
            'id': tx.id,
            'is_duplicate_warning': dup is not None
        }), 201
    finally:
        db.close()

@app.route('/api/transactions/<int:tx_id>', methods=['GET'])
def get_transaction_detail(tx_id):
    db = SessionLocal()
    try:
        tx = db.query(Transaction).filter_by(id=tx_id).first()
        if not tx:
            return jsonify({'error': 'Transaction not found'}), 404
        cat = tx.category
        sub = tx.subcategory
        return jsonify({
            'id': tx.id,
            'amount': tx.amount,
            'type': tx.type,
            'merchant_or_title': tx.merchant_or_title,
            'category_id': tx.category_id,
            'category_name': cat.name if cat else 'Uncategorized',
            'category_icon': cat.icon if cat else 'tag',
            'category_color': cat.color if cat else '#64748B',
            'category_bg_color': cat.bg_color if cat else '#F1F5F9',
            'subcategory_id': tx.subcategory_id,
            'subcategory_name': sub.name if sub else None,
            'display_category': f"{cat.name if cat else 'None'} > {sub.name if sub else 'General'}",
            'payment_method': tx.payment_method,
            'account_name': tx.account_name,
            'transaction_date': tx.transaction_date.isoformat(),
            'formatted_date': tx.transaction_date.strftime('%d %b %Y, %I:%M %p'),
            'notes': tx.notes or '',
            'receipt_url': tx.receipt_url,
            'is_auto_categorized': tx.is_auto_categorized,
            'auto_detected_reason': tx.auto_detected_reason
        })
    finally:
        db.close()

@app.route('/api/transactions/<int:tx_id>', methods=['PUT'])
def update_transaction(tx_id):
    db = SessionLocal()
    try:
        tx = db.query(Transaction).filter_by(id=tx_id).first()
        if not tx:
            return jsonify({'error': 'Transaction not found'}), 404
        data = request.get_json() or {}
        
        if 'amount' in data:
            tx.amount = float(data['amount'])
        if 'merchant_or_title' in data:
            tx.merchant_or_title = data['merchant_or_title']
        if 'type' in data:
            tx.type = data['type']
        if 'category_id' in data:
            tx.category_id = data['category_id']
            # Manual edit means user confirmed or altered
            tx.is_auto_categorized = False
            tx.auto_detected_reason = "Manually updated by user"
        if 'subcategory_id' in data:
            tx.subcategory_id = data['subcategory_id']
        if 'payment_method' in data:
            tx.payment_method = data['payment_method']
        if 'account_name' in data:
            tx.account_name = data['account_name']
        if 'notes' in data:
            tx.notes = data['notes']
        if 'transaction_date' in data:
            try:
                tx.transaction_date = datetime.fromisoformat(data['transaction_date'].replace('Z', ''))
            except Exception:
                pass

        db.commit()
        return jsonify({'message': 'Transaction updated successfully'})
    finally:
        db.close()

@app.route('/api/transactions/<int:tx_id>', methods=['DELETE'])
def delete_transaction(tx_id):
    db = SessionLocal()
    try:
        tx = db.query(Transaction).filter_by(id=tx_id).first()
        if not tx:
            return jsonify({'error': 'Transaction not found'}), 404
        db.delete(tx)
        db.commit()
        return jsonify({'message': 'Transaction deleted successfully'})
    finally:
        db.close()

# ----------------- ANALYTICS & DASHBOARD -----------------
@app.route('/api/analytics/summary', methods=['GET'])
def get_analytics_summary():
    db = SessionLocal()
    try:
        user_id = request.args.get('user_id', 1, type=int)
        now = datetime.now()
        today_start = datetime(now.year, now.month, now.day)
        today_end = today_start + timedelta(days=1)
        yesterday_start = today_start - timedelta(days=1)
        week_start = today_start - timedelta(days=now.weekday()) # Monday start
        prev_week_start = week_start - timedelta(days=7)
        month_start = datetime(now.year, now.month, 1)
        prev_month_end = month_start - timedelta(seconds=1)
        prev_month_start = datetime(prev_month_end.year, prev_month_end.month, 1)

        # 1. Today's expenses
        today_txs = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.type == 'expense',
            Transaction.transaction_date >= today_start,
            Transaction.transaction_date < today_end
        ).all()
        today_total = sum(t.amount for t in today_txs)
        today_count = len(today_txs)

        # 2. Yesterday's expenses
        yesterday_txs = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.type == 'expense',
            Transaction.transaction_date >= yesterday_start,
            Transaction.transaction_date < today_start
        ).all()
        yesterday_total = sum(t.amount for t in yesterday_txs)

        # 3. This Week's expenses
        this_week_txs = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.type == 'expense',
            Transaction.transaction_date >= week_start
        ).all()
        this_week_total = sum(t.amount for t in this_week_txs)

        # Yesterday comparison
        today_diff_pct = round(((today_total - yesterday_total) / yesterday_total) * 100, 1) if yesterday_total > 0 else 0.0

        # Previous week expenses for comparison
        prev_week_txs = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.type == 'expense',
            Transaction.transaction_date >= prev_week_start,
            Transaction.transaction_date < week_start
        ).all()
        prev_week_total = sum(t.amount for t in prev_week_txs)
        week_diff_pct = round(((this_week_total - prev_week_total) / prev_week_total) * 100, 1) if prev_week_total > 0 else 0.0

        # 4. This Month's expenses
        this_month_txs = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.type == 'expense',
            Transaction.transaction_date >= month_start
        ).all()
        this_month_total = sum(t.amount for t in this_month_txs)

        prev_month_txs = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.type == 'expense',
            Transaction.transaction_date >= prev_month_start,
            Transaction.transaction_date < month_start
        ).all()
        prev_month_total = sum(t.amount for t in prev_month_txs)
        month_diff_pct = round(((this_month_total - prev_month_total) / prev_month_total) * 100, 1) if prev_month_total > 0 else 0.0

        # 5. Income & Savings
        this_month_income_txs = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.type == 'income',
            Transaction.transaction_date >= month_start
        ).all()
        total_income = sum(t.amount for t in this_month_income_txs)
        net_cash_flow = total_income - this_month_total
        savings_rate = round((net_cash_flow / total_income * 100), 1) if total_income > 0 else 0.0

        # 6. Budget
        overall_budget = db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.category_id.is_(None)
        ).first()
        budget_limit = overall_budget.amount if overall_budget else 0.0
        budget_remaining = max(0.0, budget_limit - this_month_total) if budget_limit > 0 else 0.0
        budget_used_pct = round((this_month_total / budget_limit) * 100, 1) if budget_limit > 0 else 0.0

        # 7. Total Accounts Balance
        accounts = db.query(Account).filter_by(user_id=user_id).all()
        total_balance = sum(a.balance for a in accounts)

        # 8. Average daily spending this month
        days_passed = max(1, now.day)
        avg_daily = round(this_month_total / days_passed, 2)

        return jsonify({
            'today': {
                'total': today_total,
                'count': today_count,
                'diff_yesterday_pct': today_diff_pct
            },
            'yesterday': {
                'total': yesterday_total
            },
            'this_week': {
                'total': this_week_total,
                'diff_pct': week_diff_pct
            },
            'this_month': {
                'total': this_month_total,
                'diff_pct': month_diff_pct
            },
            'budget': {
                'limit': budget_limit,
                'remaining': budget_remaining,
                'used_pct': budget_used_pct
            },
            'savings': {
                'total_income': total_income,
                'total_expense': this_month_total,
                'net_savings': net_cash_flow,
                'savings_rate': savings_rate
            },
            'total_balance': total_balance,
            'avg_daily_spending': avg_daily
        })
    finally:
        db.close()

# ----------------- CHARTS & REPORTS -----------------
@app.route('/api/analytics/reports', methods=['GET'])
def get_reports_data():
    db = SessionLocal()
    try:
        user_id = request.args.get('user_id', 1, type=int)
        period = request.args.get('period', 'month') # 'month', 'week', 'year'
        
        now = datetime.now()
        month_start = datetime(now.year, now.month, 1)

        # Category spending breakdown
        txs = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.type == 'expense',
            Transaction.transaction_date >= month_start
        ).all()

        cat_totals = {}
        total_exp = sum(t.amount for t in txs)

        if total_exp > 0:
            for t in txs:
                cname = t.category.name if t.category else "Others"
                if "Food" in cname:
                    group_name = "Food"
                    color = "#3B82F6"
                elif "Transport" in cname:
                    group_name = "Transportation"
                    color = "#10B981"
                elif "Shopping" in cname:
                    group_name = "Shopping"
                    color = "#F43F5E"
                elif "Home" in cname:
                    group_name = "Home"
                    color = "#F59E0B"
                elif "Health" in cname:
                    group_name = "Health"
                    color = "#8B5CF6"
                else:
                    group_name = "Others"
                    color = "#06B6D4"

                if group_name not in cat_totals:
                    cat_totals[group_name] = {'name': group_name, 'value': 0.0, 'color': color}
                cat_totals[group_name]['value'] += t.amount

        category_pie = []
        if total_exp > 0:
            for name, data in cat_totals.items():
                pct = round((data['value'] / total_exp) * 100)
                category_pie.append({
                    'name': name,
                    'amount': data['value'],
                    'percentage': pct,
                    'color': data['color']
                })
            category_pie.sort(key=lambda x: x['amount'], reverse=True)

        # Daily expense trend (last 7 days)
        daily_trend = []
        for i in range(6, -1, -1):
            d = (now - timedelta(days=i)).date()
            d_start = datetime(d.year, d.month, d.day)
            d_end = d_start + timedelta(days=1)
            day_sum = db.query(func.sum(Transaction.amount)).filter(
                Transaction.user_id == user_id,
                Transaction.type == 'expense',
                Transaction.transaction_date >= d_start,
                Transaction.transaction_date < d_end
            ).scalar() or 0.0

            daily_trend.append({
                'date': d.strftime('%d %b'),
                'day': d.strftime('%a'),
                'amount': day_sum
            })

        # Payment methods distribution
        pay_methods = {}
        for t in txs:
            pm = t.payment_method or 'UPI'
            pay_methods[pm] = pay_methods.get(pm, 0.0) + t.amount

        if total_exp > 0:
            if category_pie:
                insight_str = f"Top spending category this month: {category_pie[0]['name']} ({category_pie[0]['percentage']}% of total spending)."
            else:
                insight_str = f"Total recorded spending this month is ₹ {int(total_exp):,}."
        else:
            insight_str = "No expenses recorded yet. Add your first transaction to generate smart insights!"

        return jsonify({
            'total_expenses': total_exp,
            'category_spending': category_pie,
            'daily_trend': daily_trend,
            'payment_methods': [{'method': k, 'amount': v} for k, v in pay_methods.items()],
            'insight': insight_str
        })
    finally:
        db.close()


# ----------------- CALENDAR DATA -----------------
@app.route('/api/analytics/calendar', methods=['GET'])
def get_calendar_data():
    db = SessionLocal()
    try:
        user_id = request.args.get('user_id', 1, type=int)
        year = request.args.get('year', datetime.now().year, type=int)
        month = request.args.get('month', datetime.now().month, type=int)

        start = datetime(year, month, 1)
        if month == 12:
            end = datetime(year + 1, 1, 1)
        else:
            end = datetime(year, month + 1, 1)

        txs = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.type == 'expense',
            Transaction.transaction_date >= start,
            Transaction.transaction_date < end
        ).all()

        daily_map = {}
        for t in txs:
            day_num = t.transaction_date.day
            daily_map[day_num] = daily_map.get(day_num, 0.0) + t.amount

        # Determine thresholds: low < 500, med < 1500, high >= 1500
        days_data = {}
        for day, amt in daily_map.items():
            if amt < 500:
                level = 'low'
            elif amt < 1500:
                level = 'medium'
            else:
                level = 'high'
            days_data[day] = {
                'day': day,
                'amount': amt,
                'level': level
            }

        return jsonify({
            'year': year,
            'month': month,
            'days': days_data
        })
    finally:
        db.close()

# ----------------- BUDGETS -----------------
@app.route('/api/budgets', methods=['GET'])
def get_budgets():
    db = SessionLocal()
    try:
        user_id = request.args.get('user_id', 1, type=int)
        budgets = db.query(Budget).filter_by(user_id=user_id).all()
        now = datetime.now()
        month_start = datetime(now.year, now.month, 1)

        res = []
        for b in budgets:
            if b.category_id:
                spent = db.query(func.sum(Transaction.amount)).filter(
                    Transaction.user_id == user_id,
                    Transaction.category_id == b.category_id,
                    Transaction.type == 'expense',
                    Transaction.transaction_date >= month_start
                ).scalar() or 0.0
                cat = b.category
                name = cat.name if cat else "Category"
                icon = cat.icon if cat else "wallet"
                color = cat.color if cat else "#10B981"
            else:
                spent = db.query(func.sum(Transaction.amount)).filter(
                    Transaction.user_id == user_id,
                    Transaction.type == 'expense',
                    Transaction.transaction_date >= month_start
                ).scalar() or 0.0
                name = "Overall Monthly Budget"
                icon = "piggy-bank"
                color = "#10B981"

            pct = round((spent / b.amount) * 100) if b.amount > 0 else 0
            res.append({
                'id': b.id,
                'category_id': b.category_id,
                'name': name,
                'icon': icon,
                'color': color,
                'budget_amount': b.amount,
                'spent_amount': spent,
                'remaining': max(0.0, b.amount - spent),
                'percentage': pct,
                'is_over_budget': spent > b.amount
            })
        return jsonify(res)
    finally:
        db.close()

@app.route('/api/budgets', methods=['POST'])
def set_budget():
    db = SessionLocal()
    try:
        data = request.get_json() or {}
        user_id = data.get('user_id', 1)
        user = db.query(User).filter_by(id=user_id).first()
        if not user:
            user = User(id=user_id, name="User", email="user@example.com")
            db.add(user)
            db.commit()

        cat_id = data.get('category_id') # None for overall
        amount = float(data.get('amount', 0))
        if amount <= 0:
            return jsonify({'error': 'Amount must be greater than zero'}), 400

        existing = db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.category_id == cat_id
        ).first()

        if existing:
            existing.amount = amount
        else:
            b = Budget(user_id=user_id, category_id=cat_id, amount=amount)
            db.add(b)
        db.commit()
        return jsonify({'message': 'Budget configured successfully'})
    finally:
        db.close()

# ----------------- RULES -----------------
@app.route('/api/rules', methods=['GET'])
def get_rules():
    db = SessionLocal()
    try:
        user_id = request.args.get('user_id', 1, type=int)
        rules = db.query(CategoryRule).filter_by(user_id=user_id).all()
        res = []
        for r in rules:
            cat = db.query(Category).filter_by(id=r.category_id).first()
            sub = db.query(Subcategory).filter_by(id=r.subcategory_id).first() if r.subcategory_id else None
            res.append({
                'id': r.id,
                'keyword': r.keyword,
                'category_id': r.category_id,
                'category_name': cat.name if cat else '',
                'subcategory_id': r.subcategory_id,
                'subcategory_name': sub.name if sub else 'General'
            })
        return jsonify(res)
    finally:
        db.close()

@app.route('/api/rules', methods=['POST'])
def add_rule():
    db = SessionLocal()
    try:
        data = request.get_json() or {}
        user_id = data.get('user_id', 1)
        keyword = data.get('keyword', '').strip()
        cat_id = data.get('category_id')
        sub_id = data.get('subcategory_id')

        if not keyword or not cat_id:
            return jsonify({'error': 'Keyword and category are required'}), 400

        rule = CategoryRule(
            user_id=user_id,
            keyword=keyword,
            category_id=cat_id,
            subcategory_id=sub_id
        )
        db.add(rule)
        db.commit()
        return jsonify({'message': 'Rule added successfully', 'id': rule.id}), 201
    finally:
        db.close()

# ----------------- EXPORT TO CSV / EXCEL / PDF -----------------
@app.route('/api/export/csv', methods=['GET'])
def export_csv():
    db = SessionLocal()
    try:
        txs = db.query(Transaction).order_by(desc(Transaction.transaction_date)).all()
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['ID', 'Date', 'Type', 'Merchant / Description', 'Category', 'Subcategory', 'Payment Method', 'Account', 'Amount', 'Notes'])
        for t in txs:
            writer.writerow([
                t.id,
                t.transaction_date.strftime('%Y-%m-%d %H:%M'),
                t.type,
                t.merchant_or_title,
                t.category.name if t.category else '',
                t.subcategory.name if t.subcategory else '',
                t.payment_method,
                t.account_name,
                t.amount,
                t.notes or ''
            ])
        output.seek(0)
        return send_file(
            io.BytesIO(output.getvalue().encode('utf-8')),
            mimetype='text/csv',
            as_attachment=True,
            download_name='expense_transactions.csv'
        )
    finally:
        db.close()

@app.route('/api/export/excel', methods=['GET'])
def export_excel():
    db = SessionLocal()
    try:
        txs = db.query(Transaction).order_by(desc(Transaction.transaction_date)).all()
        data = []
        for t in txs:
            data.append({
                'ID': t.id,
                'Date': t.transaction_date.strftime('%Y-%m-%d %H:%M'),
                'Type': t.type,
                'Merchant / Description': t.merchant_or_title,
                'Category': t.category.name if t.category else '',
                'Subcategory': t.subcategory.name if t.subcategory else '',
                'Payment Method': t.payment_method,
                'Account': t.account_name,
                'Amount': t.amount,
                'Notes': t.notes or ''
            })
        df = pd.DataFrame(data)
        out = io.BytesIO()
        with pd.ExcelWriter(out, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Transactions')
        out.seek(0)
        return send_file(
            out,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name='expense_transactions.xlsx'
        )
    finally:
        db.close()

# ----------------- FRONTEND SPA SERVING -----------------
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path.startswith('api'):
        return jsonify({'error': 'Not Found'}), 404
    if FRONTEND_DIST and path != '' and os.path.exists(os.path.join(FRONTEND_DIST, path)):
        return send_file(os.path.join(FRONTEND_DIST, path))
    index_file = os.path.join(FRONTEND_DIST, 'index.html')
    if FRONTEND_DIST and os.path.exists(index_file):
        return send_file(index_file)
    return jsonify({
        'status': 'online',
        'app': 'Smart Expense Tracker API',
        'hint': 'Build the frontend to view the web application.'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
