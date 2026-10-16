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

import * as localStore from './localStore';

const CUSTOM_API_KEY = 'smart_expense_custom_api_url';

export function isGitHubPages(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hostname.endsWith('github.io') ||
    window.location.protocol === 'file:'
  );
}

export function getCustomApiUrl(): string {
  if (typeof window === 'undefined') return '';
  return (localStorage.getItem(CUSTOM_API_KEY) || '').trim();
}

export function setCustomApiUrl(url: string): void {
  if (typeof window === 'undefined') return;
  const clean = url.trim().replace(/\/+$/, '');
  if (!clean) {
    localStorage.removeItem(CUSTOM_API_KEY);
  } else {
    localStorage.setItem(CUSTOM_API_KEY, clean);
  }
}

export function getEffectiveApiBase(): string | null {
  const custom = getCustomApiUrl();
  if (custom) return custom;

  const envUrl = (import.meta.env.VITE_API_BASE_URL as string || '').trim();
  if (envUrl) return envUrl.replace(/\/+$/, '');

  // If on GitHub Pages and no explicit cloud API URL is provided,
  // GitHub Pages has no server to handle /api requests. Use browser storage directly.
  if (isGitHubPages()) {
    return null;
  }

  // Local development or unified server (Render, Docker)
  return '/api';
}

export function isUsingLocalStorage(): boolean {
  return getEffectiveApiBase() === null;
}

// ----------------- USER & AUTH -----------------

