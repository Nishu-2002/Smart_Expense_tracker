import os
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, Numeric, DateTime, 
    ForeignKey, Boolean, Text, MetaData, Date, ARRAY
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

# 1. Load configuration from .env or .env.txt in root or backend folder
env_paths = [
    Path(__file__).resolve().parent.parent / '.env',
    Path(__file__).resolve().parent.parent / '.env.txt',
    Path(__file__).resolve().parent / '.env',
    Path(__file__).resolve().parent / '.env.txt',
]
for p in env_paths:
    if p.exists():
        load_dotenv(p)
        break

DB_NAME = os.environ.get('DB_NAME')
DB_USER = os.environ.get('DB_USER', 'postgres')
DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
DB_HOST = os.environ.get('DB_HOST', 'localhost:5432')
DB_SCHEMA = os.environ.get('DB_SCHEMA', 'smart_expense').strip()
DATABASE_URL = os.environ.get('DATABASE_URL')

# 2. Determine Database Engine and Schema
if DATABASE_URL:
    DB_URL = DATABASE_URL
    is_postgres = DB_URL.startswith('postgresql')
elif DB_NAME:
    if ':' in DB_HOST:
        h, p = DB_HOST.split(':', 1)
    else:
        h, p = DB_HOST, '5432'
    DB_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{h}:{p}/{DB_NAME.strip()}"
    is_postgres = True
else:
    DB_URL = 'sqlite:///smart_expense.db'
    is_postgres = False

if is_postgres:
    schema = DB_SCHEMA or 'smart_expense'
    meta = MetaData(schema=schema)
    engine = create_engine(
        DB_URL,
        connect_args={"options": f"-csearch_path={schema},public"},
        pool_pre_ping=True
    )
else:
    schema = None
    meta = MetaData()
    engine = create_engine(DB_URL, echo=False)

Base = declarative_base(metadata=meta)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ==========================================
# 3. MODELS DEFINITIONS
# ==========================================

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, default='Nishanth')
    email = Column(String(120), unique=True, nullable=False, default='nishanth@example.com')
    password_hash = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    currency = Column(String(10), default='₹')
    timezone = Column(String(50), default='Asia/Kolkata')
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")
    rules = relationship("CategoryRule", back_populates="user", cascade="all, delete-orphan")
    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    recurring_expenses = relationship("RecurringExpense", back_populates="user", cascade="all, delete-orphan")

class UserPreference(Base):
    __tablename__ = 'user_preferences'
    
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    currency_code = Column(String(10), default='INR')
    currency_symbol = Column(String(5), default='₹')
    timezone = Column(String(50), default='Asia/Kolkata')
    theme = Column(String(20), default='system') # 'light', 'dark', 'system'
    date_format = Column(String(20), default='DD/MM/YYYY')
    email_notifications_enabled = Column(Boolean, default=False)
    inapp_notifications_enabled = Column(Boolean, default=True)
    default_account_id = Column(Integer, nullable=True)
    default_payment_method = Column(String(50), default='UPI')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="preferences")

class Account(Base):
    __tablename__ = 'accounts'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(100), nullable=False) # e.g. "HDFC Bank", "Cash Wallet"
    account_type = Column(String(50), default='Bank Account') # 'Bank Account', 'Cash', 'Credit Card', 'Wallet'
    opening_balance = Column(Float, default=0.0)
    balance = Column(Float, default=0.0)
    currency = Column(String(10), default='₹')
    institution_name = Column(String(100), nullable=True)
    account_number_last4 = Column(String(4), nullable=True)
    icon = Column(String(50), default='landmark')
    color = Column(String(30), default='#0f766e')
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="accounts")

class Category(Base):
    __tablename__ = 'categories'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    icon = Column(String(50), nullable=False)
    color = Column(String(30), nullable=False)
    bg_color = Column(String(30), nullable=False)
    type = Column(String(20), default='expense') # 'expense', 'income', 'transfer'
    display_order = Column(Integer, default=0)
    is_custom = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    subcategories = relationship("Subcategory", back_populates="category", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="category")
    budgets = relationship("Budget", back_populates="category")

class Subcategory(Base):
    __tablename__ = 'subcategories'
    
    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey('categories.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(100), nullable=False)
    icon = Column(String(50), nullable=True)
    is_custom = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    category = relationship("Category", back_populates="subcategories")
    transactions = relationship("Transaction", back_populates="subcategory")

class PaymentMethod(Base):
    __tablename__ = 'payment_methods'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    name = Column(String(50), nullable=False) # 'UPI', 'Debit Card', 'Credit Card', 'Cash', 'Net Banking'
    icon = Column(String(50), default='credit-card')
    is_active = Column(Boolean, default=True)

class Transaction(Base):
    __tablename__ = 'transactions'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default='₹')
    type = Column(String(20), default='expense') # expense, income, transfer
    merchant_or_title = Column(String(200), nullable=False)
    
    category_id = Column(Integer, ForeignKey('categories.id', ondelete='SET NULL'), nullable=True)
    subcategory_id = Column(Integer, ForeignKey('subcategories.id', ondelete='SET NULL'), nullable=True)
    account_id = Column(Integer, ForeignKey('accounts.id', ondelete='SET NULL'), nullable=True)
    to_account_id = Column(Integer, ForeignKey('accounts.id', ondelete='SET NULL'), nullable=True)
    
    payment_method = Column(String(50), default='UPI')
    account_name = Column(String(100), default='HDFC Bank')
    transaction_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
    receipt_url = Column(String(500), nullable=True)
    
    is_auto_categorized = Column(Boolean, default=False)
    auto_detected_reason = Column(String(200), nullable=True)
    confidence_score = Column(Float, default=1.0)
    is_user_confirmed = Column(Boolean, default=True)
    recurring_expense_id = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")
    subcategory = relationship("Subcategory", back_populates="transactions")
    receipts = relationship("Receipt", back_populates="transaction", cascade="all, delete-orphan")

