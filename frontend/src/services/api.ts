import {
  User,
  Category,
  Transaction,
  TransactionsResponse,
  AutoCategorizeResult,
  AnalyticsSummary,
  ReportsData,
  CalendarData,
  BudgetCategory,
  CategoryRuleItem
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

export async function fetchCurrentUser(): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function createCategory(data: {
  name: string;
  icon?: string;
  color?: string;
  bg_color?: string;
  subcategories?: string[];
}): Promise<void> {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create category');
}

export async function fetchTransactions(filters?: {
  search?: string;
  category_id?: number;
  type?: string;
  payment_method?: string;
  sort_by?: string;
}): Promise<TransactionsResponse> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.category_id) params.append('category_id', filters.category_id.toString());
  if (filters?.type) params.append('type', filters.type);
  if (filters?.payment_method) params.append('payment_method', filters.payment_method);
  if (filters?.sort_by) params.append('sort_by', filters.sort_by);

  const res = await fetch(`${API_BASE}/transactions?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function fetchTransaction(id: number): Promise<Transaction> {
  const res = await fetch(`${API_BASE}/transactions/${id}`);
  if (!res.ok) throw new Error('Failed to fetch transaction');
  return res.json();
}

export async function createTransaction(data: {
  amount: number;
  merchant_or_title: string;
  type?: string;
  category_id?: number | null;
  subcategory_id?: number | null;
  payment_method?: string;
  account_name?: string;
  transaction_date?: string;
  notes?: string;
  receipt_url?: string;
  is_auto_categorized?: boolean;
  auto_detected_reason?: string;
}): Promise<{ id: number; message: string; is_duplicate_warning: boolean }> {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create transaction');
  return res.json();
}

export async function updateTransaction(id: number, data: Partial<Transaction>): Promise<void> {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update transaction');
}

export async function deleteTransaction(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete transaction');
}

export async function autoCategorize(text: string): Promise<AutoCategorizeResult> {
  const res = await fetch(`${API_BASE}/categorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error('Failed to auto categorize');
  return res.json();
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  const res = await fetch(`${API_BASE}/analytics/summary`);
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.json();
}

export async function fetchReports(period: string = 'month'): Promise<ReportsData> {
  const res = await fetch(`${API_BASE}/analytics/reports?period=${period}`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function fetchCalendar(year?: number, month?: number): Promise<CalendarData> {
  const params = new URLSearchParams();
  if (year) params.append('year', year.toString());
  if (month) params.append('month', month.toString());
  const res = await fetch(`${API_BASE}/analytics/calendar?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch calendar');
  return res.json();
}

export async function fetchBudgets(): Promise<BudgetCategory[]> {
  const res = await fetch(`${API_BASE}/budgets`);
  if (!res.ok) throw new Error('Failed to fetch budgets');
  return res.json();
}

export async function setBudget(data: { category_id?: number | null; amount: number }): Promise<void> {
  const res = await fetch(`${API_BASE}/budgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to set budget');
}

export async function fetchRules(): Promise<CategoryRuleItem[]> {
  const res = await fetch(`${API_BASE}/rules`);
  if (!res.ok) throw new Error('Failed to fetch rules');
  return res.json();
}

export async function addRule(data: {
  keyword: string;
  category_id: number;
  subcategory_id?: number | null;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to add rule');
}