export async function fetchCurrentUser(): Promise<User> {
  const baseUrl = getEffectiveApiBase();
  if (!baseUrl) {
    return localStore.getLocalUser();
  }

  try {
    const res = await fetch(`${baseUrl}/auth/me`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.warn('[API] Could not fetch user from backend, using local store:', err);
    return localStore.getLocalUser();
  }
}

// ----------------- CATEGORIES -----------------

export async function fetchCategories(): Promise<Category[]> {
  const baseUrl = getEffectiveApiBase();
  if (!baseUrl) {
    return localStore.getLocalCategories();
  }

  try {
    const res = await fetch(`${baseUrl}/categories`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.warn('[API] Could not fetch categories from backend, using local store:', err);
    return localStore.getLocalCategories();
  }
}

export async function createCategory(data: {
  name: string;
  icon?: string;
  color?: string;
  bg_color?: string;
  subcategories?: string[];
}): Promise<void> {
  const baseUrl = getEffectiveApiBase();
  if (!baseUrl) {
    localStore.createLocalCategory(data);
    return;
  }

  try {
    const res = await fetch(`${baseUrl}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create category');
  } catch (err) {
    console.warn('[API] Create category failed on backend, saving locally:', err);
    localStore.createLocalCategory(data);
  }
}

// ----------------- TRANSACTIONS -----------------

export async function fetchTransactions(filters?: {
  search?: string;
  category_id?: number;
  type?: string;
  payment_method?: string;
  sort_by?: string;
}): Promise<TransactionsResponse> {
  const baseUrl = getEffectiveApiBase();
  if (!baseUrl) {
    return localStore.getLocalTransactions(filters);
  }

  try {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category_id) params.append('category_id', filters.category_id.toString());
    if (filters?.type) params.append('type', filters.type);
    if (filters?.payment_method) params.append('payment_method', filters.payment_method);
    if (filters?.sort_by) params.append('sort_by', filters.sort_by);

    const res = await fetch(`${baseUrl}/transactions?${params.toString()}`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.warn('[API] Fetch transactions failed on backend, using local store:', err);
    return localStore.getLocalTransactions(filters);
  }
}

export async function fetchTransaction(id: number): Promise<Transaction> {
  const baseUrl = getEffectiveApiBase();
  if (!baseUrl) {
    return localStore.getLocalTransaction(id);
  }

  try {
    const res = await fetch(`${baseUrl}/transactions/${id}`);
    if (!res.ok) throw new Error('Transaction not found');
    return await res.json();
  } catch (err) {
    console.warn('[API] Fetch transaction failed on backend, using local store:', err);
    return localStore.getLocalTransaction(id);
  }
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
  const baseUrl = getEffectiveApiBase();

  // If no cloud API is available (e.g. GitHub Pages static hosting), store directly in browser
  if (!baseUrl) {
    return localStore.createLocalTransaction(data);
  }

  try {
    const res = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[API] Create transaction failed on backend, falling back to local storage:', err);
    return localStore.createLocalTransaction(data);
  }
}

export async function updateTransaction(id: number, data: Partial<Transaction>): Promise<void> {
  const baseUrl = getEffectiveApiBase();
  if (!baseUrl) {
    localStore.updateLocalTransaction(id, data);
    return;
  }

  try {
    const res = await fetch(`${baseUrl}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update transaction');
  } catch (err) {
    console.warn('[API] Update transaction failed on backend, saving locally:', err);
    localStore.updateLocalTransaction(id, data);
  }
}

export async function deleteTransaction(id: number): Promise<void> {
  const baseUrl = getEffectiveApiBase();
  if (!baseUrl) {
    localStore.deleteLocalTransaction(id);
    return;
  }

  try {
    const res = await fetch(`${baseUrl}/transactions/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete transaction');
  } catch (err) {
    console.warn('[API] Delete transaction failed on backend, deleting locally:', err);
    localStore.deleteLocalTransaction(id);
  }
}

// ----------------- AUTO-CATEGORIZE -----------------

export async function autoCategorize(text: string): Promise<AutoCategorizeResult> {
  const baseUrl = getEffectiveApiBase();
  if (!baseUrl) {
    return localStore.autoCategorizeLocal(text);
  }

  try {
    const res = await fetch(`${baseUrl}/categorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error('Failed to auto categorize');
    return await res.json();
  } catch (err) {
    return localStore.autoCategorizeLocal(text);
  }
}

// ----------------- ANALYTICS & REPORTS -----------------

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  const baseUrl = getEffectiveApiBase();
  if (!baseUrl) {
    return localStore.getLocalAnalyticsSummary();
  }

  try {
    const res = await fetch(`${baseUrl}/analytics/summary`);
    if (!res.ok) throw new Error('Failed to fetch summary');
    return await res.json();
  } catch (err) {
    console.warn('[API] Fetch analytics summary failed on backend, using local store:', err);
    return localStore.getLocalAnalyticsSummary();
  }
}

export async function fetchReports(period: string = 'month'): Promise<ReportsData> {
  const baseUrl = getEffectiveApiBase();
  if (!baseUrl) {
    return localStore.getLocalReports(period);
  }

  try {
    const res = await fetch(`${baseUrl}/analytics/reports?period=${period}`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return await res.json();
  } catch (err) {
    console.warn('[API] Fetch reports failed on backend, using local store:', err);
    return localStore.getLocalReports(period);
  }
}

export async function fetchCalendar(year?: number, month?: number): Promise<CalendarData> {
  const baseUrl = getEffectiveApiBase();
  if (!baseUrl) {
    return localStore.getLocalCalendar(year, month);
  }

  try {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    const res = await fetch(`${baseUrl}/analytics/calendar?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch calendar');
    return await res.json();
  } catch (err) {
    console.warn('[API] Fetch calendar failed on backend, using local store:', err);
    return localStore.getLocalCalendar(year, month);
  }
}

// ----------------- BUDGETS -----------------

export async function fetchBudgets(): Promise<BudgetCategory[]> {
  const baseUrl = getEffectiveApiBase();
  if (!baseUrl) {
    return localStore.getLocalBudgets();
  }

  try {
    const res = await fetch(`${baseUrl}/budgets`);
    if (!res.ok) throw new Error('Failed to fetch budgets');
    return await res.json();
  } catch (err) {
    console.warn('[API] Fetch budgets failed on backend, using local store:', err);
    return localStore.getLocalBudgets();
  }
}

export async function setBudget(data: { category_id?: number | null; amount: number }): Promise<void> {
  const baseUrl = getEffectiveApiBase();
  if (!baseUrl) {
    localStore.setLocalBudget(data);
    return;
  }

  try {
    const res = await fetch(`${baseUrl}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to set budget');
  } catch (err) {
    console.warn('[API] Set budget failed on backend, saving locally:', err);
    localStore.setLocalBudget(data);
  }
}

// ----------------- RULES -----------------

export async function fetchRules(): Promise<CategoryRuleItem[]> {
  const baseUrl = getEffectiveApiBase();
  if (!baseUrl) {
    return localStore.getLocalRules();
  }

  try {
    const res = await fetch(`${baseUrl}/rules`);
    if (!res.ok) throw new Error('Failed to fetch rules');
    return await res.json();
  } catch (err) {
    console.warn('[API] Fetch rules failed on backend, using local store:', err);
    return localStore.getLocalRules();
  }
}

export async function addRule(data: {
  keyword: string;
  category_id: number;
  subcategory_id?: number | null;
}): Promise<void> {
  const baseUrl = getEffectiveApiBase();
  if (!baseUrl) {
    localStore.addLocalRule(data);
    return;
  }

  try {
    const res = await fetch(`${baseUrl}/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add rule');
  } catch (err) {
    console.warn('[API] Add rule failed on backend, saving locally:', err);
    localStore.addLocalRule(data);
  }
}

// ----------------- EXPORT HELPERS -----------------

export function triggerExportCsv(): void {
  const baseUrl = getEffectiveApiBase();
  if (baseUrl) {
    window.open(`${baseUrl}/export/csv`, '_blank');
  } else {
    localStore.exportLocalCsv();
  }
}

export function triggerExportExcel(): void {
  const baseUrl = getEffectiveApiBase();
  if (baseUrl) {
    window.open(`${baseUrl}/export/excel`, '_blank');
  } else {
    localStore.exportLocalCsv();
  }
}
