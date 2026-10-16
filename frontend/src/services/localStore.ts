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

const STORAGE_KEYS = {
  USER: 'smart_expense_user_v1',
  CATEGORIES: 'smart_expense_categories_v1',
  TRANSACTIONS: 'smart_expense_transactions_v1',
  BUDGETS: 'smart_expense_budgets_v1',
  RULES: 'smart_expense_rules_v1'
};

const DEFAULT_USER: User = {
  id: 1,
  name: 'Nishanth',
  email: 'nishanth@example.com',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  currency: '₹',
  timezone: 'Asia/Kolkata',
  accounts: [
    { id: 1, name: 'HDFC Bank', type: 'Bank Account', balance: 25000, icon: 'landmark' },
    { id: 2, name: 'Cash Wallet', type: 'Cash', balance: 2500, icon: 'wallet' },
    { id: 3, name: 'UPI / Paytm', type: 'Wallet', balance: 5000, icon: 'smartphone' }
  ]
};

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Food and Groceries',
    icon: 'utensils',
    color: '#F97316',
    bg_color: '#FFF3E0',
    type: 'expense',
    is_custom: false,
    subcategories: [
      { id: 101, name: 'Food Delivery', icon: 'utensils' },
      { id: 102, name: 'Restaurants and Dining', icon: 'utensils' },
      { id: 103, name: 'Tea, Coffee, and Snacks', icon: 'utensils' },
      { id: 104, name: 'Vegetables', icon: 'utensils' },
      { id: 105, name: 'Fruits', icon: 'utensils' },
      { id: 106, name: 'Milk and Dairy Products', icon: 'utensils' },
      { id: 107, name: 'Groceries and Supermarket', icon: 'utensils' }
    ]
  },
  {
    id: 2,
    name: 'Transportation',
    icon: 'car',
    color: '#10B981',
    bg_color: '#E8F5E9',
    type: 'expense',
    is_custom: false,
    subcategories: [
      { id: 201, name: 'Cab / Taxi', icon: 'car' },
      { id: 202, name: 'Metro', icon: 'car' },
      { id: 203, name: 'Bus', icon: 'car' },
      { id: 204, name: 'Fuel / Gas', icon: 'car' },
      { id: 205, name: 'Vehicle Maintenance', icon: 'car' },
      { id: 206, name: 'Train and Flight', icon: 'car' }
    ]
  },
  {
    id: 3,
    name: 'Shopping and Personal Expenses',
    icon: 'shopping-bag',
    color: '#F59E0B',
    bg_color: '#FEF3C7',
    type: 'expense',
    is_custom: false,
    subcategories: [
      { id: 301, name: 'Online Shopping', icon: 'shopping-bag' },
      { id: 302, name: 'Clothing and Footwear', icon: 'shopping-bag' },
      { id: 303, name: 'Electronics and Gadgets', icon: 'shopping-bag' },
      { id: 304, name: 'Home Appliances', icon: 'shopping-bag' },
      { id: 305, name: 'Personal Care', icon: 'shopping-bag' }
    ]
  },
  {
    id: 4,
    name: 'Home and Living',
    icon: 'home',
    color: '#6366F1',
    bg_color: '#EEF2FF',
    type: 'expense',
    is_custom: false,
    subcategories: [
      { id: 401, name: 'House Rent', icon: 'home' },
      { id: 402, name: 'Electricity Bill', icon: 'home' },
      { id: 403, name: 'Water Bill', icon: 'home' },
      { id: 404, name: 'Gas Cylinder / Cooking Gas', icon: 'home' },
      { id: 405, name: 'Internet and Wi-Fi', icon: 'home' },
      { id: 406, name: 'Mobile Recharge', icon: 'home' }
    ]
  },
  {
    id: 5,
    name: 'Bills and Utilities',
    icon: 'zap',
    color: '#0D9488',
    bg_color: '#CCFBF1',
    type: 'expense',
    is_custom: false,
    subcategories: [
      { id: 501, name: 'Credit Card Bill', icon: 'zap' },
      { id: 502, name: 'Subscriptions', icon: 'zap' },
      { id: 503, name: 'Insurance', icon: 'zap' },
      { id: 504, name: 'Loan EMI', icon: 'zap' }
    ]
  },
  {
    id: 6,
    name: 'Health and Medical',
    icon: 'heart-pulse',
    color: '#EF4444',
    bg_color: '#FEE2E2',
    type: 'expense',
    is_custom: false,
    subcategories: [
      { id: 601, name: 'Doctor Consultation', icon: 'heart-pulse' },
      { id: 602, name: 'Medicines and Pharmacy', icon: 'heart-pulse' },
      { id: 603, name: 'Diagnostic Tests', icon: 'heart-pulse' }
    ]
  },
  {
    id: 7,
    name: 'Entertainment and Leisure',
    icon: 'film',
    color: '#EC4899',
    bg_color: '#FCE7F3',
    type: 'expense',
    is_custom: false,
    subcategories: [
      { id: 701, name: 'Movies', icon: 'film' },
      { id: 702, name: 'Gaming', icon: 'film' },
      { id: 703, name: 'Outings', icon: 'film' }
    ]
  },
  {
    id: 8,
    name: 'Others',
    icon: 'more-horizontal',
    color: '#64748B',
    bg_color: '#F1F5F9',
    type: 'expense',
    is_custom: false,
    subcategories: [
      { id: 801, name: 'General', icon: 'more-horizontal' },
      { id: 802, name: 'Donations', icon: 'more-horizontal' },
      { id: 803, name: 'Miscellaneous', icon: 'more-horizontal' }
    ]
  }
];

