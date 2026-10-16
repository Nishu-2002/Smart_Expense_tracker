import React, { useState, useEffect } from 'react';
import {
  User,
  Category,
  Transaction,
  TransactionGroup,
  AnalyticsSummary,
  ReportsData,
  CalendarData,
  BudgetCategory,
  ActiveTab
} from './types';
import {
  fetchCurrentUser,
  fetchCategories,
  fetchTransactions,
  fetchAnalyticsSummary,
  fetchReports,
  fetchCalendar,
  fetchBudgets
} from './services/api';

import { DashboardView } from './components/DashboardView';
import { AddExpenseView } from './components/AddExpenseView';
import { CategoriesView } from './components/CategoriesView';
import { TransactionsView } from './components/TransactionsView';
import { ReportsView } from './components/ReportsView';
import { BudgetsView } from './components/BudgetsView';
import { CalendarView } from './components/CalendarView';
import { ExpenseDetailsModal } from './components/ExpenseDetailsModal';
import { BottomNavBar } from './components/BottomNavBar';
import { MoreMenuModal } from './components/MoreMenuModal';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groupedTransactions, setGroupedTransactions] = useState<TransactionGroup[]>([]);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);

  // Navigation & View States
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const mainRef = React.useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollLeft = 0;
      mainRef.current.scrollTop = 0;
    }
  }, [activeTab, selectedTransaction]);

  const handleMainScroll = () => {
    if (mainRef.current && mainRef.current.scrollLeft !== 0) {
      mainRef.current.scrollLeft = 0;
    }
  };

  // Search & Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  // Prefill state for Quick Add
  const [prefilledMerchant, setPrefilledMerchant] = useState('');

  // Theme & Layout toggles
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('smart_expense_theme') === 'dark';
  });
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);

  // Sync theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('smart_expense_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('smart_expense_theme', 'light');
    }
  }, [isDarkMode]);

  // Load backend data
  const loadData = async () => {
    try {
      const [u, cats, txRes, sum, reps, cal, buds] = await Promise.all([
        fetchCurrentUser().catch(() => null),
        fetchCategories().catch(() => []),
        fetchTransactions({
          search: searchTerm,
          category_id: selectedCategoryId || undefined,
          payment_method: selectedPaymentMethod || undefined
        }).catch(() => ({ total_count: 0, grand_total: 0, items: [], grouped_by_date: [] })),
        fetchAnalyticsSummary().catch(() => null),
        fetchReports('month').catch(() => null),
        fetchCalendar().catch(() => null),
        fetchBudgets().catch(() => [])
      ]);

      if (u) setUser(u);
      setCategories(cats);
      setTransactions(txRes.items);
      setGroupedTransactions(txRes.grouped_by_date);
      setGrandTotal(txRes.grand_total);
      setTotalCount(txRes.total_count);
      if (sum) setSummary(sum);
      if (reps) setReportsData(reps);
      if (cal) setCalendarData(cal);
      setBudgets(buds);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, selectedCategoryId, selectedPaymentMethod]);

  const handleOpenAddExpense = (merchantQuery: string = '', categoryHint: string = '') => {
    setPrefilledMerchant(merchantQuery);
    setSelectedTransaction(null);
    setActiveTab('add');
  };

  const handleSelectTransaction = (tx: Transaction) => {
    setSelectedTransaction(tx);
  };

  return (
    <div className="app-container">
      {/* Botanical Leaf Silhouette Decorative Watermarks */}
      <div className="botanical-bg-left" aria-hidden="true">
        <svg viewBox="0 0 160 160" fill="none">
          <path d="M140 10C95 40 60 30 20 90C60 95 100 70 140 10Z" fill="#1E3E32" />
          <path d="M120 40C85 65 55 55 25 105C55 110 90 90 120 40Z" fill="#10B981" />
          <path d="M150 25C115 50 85 45 45 95C75 100 110 80 150 25Z" fill="#2E7D32" />
        </svg>
      </div>
      <div className="botanical-bg-right" aria-hidden="true">
        <svg viewBox="0 0 160 160" fill="none">
          <path d="M20 10C65 40 100 30 140 90C100 95 60 70 20 10Z" fill="#1E3E32" />
          <path d="M40 40C75 65 105 55 135 105C105 110 70 90 40 40Z" fill="#10B981" />
        </svg>
      </div>

      {/* Top Banner Navigation Bar for Desktop / Frame switching */}
      <div className="global-top-bar">
        <div className="brand-group">
          <div className="brand-badge">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#10B981">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2zm0-10h2v8h-2z" />
            </svg>
          </div>
          <span className="brand-title">Smart Expense Tracker</span>
        </div>

        {/* Screen Quick Tabs for fast preview */}
        <div className="quick-screen-nav">
          <button
            className={`nav-chip ${activeTab === 'home' && !selectedTransaction ? 'active' : ''}`}
            onClick={() => { setSelectedTransaction(null); setActiveTab('home'); }}
          >
            Dashboard
          </button>
          <button
            className={`nav-chip ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => { setSelectedTransaction(null); setActiveTab('add'); }}
          >
            Add Expense
          </button>
          <button
            className={`nav-chip ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => { setSelectedTransaction(null); setActiveTab('categories'); }}
          >
            Categories
          </button>
          <button
            className={`nav-chip ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => { setSelectedTransaction(null); setActiveTab('transactions'); }}
          >
            Transactions
          </button>
          <button
            className={`nav-chip ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => { setSelectedTransaction(null); setActiveTab('reports'); }}
          >
            Reports
          </button>
          <button
            className={`nav-chip ${activeTab === 'budgets' ? 'active' : ''}`}
            onClick={() => { setSelectedTransaction(null); setActiveTab('budgets'); }}
          >
            Budgets
          </button>
          <button
            className={`nav-chip ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => { setSelectedTransaction(null); setActiveTab('calendar'); }}
          >
            Calendar
          </button>
        </div>

        <div className="top-bar-actions">
          <button
            className="toggle-btn"
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Toggle Theme"
          >
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button
            className="toggle-btn"
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            title="Toggle View Mode"
          >
            {isMobileFrame ? '📱 Mobile Frame' : '💻 Fluid View'}
          </button>
        </div>
      </div>

      {/* Main Container: supports both Mobile Frame mode & Fluid responsive mode */}
      <main
        ref={mainRef}
        onScroll={handleMainScroll}
        className={`mobile-frame-wrapper ${isMobileFrame ? 'frame-mode' : 'fluid-mode'}`}
      >
        <div className="mobile-content-area">
          {/* Render Active View or Transaction Detail View */}
          {selectedTransaction ? (
          <ExpenseDetailsModal
            transaction={selectedTransaction}
            categories={categories}
            onBack={() => setSelectedTransaction(null)}
            onRefresh={loadData}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <DashboardView
                user={user}
                summary={summary}
                recentTransactions={transactions}
                onOpenAddExpense={handleOpenAddExpense}
                onSelectTransaction={handleSelectTransaction}
                onViewAllTransactions={() => setActiveTab('transactions')}
                onOpenMenu={() => setIsMoreMenuOpen(true)}
              />
            )}

            {activeTab === 'add' && (
              <AddExpenseView
                categories={categories}
                initialMerchant={prefilledMerchant}
                onBack={() => {
                  setPrefilledMerchant('');
                  setActiveTab('home');
                }}
                onSuccess={() => {
                  setPrefilledMerchant('');
                  setActiveTab('home');
                  loadData();
                }}
              />
            )}

            {activeTab === 'categories' && (
              <CategoriesView
                categories={categories}
                onBack={() => setActiveTab('home')}
                onRefresh={loadData}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionsView
                categories={categories}
                groupedTransactions={groupedTransactions}
                grandTotal={grandTotal}
                totalCount={totalCount}
                searchTerm={searchTerm}
                selectedCategoryId={selectedCategoryId}
                selectedPaymentMethod={selectedPaymentMethod}
                onSearchChange={setSearchTerm}
                onCategoryFilter={setSelectedCategoryId}
                onPaymentFilter={setSelectedPaymentMethod}
                onSelectTransaction={handleSelectTransaction}
                onBack={() => setActiveTab('home')}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                data={reportsData}
                onBack={() => setActiveTab('home')}
              />
            )}

            {activeTab === 'budgets' && (
              <BudgetsView
                budgets={budgets}
                categories={categories}
                onBack={() => setActiveTab('home')}
                onRefresh={loadData}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView
                calendarData={calendarData}
                allTransactions={transactions}
                onBack={() => setActiveTab('home')}
                onSelectTransaction={handleSelectTransaction}
              />
            )}
          </>
        )}
        </div>

        {/* Bottom Navigation Bar */}
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'add') {
              setPrefilledMerchant('');
            }
            setSelectedTransaction(null);
            setActiveTab(tab);
          }}
          onOpenMore={() => setIsMoreMenuOpen(true)}
        />
      </main>

      {/* More Options Drawer Modal */}
      <MoreMenuModal
        isOpen={isMoreMenuOpen}
        user={user}
        activeTab={activeTab}
        isDarkMode={isDarkMode}
        isMobileFrame={isMobileFrame}
        onClose={() => setIsMoreMenuOpen(false)}
        onSelectTab={(tab) => {
          setSelectedTransaction(null);
          setActiveTab(tab);
        }}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
      />

      <style>{`
        .global-top-bar {
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border-color);
          padding: 8px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 40;
          backdrop-filter: blur(8px);
        }

        .brand-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-badge {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          background: #E8F5E9;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-title {
          font-size: 14px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .quick-screen-nav {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow-x: auto;
          padding: 2px 8px;
        }

        .nav-chip {
          padding: 5px 12px;
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--bg-subtle);
          white-space: nowrap;
          transition: var(--transition);
        }

        .nav-chip:hover {
          color: var(--text-primary);
        }

        .nav-chip.active {
          background: var(--accent-forest);
          color: #FFFFFF;
        }

        .top-bar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .toggle-btn {
          font-size: 11.5px;
          font-weight: 600;
          padding: 5px 10px;
          background: var(--bg-subtle);
          border-radius: var(--radius-md);
          color: var(--text-primary);
        }

        @media (max-width: 900px) {
          .quick-screen-nav {
            display: none;
          }
        }

        .fluid-mode {
          max-width: 900px !important;
          border-radius: 0;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
};

export default App;