class Receipt(Base):
    __tablename__ = 'receipts'
    
    id = Column(Integer, primary_key=True)
    transaction_id = Column(Integer, ForeignKey('transactions.id', ondelete='CASCADE'), nullable=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    file_path = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=False)
    mime_type = Column(String(100), default='image/jpeg')
    file_size_bytes = Column(Integer, default=0)
    ocr_raw_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    transaction = relationship("Transaction", back_populates="receipts")
    user = relationship("User")

class Budget(Base):
    __tablename__ = 'budgets'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id', ondelete='CASCADE'), nullable=True) # Null = overall monthly
    amount = Column(Float, nullable=False)
    period = Column(String(20), default='monthly') # monthly, weekly, custom
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    alert_threshold_pct = Column(Integer, default=80)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")

class RecurringExpense(Base):
    __tablename__ = 'recurring_expenses'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = Column(String(200), nullable=False) # e.g. "Netflix", "Rent"
    merchant = Column(String(150), nullable=True)
    amount = Column(Float, nullable=False)
    type = Column(String(20), default='expense')
    category_id = Column(Integer, ForeignKey('categories.id', ondelete='RESTRICT'), nullable=False)
    subcategory_id = Column(Integer, ForeignKey('subcategories.id', ondelete='SET NULL'), nullable=True)
    account_id = Column(Integer, ForeignKey('accounts.id', ondelete='SET NULL'), nullable=True)
    payment_method = Column(String(50), default='UPI')
    frequency = Column(String(20), default='monthly') # daily, weekly, monthly, yearly
    interval_count = Column(Integer, default=1)
    start_date = Column(Date, nullable=True)
    next_due_date = Column(DateTime, nullable=False)
    end_date = Column(Date, nullable=True)
    reminder_days_before = Column(Integer, default=3)
    auto_create_transaction = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    last_generated_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="recurring_expenses")
    category = relationship("Category")
    subcategory = relationship("Subcategory")

class CategoryRule(Base):
    __tablename__ = 'category_rules'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    keyword = Column(String(500), nullable=False)
    match_type = Column(String(20), default='contains') # 'contains', 'exact', 'regex'
    category_id = Column(Integer, ForeignKey('categories.id', ondelete='CASCADE'), nullable=False)
    subcategory_id = Column(Integer, ForeignKey('subcategories.id', ondelete='SET NULL'), nullable=True)
    priority = Column(Integer, default=10)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="rules")
    category = relationship("Category")
    subcategory = relationship("Subcategory")

class MerchantMapping(Base):
    __tablename__ = 'merchant_mappings'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    merchant_normalized = Column(String(150), nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id', ondelete='CASCADE'), nullable=False)
    subcategory_id = Column(Integer, ForeignKey('subcategories.id', ondelete='SET NULL'), nullable=True)
    times_confirmed = Column(Integer, default=1)
    last_used_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = 'notifications'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default='budget_threshold') # 'budget_threshold', 'bill_due', 'insight', 'system'
    severity = Column(String(20), default='info') # 'info', 'warning', 'critical'
    is_read = Column(Boolean, default=False)
    action_url = Column(String(255), nullable=True)
    related_entity_type = Column(String(50), nullable=True)
    related_entity_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="notifications")

class Tag(Base):
    __tablename__ = 'tags'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(50), nullable=False)
    color = Column(String(30), default='#64748b')
    created_at = Column(DateTime, default=datetime.utcnow)

class TransactionTag(Base):
    __tablename__ = 'transaction_tags'
    
    transaction_id = Column(Integer, ForeignKey('transactions.id', ondelete='CASCADE'), primary_key=True)
    tag_id = Column(Integer, ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True)

class ImportLog(Base):
    __tablename__ = 'import_logs'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(20), default='csv') # 'csv', 'excel'
    records_count = Column(Integer, default=0)
    status = Column(String(50), default='completed') # 'processing', 'completed', 'failed'
    error_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

def init_db():
    if is_postgres:
        with engine.connect() as conn:
            from sqlalchemy import text
            conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema};"))
            conn.commit()
    Base.metadata.create_all(bind=engine)