function getInitialTransactions(): Transaction[] {
  const now = new Date();
  return [
    {
      id: 1,
      amount: 350,
      type: 'expense',
      merchant_or_title: 'Swiggy Lunch Delivery',
      category_id: 1,
      subcategory_id: 101,
      payment_method: 'UPI',
      account_name: 'UPI / Paytm',
      transaction_date: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      is_auto_categorized: true,
      auto_detected_reason: "Keyword 'Swiggy' matched Food and Groceries"
    },
    {
      id: 2,
      amount: 220,
      type: 'expense',
      merchant_or_title: 'Uber Cab to Office',
      category_id: 2,
      subcategory_id: 201,
      payment_method: 'UPI',
      account_name: 'UPI / Paytm',
      transaction_date: new Date(now.getTime() - 5 * 3600 * 1000).toISOString(),
      is_auto_categorized: true,
      auto_detected_reason: "Keyword 'Uber' matched Transportation"
    },
    {
      id: 3,
      amount: 130,
      type: 'expense',
      merchant_or_title: 'Chai Point Snacks',
      category_id: 1,
      subcategory_id: 103,
      payment_method: 'Cash',
      account_name: 'Cash Wallet',
      transaction_date: new Date(now.getTime() - 7 * 3600 * 1000).toISOString(),
      is_auto_categorized: true,
      auto_detected_reason: "Keyword 'Chai' matched Food and Groceries"
    },
    {
      id: 4,
      amount: 450,
      type: 'expense',
      merchant_or_title: 'Vegetable Market',
      category_id: 1,
      subcategory_id: 104,
      payment_method: 'Cash',
      account_name: 'Cash Wallet',
      transaction_date: new Date(now.getTime() - 2 * 24 * 3600 * 1000).toISOString(),
      is_auto_categorized: true
    },
    {
      id: 5,
      amount: 1800,
      type: 'expense',
      merchant_or_title: 'BESCOM Electricity Bill',
      category_id: 5,
      subcategory_id: 501,
      payment_method: 'Net Banking',
      account_name: 'HDFC Bank',
      transaction_date: new Date(now.getTime() - 3 * 24 * 3600 * 1000).toISOString(),
      is_auto_categorized: true
    },
    {
      id: 6,
      amount: 12000,
      type: 'expense',
      merchant_or_title: 'Monthly House Rent',
      category_id: 4,
      subcategory_id: 401,
      payment_method: 'Net Banking',
      account_name: 'HDFC Bank',
      transaction_date: new Date(now.getTime() - 10 * 24 * 3600 * 1000).toISOString(),
      is_auto_categorized: true
    },
    {
      id: 7,
      amount: 3470,
      type: 'expense',
      merchant_or_title: 'Amazon Electronics Order',
      category_id: 3,
      subcategory_id: 301,
      payment_method: 'Credit Card',
      account_name: 'HDFC Bank',
      transaction_date: new Date(now.getTime() - 12 * 24 * 3600 * 1000).toISOString(),
      is_auto_categorized: true
    }
  ];
}

interface StoredBudget {
  id: number;
  category_id?: number | null;
  amount: number;
}

