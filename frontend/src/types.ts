export interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
  icon: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
  currency: string;
  timezone: string;
  accounts: Account[];
}

export interface Subcategory {
  id: number;
  name: string;
  icon?: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  bg_color: string;
  type: 'expense' | 'income' | 'transfer';
  is_custom: boolean;
  subcategories: Subcategory[];
  subcategories_summary?: string;
}

export interface Transaction {
  id: number;
  amount: number;
  type: 'expense' | 'income' | 'transfer';
  merchant_or_title: string;
  category_id?: number;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  category_bg_color?: string;
  subcategory_id?: number;
  subcategory_name?: string;
  subtitle?: string;
  payment_method: string;
  account_name: string;
  transaction_date: string;
  time_display?: string;
  formatted_date?: string;
  display_category?: string;
  notes?: string;
  receipt_url?: string;
  is_auto_categorized?: boolean;
  auto_detected_reason?: string;
}

export interface TransactionGroup {
  date_label: string;
  raw_date: string;
  total: number;
  transactions: Transaction[];
}

export interface TransactionsResponse {
  total_count: number;
  grand_total: number;
  items: Transaction[];
  grouped_by_date: TransactionGroup[];
}

export interface AutoCategorizeResult {
  detected: boolean;
  category_id: number | null;
  category_name: string | null;
  subcategory_id: number | null;
  subcategory_name: string | null;
  display_path: string | null;
  reason: string | null;
  confidence: number;
}

export interface AnalyticsSummary {
  today: {
    total: number;
    count: number;
    diff_yesterday_pct: number;
  };
  yesterday: {
    total: number;
  };
  this_week: {
    total: number;
    diff_pct: number;
  };
  this_month: {
    total: number;
    diff_pct: number;
  };
  budget: {
    limit: number;
    remaining: number;
    used_pct: number;
  };
  savings: {
    total_income: number;
    total_expense: number;
    net_savings: number;
    savings_rate: number;
  };
  total_balance: number;
  avg_daily_spending: number;
}

export interface CategorySpending {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface DailyTrendItem {
  date: string;
  day: string;
  amount: number;
}

export interface ReportsData {
  total_expenses: number;
  category_spending: CategorySpending[];
  daily_trend: DailyTrendItem[];
  payment_methods: { method: string; amount: number }[];
  insight: string;
}

export interface CalendarDayInfo {
  day: number;
  amount: number;
  level: 'low' | 'medium' | 'high';
}

export interface CalendarData {
  year: number;
  month: number;
  days: Record<number, CalendarDayInfo>;
}

export interface BudgetCategory {
  id: number;
  category_id: number | null;
  name: string;
  icon: string;
  color: string;
  budget_amount: number;
  spent_amount: number;
  remaining: number;
  percentage: number;
  is_over_budget: boolean;
}

export interface CategoryRuleItem {
  id: number;
  keyword: string;
  category_id: number;
  category_name: string;
  subcategory_id: number | null;
  subcategory_name: string;
}

export type ActiveTab = 'home' | 'transactions' | 'add' | 'budgets' | 'categories' | 'reports' | 'calendar';