const DEFAULT_BUDGETS: StoredBudget[] = [
  { id: 1, category_id: 2, amount: 3000 },
  { id: 2, category_id: 1, amount: 6000 },
  { id: 3, category_id: 3, amount: 5000 },
  { id: 4, category_id: 4, amount: 15000 },
  { id: 5, category_id: null, amount: 35000 }
];

const DEFAULT_KEYWORD_RULES: [RegExp, string, string, string][] = [
  [/\b(uber|ola|rapido|taxi|cab|auto|rickshaw|chauffeur)\b/i, 'Transportation', 'Cab / Taxi', 'Cab'],
  [/\b(namma\s*metro|metro|metro\s*card|dmrc|bmrc|smart\s*card\s*recharge)\b/i, 'Transportation', 'Metro', 'Metro'],
  [/\b(bmtc|ksrtc|bus|redbus|chalo|volvo\s*bus)\b/i, 'Transportation', 'Bus', 'Bus'],
  [/\b(petrol|diesel|fuel|cng|bunk|shell|hpcl|bpcl|ioc|gas\s*station)\b/i, 'Transportation', 'Fuel / Gas', 'Fuel'],
  [/\b(service|repair|fastag|toll|parking|puncture|wheel\s*alignment|car\s*wash)\b/i, 'Transportation', 'Vehicle Maintenance', 'Maintenance'],
  [/\b(train|flight|irctc|indigo|air\s*india|vistara|spicejet|railway)\b/i, 'Transportation', 'Train and Flight', 'Travel'],

  [/\b(swiggy|zomato|eats|foodpanda|box8|faasos)\b/i, 'Food and Groceries', 'Food Delivery', 'Food Delivery'],
  [/\b(restaurant|dining|hotel|cafe|bistro|diner|mcdonald|kfc|burger|pizza|domino|starbucks|subway|biryani|dosa|idli|barbeque)\b/i, 'Food and Groceries', 'Restaurants and Dining', 'Food'],
  [/\b(tea|coffee|snack|chai|cafe|canteen|bakery|pastry|cake|sweets|haldiram)\b/i, 'Food and Groceries', 'Tea, Coffee, and Snacks', 'Snacks'],
  [/\b(vegetable|vegetables|sabzi|tarkari)\b/i, 'Food and Groceries', 'Vegetables', 'Vegetables'],
  [/\b(fruit|fruits|apple|banana|mango|orange)\b/i, 'Food and Groceries', 'Fruits', 'Fruits'],
  [/\b(milk|dairy|nandini|amul|curd|paneer|cheese|butter)\b/i, 'Food and Groceries', 'Milk and Dairy Products', 'Milk & Dairy'],
  [/\b(grocery|groceries|supermarket|mart|bigbasket|zepto|blinkit|instamart|nature\s*basket|reliance\s*fresh|dmart)\b/i, 'Food and Groceries', 'Groceries and Supermarket', 'Groceries'],
  [/\b(meat|chicken|mutton|fish|prawn|egg|eggs|licious)\b/i, 'Food and Groceries', 'Meat, Fish, and Eggs', 'Meat & Fish'],

  [/\b(amazon|flipkart|myntra|ajio|meesho|nykaa|tata\s*cliq)\b/i, 'Shopping and Personal Expenses', 'Online Shopping', 'Shopping'],
  [/\b(clothing|clothes|shirt|pants|dress|footwear|shoes|zara|h&m|uniqlo|trends|westside)\b/i, 'Shopping and Personal Expenses', 'Clothing and Footwear', 'Clothing'],
  [/\b(electronics|gadget|mobile|laptop|croma|reliance\s*digital|apple|samsung|headphone)\b/i, 'Shopping and Personal Expenses', 'Electronics and Gadgets', 'Electronics'],
  [/\b(washing\s*machine|refrigerator|fridge|microwave|appliances|ac|air\s*conditioner|tv)\b/i, 'Shopping and Personal Expenses', 'Home Appliances', 'Home Appliances'],
  [/\b(salon|parlour|spa|haircut|cosmetics|perfume|grooming|skincare)\b/i, 'Shopping and Personal Expenses', 'Personal Care', 'Personal Care'],

  [/\b(rent|house\s*rent|landlord|maintenance\s*fee|society\s*charge)\b/i, 'Home and Living', 'House Rent', 'Rent'],
  [/\b(electricity|power|bescom|tneb|mseb|electric\s*bill)\b/i, 'Home and Living', 'Electricity Bill', 'Electricity'],
  [/\b(water\s*bill|bwssb|water\s*tanker)\b/i, 'Home and Living', 'Water Bill', 'Water'],
  [/\b(gas|cylinder|lpg|indane|bharat\s*gas|hp\s*gas|cooking\s*gas)\b/i, 'Home and Living', 'Gas Cylinder / Cooking Gas', 'Gas'],
  [/\b(wifi|internet|broadband|act\s*fibernet|airtel\s*xtream|jio\s*fiber)\b/i, 'Home and Living', 'Internet and Wi-Fi', 'Internet'],
  [/\b(mobile\s*recharge|recharge|prepaid|postpaid|airtel|jio|vi\s*recharge)\b/i, 'Home and Living', 'Mobile Recharge', 'Mobile'],
  [/\b(furniture|repair|plumber|electrician|urban\s*company|cleaning|maid|sweep)\b/i, 'Home and Living', 'Cleaning Supplies', 'Home Care'],

  [/\b(medicine|medicines|pharmacy|apollo|medplus|pharmeasy|1mg|tablet)\b/i, 'Health and Medical', 'Medicines and Pharmacy', 'Medicines'],
  [/\b(doctor|clinic|consultation|hospital|physician|dentist)\b/i, 'Health and Medical', 'Doctor Consultation', 'Doctor'],
  [/\b(gym|fitness|cult\.?fit|workout|protein|supplement)\b/i, 'Health and Medical', 'Diagnostic Tests', 'Fitness'],

  [/\b(movie|cinema|pvr|inox|cinepolis|bookmyshow)\b/i, 'Entertainment and Leisure', 'Movies', 'Movies'],
  [/\b(netflix|spotify|prime\s*video|hotstar|youtube\s*premium|disney\+|apple\s*music)\b/i, 'Entertainment and Leisure', 'OTT Subscriptions', 'Subscriptions'],
  [/\b(games|gaming|steam|playstation|xbox)\b/i, 'Entertainment and Leisure', 'Gaming', 'Games'],
  [/\b(hotel|resort|vacation|trip|flight|holiday|airbnb)\b/i, 'Entertainment and Leisure', 'Outings', 'Travel'],

  [/\b(emi|loan|repayment|interest)\b/i, 'Bills and Utilities', 'Loan EMI', 'EMI'],
  [/\b(insurance|lic|hdfc\s*ergo|premium)\b/i, 'Bills and Utilities', 'Insurance', 'Insurance'],
  [/\b(credit\s*card|card\s*bill)\b/i, 'Bills and Utilities', 'Credit Card Bill', 'Card Bill'],
  [/\b(donation|charity|temple|relief\s*fund)\b/i, 'Others', 'Donations', 'Donations']
];

// Helper to safely read and write JSON in LocalStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

// Format a raw transaction with Category metadata and display labels
function enrichTransaction(t: Transaction, categories: Category[]): Transaction {
  const cat = categories.find((c) => c.id === t.category_id);
  const sub = cat?.subcategories?.find((s) => s.id === t.subcategory_id);

  const catName = cat?.name || 'Uncategorized';
  const subName = sub?.name || undefined;
  const subtitle = subName ? `${subName} · ${catName}` : catName;

  const dateObj = new Date(t.transaction_date);
  const formatted_date = isNaN(dateObj.getTime())
    ? t.transaction_date
    : dateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

  const time_display = isNaN(dateObj.getTime())
    ? ''
    : dateObj.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

  return {
    ...t,
    category_name: catName,
    category_icon: cat?.icon || 'tag',
    category_color: cat?.color || '#64748B',
    category_bg_color: cat?.bg_color || '#F1F5F9',
    subcategory_name: subName,
    subtitle,
    formatted_date,
    time_display,
    display_category: `${catName} > ${subName || 'General'}`
  };
}

// ----------------- LOCAL STORE METHODS -----------------

export function getLocalUser(): User {
  const user = getFromStorage<User>(STORAGE_KEYS.USER, DEFAULT_USER);
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    setToStorage(STORAGE_KEYS.USER, DEFAULT_USER);
  }
  return user;
}

export function getLocalCategories(): Category[] {
  let cats = getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  if (!cats || cats.length === 0) {
    cats = DEFAULT_CATEGORIES;
    setToStorage(STORAGE_KEYS.CATEGORIES, cats);
  }
  return cats;
}

export function createLocalCategory(data: {
  name: string;
  icon?: string;
  color?: string;
  bg_color?: string;
  subcategories?: string[];
}): void {
  const cats = getLocalCategories();
  const newId = cats.length > 0 ? Math.max(...cats.map((c) => c.id)) + 1 : 1;
  const subs = (data.subcategories || []).map((name, idx) => ({
    id: newId * 100 + (idx + 1),
    name,
    icon: data.icon || 'tag'
  }));

  const newCat: Category = {
    id: newId,
    name: data.name,
    icon: data.icon || 'tag',
    color: data.color || '#10B981',
    bg_color: data.bg_color || '#E8F5E9',
    type: 'expense',
    is_custom: true,
    subcategories: subs
  };

  cats.push(newCat);
  setToStorage(STORAGE_KEYS.CATEGORIES, cats);
}

export function getLocalTransactions(filters?: {
  search?: string;
  category_id?: number;
  type?: string;
  payment_method?: string;
  sort_by?: string;
}): TransactionsResponse {
  let list = getFromStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    list = getInitialTransactions();
    setToStorage(STORAGE_KEYS.TRANSACTIONS, list);
  }

  const categories = getLocalCategories();

  let filtered = [...list];
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.merchant_or_title.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q))
    );
  }
  if (filters?.category_id) {
    filtered = filtered.filter((t) => t.category_id === filters.category_id);
  }
  if (filters?.type) {
    filtered = filtered.filter((t) => t.type === filters.type);
  }
  if (filters?.payment_method) {
    filtered = filtered.filter((t) => t.payment_method === filters.payment_method);
  }

  // Sort
  if (filters?.sort_by === 'amount_desc') {
    filtered.sort((a, b) => b.amount - a.amount);
  } else if (filters?.sort_by === 'amount_asc') {
    filtered.sort((a, b) => a.amount - b.amount);
  } else if (filters?.sort_by === 'date_asc') {
    filtered.sort(
      (a, b) =>
        new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
    );
  } else {
    // Default date_desc
    filtered.sort(
      (a, b) =>
        new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
    );
  }

  const enriched = filtered.map((t) => enrichTransaction(t, categories));

  const now = new Date();
  const todayStr = now.toDateString();
  const yest = new Date(now.getTime() - 24 * 3600 * 1000);
  const yestStr = yest.toDateString();

  const groupedMap: { [key: string]: { date_label: string; raw_date: string; total: number; transactions: Transaction[] } } = {};
  let grandTotal = 0;

  for (const item of enriched) {
    if (item.type === 'expense') {
      grandTotal += item.amount;
    }
    const d = new Date(item.transaction_date);
    const dateStr = isNaN(d.getTime()) ? 'Unknown' : d.toDateString();

    let dateLabel = '';
    if (dateStr === todayStr) {
      dateLabel = `Today · ${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    } else if (dateStr === yestStr) {
      dateLabel = `Yesterday · ${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    } else {
      dateLabel = isNaN(d.getTime())
        ? 'Other'
        : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    if (!groupedMap[dateLabel]) {
      groupedMap[dateLabel] = {
        date_label: dateLabel,
        raw_date: isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0],
        total: 0,
        transactions: []
      };
    }

    if (item.type === 'expense') {
      groupedMap[dateLabel].total += item.amount;
    }
    groupedMap[dateLabel].transactions.push(item);
  }

  return {
    total_count: enriched.length,
    grand_total: grandTotal,
    items: enriched,
    grouped_by_date: Object.values(groupedMap)
  };
}

export function getLocalTransaction(id: number): Transaction {
  const categories = getLocalCategories();
  const list = getFromStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  const tx = list.find((t) => t.id === id);
  if (!tx) throw new Error('Transaction not found');
  return enrichTransaction(tx, categories);
}

export function createLocalTransaction(data: {
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
}): { id: number; message: string; is_duplicate_warning: boolean } {
  let list = getFromStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    list = getInitialTransactions();
  }

  const newId = list.length > 0 ? Math.max(...list.map((t) => t.id)) + 1 : 1;
  const newTx: Transaction = {
    id: newId,
    amount: Number(data.amount),
    type: (data.type as any) || 'expense',
    merchant_or_title: data.merchant_or_title,
    category_id: data.category_id || undefined,
    subcategory_id: data.subcategory_id || undefined,
    payment_method: data.payment_method || 'UPI',
    account_name: data.account_name || 'UPI / Paytm',
    transaction_date: data.transaction_date || new Date().toISOString(),
    notes: data.notes || '',
    receipt_url: data.receipt_url || undefined,
    is_auto_categorized: data.is_auto_categorized || false,
    auto_detected_reason: data.auto_detected_reason || undefined
  };

  list.unshift(newTx);
  setToStorage(STORAGE_KEYS.TRANSACTIONS, list);

  return {
    id: newId,
    message: 'Transaction saved successfully in browser storage',
    is_duplicate_warning: false
  };
}

export function updateLocalTransaction(id: number, data: Partial<Transaction>): void {
  const list = getFromStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  const idx = list.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error('Transaction not found');

  list[idx] = {
    ...list[idx],
    ...data,
    amount: data.amount !== undefined ? Number(data.amount) : list[idx].amount
  };
  setToStorage(STORAGE_KEYS.TRANSACTIONS, list);
}

export function deleteLocalTransaction(id: number): void {
  const list = getFromStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  const filtered = list.filter((t) => t.id !== id);
  setToStorage(STORAGE_KEYS.TRANSACTIONS, filtered);
}

export function autoCategorizeLocal(text: string): AutoCategorizeResult {
  const clean = (text || '').trim();
  if (!clean) {
    return {
      detected: false,
      category_id: null,
      category_name: null,
      subcategory_id: null,
      subcategory_name: null,
      display_path: null,
      reason: null,
      confidence: 0.0
    };
  }

  const categories = getLocalCategories();
  const rules = getLocalRules();

  // 1. Check custom user rules
  for (const r of rules) {
    if (clean.toLowerCase().includes(r.keyword.toLowerCase())) {
      const cat = categories.find((c) => c.id === r.category_id);
      const sub = cat?.subcategories?.find((s) => s.id === r.subcategory_id);
      return {
        detected: true,
        category_id: cat ? cat.id : null,
        category_name: cat ? cat.name : null,
        subcategory_id: sub ? sub.id : null,
        subcategory_name: sub ? sub.name : null,
        display_path: `${cat?.name || ''} > ${sub ? sub.name : 'General'}`,
        reason: `Matched custom rule "${r.keyword}"`,
        confidence: 1.0
      };
    }
  }

  // 2. Check built-in regex rules
  for (const [pattern, catName, subName, label] of DEFAULT_KEYWORD_RULES) {
    if (pattern.test(clean)) {
      const cat = categories.find((c) => c.name.toLowerCase().includes(catName.toLowerCase()));
      const sub = cat?.subcategories?.find((s) =>
        s.name.toLowerCase().includes(subName.toLowerCase())
      );
      return {
        detected: true,
        category_id: cat ? cat.id : null,
        category_name: cat ? cat.name : catName,
        subcategory_id: sub ? sub.id : null,
        subcategory_name: sub ? sub.name : subName,
        display_path: `${cat?.name || catName} > ${sub?.name || subName}`,
        reason: `Keyword detected "${label}"`,
        confidence: 0.95
      };
    }
  }

  return {
    detected: false,
    category_id: null,
    category_name: null,
    subcategory_id: null,
    subcategory_name: null,
    display_path: null,
    reason: null,
    confidence: 0.0
  };
}

export function getLocalAnalyticsSummary(): AnalyticsSummary {
  const res = getLocalTransactions();
  const txs = res.items;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yestStart = new Date(todayStart.getTime() - 24 * 3600 * 1000);
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - ((todayStart.getDay() + 6) % 7)); // Monday start
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayTxs = txs.filter(
    (t) => t.type === 'expense' && new Date(t.transaction_date) >= todayStart
  );
  const todayTotal = todayTxs.reduce((sum, t) => sum + t.amount, 0);

  const yestTxs = txs.filter(
    (t) =>
      t.type === 'expense' &&
      new Date(t.transaction_date) >= yestStart &&
      new Date(t.transaction_date) < todayStart
  );
  const yestTotal = yestTxs.reduce((sum, t) => sum + t.amount, 0);

  const weekTxs = txs.filter(
    (t) => t.type === 'expense' && new Date(t.transaction_date) >= weekStart
  );
  const weekTotal = weekTxs.reduce((sum, t) => sum + t.amount, 0);

  const monthTxs = txs.filter(
    (t) => t.type === 'expense' && new Date(t.transaction_date) >= monthStart
  );
  const monthTotal = monthTxs.reduce((sum, t) => sum + t.amount, 0);

  const incomeTxs = txs.filter(
    (t) => t.type === 'income' && new Date(t.transaction_date) >= monthStart
  );
  const totalIncome = incomeTxs.reduce((sum, t) => sum + t.amount, 0);

  const budgets = getFromStorage<StoredBudget[]>(STORAGE_KEYS.BUDGETS, DEFAULT_BUDGETS);
  const overallBudget = budgets.find((b) => b.category_id === null)?.amount || 35000;

  const user = getLocalUser();
  const totalBalance = user.accounts.reduce((sum, a) => sum + a.balance, 0);

  const daysPassed = Math.max(1, now.getDate());
  const avgDaily = Math.round((monthTotal / daysPassed) * 100) / 100;

  const todayDiff =
    yestTotal > 0 ? Math.round(((todayTotal - yestTotal) / yestTotal) * 100 * 10) / 10 : 0;

  return {
    today: {
      total: todayTotal,
      count: todayTxs.length,
      diff_yesterday_pct: todayDiff
    },
    yesterday: {
      total: yestTotal
    },
    this_week: {
      total: weekTotal,
      diff_pct: 0
    },
    this_month: {
      total: monthTotal,
      diff_pct: 0
    },
    budget: {
      limit: overallBudget,
      remaining: Math.max(0, overallBudget - monthTotal),
      used_pct: overallBudget > 0 ? Math.round((monthTotal / overallBudget) * 100 * 10) / 10 : 0
    },
    savings: {
      total_income: totalIncome,
      total_expense: monthTotal,
      net_savings: totalIncome - monthTotal,
      savings_rate: totalIncome > 0 ? Math.round(((totalIncome - monthTotal) / totalIncome) * 100 * 10) / 10 : 0
    },
    total_balance: totalBalance,
    avg_daily_spending: avgDaily
  };
}

export function getLocalReports(_period: string = 'month'): ReportsData {
  const res = getLocalTransactions();
  const txs = res.items;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthTxs = txs.filter(
    (t) => t.type === 'expense' && new Date(t.transaction_date) >= monthStart
  );
  const totalExp = monthTxs.reduce((sum, t) => sum + t.amount, 0);

  const catMap: { [name: string]: { name: string; amount: number; color: string } } = {};
  for (const t of monthTxs) {
    const cname = t.category_name || 'Others';
    if (!catMap[cname]) {
      catMap[cname] = { name: cname, amount: 0, color: t.category_color || '#64748B' };
    }
    catMap[cname].amount += t.amount;
  }

  const category_spending = Object.values(catMap).map((item) => ({
    name: item.name,
    amount: item.amount,
    percentage: totalExp > 0 ? Math.round((item.amount / totalExp) * 100) : 0,
    color: item.color
  }));
  category_spending.sort((a, b) => b.amount - a.amount);

  // Daily trend last 7 days
  const daily_trend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dEnd = new Date(dStart.getTime() + 24 * 3600 * 1000);

    const daySum = txs
      .filter(
        (t) =>
          t.type === 'expense' &&
          new Date(t.transaction_date) >= dStart &&
          new Date(t.transaction_date) < dEnd
      )
      .reduce((sum, t) => sum + t.amount, 0);

    daily_trend.push({
      date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      amount: daySum
    });
  }

  // Payment methods
  const payMap: { [method: string]: number } = {};
  for (const t of monthTxs) {
    const pm = t.payment_method || 'UPI';
    payMap[pm] = (payMap[pm] || 0) + t.amount;
  }

  const payment_methods = Object.entries(payMap).map(([method, amount]) => ({
    method,
    amount
  }));

  const insight =
    totalExp > 0 && category_spending.length > 0
      ? `Top spending category this month: ${category_spending[0].name} (${category_spending[0].percentage}% of total spending).`
      : 'Add transactions to see visual analytics and spending trends.';

  return {
    total_expenses: totalExp,
    category_spending,
    daily_trend,
    payment_methods,
    insight
  };
}

export function getLocalCalendar(year?: number, month?: number): CalendarData {
  const now = new Date();
  const y = year || now.getFullYear();
  const m = month || now.getMonth() + 1; // 1-12

  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);

  const res = getLocalTransactions();
  const txs = res.items.filter(
    (t) =>
      t.type === 'expense' &&
      new Date(t.transaction_date) >= start &&
      new Date(t.transaction_date) < end
  );

  const dailyMap: { [day: number]: number } = {};
  for (const t of txs) {
    const day = new Date(t.transaction_date).getDate();
    dailyMap[day] = (dailyMap[day] || 0) + t.amount;
  }

  const daysData: { [day: number]: { day: number; amount: number; level: 'low' | 'medium' | 'high' } } = {};
  for (const [dayStr, amt] of Object.entries(dailyMap)) {
    const day = Number(dayStr);
    let level: 'low' | 'medium' | 'high' = 'low';
    if (amt >= 1500) level = 'high';
    else if (amt >= 500) level = 'medium';

    daysData[day] = { day, amount: amt, level };
  }

  return {
    year: y,
    month: m,
    days: daysData
  };
}

export function getLocalBudgets(): BudgetCategory[] {
  let stored = getFromStorage<StoredBudget[]>(STORAGE_KEYS.BUDGETS, []);
  if (!stored || stored.length === 0) {
    stored = DEFAULT_BUDGETS;
    setToStorage(STORAGE_KEYS.BUDGETS, stored);
  }

  const categories = getLocalCategories();
  const res = getLocalTransactions();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthTxs = res.items.filter(
    (t) => t.type === 'expense' && new Date(t.transaction_date) >= monthStart
  );

  return stored.map((b) => {
    let spent = 0;
    let name = 'Overall Monthly Budget';
    let icon = 'piggy-bank';
    let color = '#10B981';

    if (b.category_id) {
      const cat = categories.find((c) => c.id === b.category_id);
      spent = monthTxs
        .filter((t) => t.category_id === b.category_id)
        .reduce((sum, t) => sum + t.amount, 0);
      name = cat?.name || 'Category';
      icon = cat?.icon || 'wallet';
      color = cat?.color || '#10B981';
    } else {
      spent = monthTxs.reduce((sum, t) => sum + t.amount, 0);
    }

    const pct = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;

    return {
      id: b.id,
      category_id: b.category_id || null,
      name,
      icon,
      color,
      budget_amount: b.amount,
      spent_amount: spent,
      remaining: Math.max(0, b.amount - spent),
      percentage: pct,
      is_over_budget: spent > b.amount
    };
  });
}

export function setLocalBudget(data: { category_id?: number | null; amount: number }): void {
  let stored = getFromStorage<StoredBudget[]>(STORAGE_KEYS.BUDGETS, DEFAULT_BUDGETS);
  const targetCatId = data.category_id === undefined ? null : data.category_id;
  const idx = stored.findIndex((b) => b.category_id === targetCatId);

  if (idx !== -1) {
    stored[idx].amount = data.amount;
  } else {
    const newId = stored.length > 0 ? Math.max(...stored.map((b) => b.id)) + 1 : 1;
    stored.push({
      id: newId,
      category_id: targetCatId,
      amount: data.amount
    });
  }
  setToStorage(STORAGE_KEYS.BUDGETS, stored);
}

export function getLocalRules(): CategoryRuleItem[] {
  return getFromStorage<CategoryRuleItem[]>(STORAGE_KEYS.RULES, []);
}

export function addLocalRule(data: {
  keyword: string;
  category_id: number;
  subcategory_id?: number | null;
}): void {
  const rules = getLocalRules();
  const categories = getLocalCategories();
  const cat = categories.find((c) => c.id === data.category_id);
  const sub = cat?.subcategories?.find((s) => s.id === data.subcategory_id);

  const newId = rules.length > 0 ? Math.max(...rules.map((r) => r.id)) + 1 : 1;
  rules.push({
    id: newId,
    keyword: data.keyword,
    category_id: data.category_id,
    category_name: cat?.name || '',
    subcategory_id: data.subcategory_id ?? null,
    subcategory_name: sub?.name || 'General'
  });
  setToStorage(STORAGE_KEYS.RULES, rules);
}

// Client-side CSV export
export function exportLocalCsv(): void {
  const res = getLocalTransactions();
  const header = ['ID', 'Date', 'Type', 'Merchant / Description', 'Category', 'Subcategory', 'Payment Method', 'Account', 'Amount', 'Notes'];
  const rows = res.items.map((t) => [
    t.id,
    `"${t.formatted_date || t.transaction_date}"`,
    `"${t.type}"`,
    `"${t.merchant_or_title.replace(/"/g, '""')}"`,
    `"${(t.category_name || '').replace(/"/g, '""')}"`,
    `"${(t.subcategory_name || '').replace(/"/g, '""')}"`,
    `"${t.payment_method}"`,
    `"${t.account_name}"`,
    t.amount,
    `"${(t.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `expense_transactions_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
