import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Calendar,
  CreditCard,
  ChevronDown,
  FileSpreadsheet,
  Plus,
  X,
  Sparkles,
  FileText,
  Smartphone,
  Wallet,
  Landmark,
  RotateCcw,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Receipt,
  Tag,
  ArrowUpDown,
  Check
} from 'lucide-react';
import { Category, Transaction, TransactionGroup } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { triggerExportCsv, triggerExportExcel } from '../services/api';

interface TransactionsViewProps {
  categories: Category[];
  groupedTransactions: TransactionGroup[];
  grandTotal: number;
  totalCount: number;
  searchTerm: string;
  selectedCategoryId: number | null;
  selectedPaymentMethod: string;
  selectedType?: string;
  sortBy?: string;
  onSearchChange: (val: string) => void;
  onCategoryFilter: (id: number | null) => void;
  onPaymentFilter: (val: string) => void;
  onTypeFilter?: (type: string) => void;
  onSortChange?: (sort: string) => void;
  onSelectTransaction: (tx: Transaction) => void;
  onNavigateToAdd?: () => void;
  onBack: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  categories,
  groupedTransactions,
  grandTotal,
  totalCount,
  searchTerm,
  selectedCategoryId,
  selectedPaymentMethod,
  selectedType = 'all',
  sortBy = 'date_desc',
  onSearchChange,
  onCategoryFilter,
  onPaymentFilter,
  onTypeFilter,
  onSortChange,
  onSelectTransaction,
  onNavigateToAdd,
  onBack
}) => {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showPaymentMenu, setShowPaymentMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  const formatRupee = (val?: number) => {
    if (val === undefined || isNaN(val)) return '₹ 0';
    return `₹ ${Math.round(val).toLocaleString('en-IN')}`;
  };

  const handleExportCsv = () => {
    triggerExportCsv();
    showToast('Exported CSV file');
  };

  const handleExportExcel = () => {
    triggerExportExcel();
    showToast('Exported Excel file');
  };

  // Flatten all transactions currently in grouped view to calculate stats
  const allCurrentTxs = useMemo(() => {
    const list: Transaction[] = [];
    groupedTransactions.forEach((g) => {
      list.push(...g.transactions);
    });
    return list;
  }, [groupedTransactions]);

  const totalExpense = useMemo(() => {
    return allCurrentTxs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [allCurrentTxs]);

  const totalIncome = useMemo(() => {
    return allCurrentTxs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [allCurrentTxs]);

  const netBalance = totalIncome - totalExpense;

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    selectedCategoryId !== null ||
    selectedPaymentMethod ||
    (selectedType && selectedType !== 'all') ||
    sortBy !== 'date_desc'
  );

  const handleResetFilters = () => {
    onSearchChange('');
    onCategoryFilter(null);
    onPaymentFilter('');
    if (onTypeFilter) onTypeFilter('all');
    if (onSortChange) onSortChange('date_desc');
    setShowCategoryMenu(false);
    setShowPaymentMenu(false);
    setShowSortMenu(false);
  };

  const getPaymentIcon = (method?: string) => {
    const m = (method || '').toLowerCase();
    if (m.includes('upi') || m.includes('paytm') || m.includes('phonepe') || m.includes('gpay')) {
      return <Smartphone size={11} />;
    }
    if (m.includes('cash')) {
      return <Wallet size={11} />;
    }
    if (m.includes('net banking') || m.includes('bank')) {
      return <Landmark size={11} />;
    }
    return <CreditCard size={11} />;
  };

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="transactions-container animate-fade">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="tx-toast animate-scale">
          <Check size={14} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="tx-page-header">
        <div className="header-left">
          <button
            id="transactions-back-btn"
            className="icon-btn-back"
            onClick={onBack}
            aria-label="Go Back"
          >
            <ArrowLeft size={19} color="var(--text-primary)" />
          </button>
          <div className="header-titles">
            <h2 className="header-title">Transactions</h2>
            <span className="header-count-pill">{allCurrentTxs.length} items</span>
          </div>
        </div>

        <div className="header-actions">
          {onNavigateToAdd && (
            <button
              id="tx-add-btn"
              className="btn-add-quick"
              onClick={onNavigateToAdd}
              title="Add New Expense"
            >
              <Plus size={15} />
              <span>Add</span>
            </button>
          )}

          <div className="export-btn-group">
            <button
              id="export-csv-btn"
              className="icon-action-btn"
              onClick={handleExportCsv}
              title="Export CSV"
            >
              <Download size={16} />
            </button>
            <button
              id="export-excel-btn"
              className="icon-action-btn"
              onClick={handleExportExcel}
              title="Export Excel"
            >
              <FileSpreadsheet size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Financial Summary Card */}
      <div className="financial-glance-card">
        <div className="glance-item expense-glance">
          <div className="glance-icon-wrap expense-tint">
            <TrendingDown size={14} />
          </div>
          <div className="glance-meta">
            <span className="glance-label">Total Spent</span>
            <span className="glance-amount expense-text">{formatRupee(totalExpense)}</span>
          </div>
        </div>

        <div className="glance-divider" />

        <div className="glance-item income-glance">
          <div className="glance-icon-wrap income-tint">
            <TrendingUp size={14} />
          </div>
          <div className="glance-meta">
            <span className="glance-label">Total Income</span>
            <span className="glance-amount income-text">{formatRupee(totalIncome)}</span>
          </div>
        </div>

        <div className="glance-divider" />

        <div className="glance-item net-glance">
          <div className="glance-icon-wrap neutral-tint">
            <Tag size={13} />
          </div>
          <div className="glance-meta">
            <span className="glance-label">Net Balance</span>
            <span className={`glance-amount ${netBalance >= 0 ? 'income-text' : 'expense-text'}`}>
              {netBalance >= 0 ? `+ ${formatRupee(netBalance)}` : `- ${formatRupee(Math.abs(netBalance))}`}
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Type Bar (All / Expense / Income) */}
      <div className="segmented-type-control">
        <button
          className={`type-tab-btn ${selectedType === 'all' ? 'active' : ''}`}
          onClick={() => onTypeFilter && onTypeFilter('all')}
        >
          <span>All</span>
          <span className="tab-badge">{allCurrentTxs.length}</span>
        </button>

        <button
          className={`type-tab-btn ${selectedType === 'expense' ? 'active' : ''}`}
          onClick={() => onTypeFilter && onTypeFilter('expense')}
        >
          <span className="tab-indicator expense-indicator" />
          <span>Expenses</span>
        </button>

        <button
          className={`type-tab-btn ${selectedType === 'income' ? 'active' : ''}`}
          onClick={() => onTypeFilter && onTypeFilter('income')}
        >
          <span className="tab-indicator income-indicator" />
          <span>Income</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="tx-search-container">
        <Search size={16} className="tx-search-icon" />
        <input
          id="transactions-search-input"
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search merchant, notes, account..."
          className="tx-search-field"
        />
        {searchTerm && (
          <button
            className="search-clear-btn"
            onClick={() => onSearchChange('')}
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Secondary Filter Chips & Sorting Row */}
      <div className="filter-chips-scroller">
        {/* Category Filter */}
        <div className="filter-dropdown-wrapper">
          <button
            id="filter-category-btn"
            className={`filter-pill-btn ${selectedCategoryId ? 'pill-active' : ''}`}
            onClick={() => {
              setShowCategoryMenu(!showCategoryMenu);
              setShowPaymentMenu(false);
              setShowSortMenu(false);
            }}
          >
            {selectedCategoryObj ? (
              <span
                className="category-pill-dot"
                style={{ backgroundColor: selectedCategoryObj.color }}
              />
            ) : (
              <Tag size={12} />
            )}
            <span className="pill-text">
              {selectedCategoryObj ? selectedCategoryObj.name : 'Category'}
            </span>
            {selectedCategoryObj ? (
              <span
                className="pill-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  onCategoryFilter(null);
                }}
              >
                <X size={12} />
              </span>
            ) : (
              <ChevronDown size={13} />
            )}
          </button>

          {showCategoryMenu && (
            <div className="custom-dropdown-panel animate-scale">
              <div className="dropdown-panel-header">
                <span>Filter by Category</span>
                <button
                  className="dropdown-close-btn"
                  onClick={() => setShowCategoryMenu(false)}
                >
                  <X size={13} />
                </button>
              </div>
              <div className="dropdown-panel-body">
                <button
                  className={`panel-item ${selectedCategoryId === null ? 'selected' : ''}`}
                  onClick={() => {
                    onCategoryFilter(null);
                    setShowCategoryMenu(false);
                  }}
                >
                  <span className="item-dot all-dot" />
                  <span>All Categories</span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    className={`panel-item ${selectedCategoryId === c.id ? 'selected' : ''}`}
                    onClick={() => {
                      onCategoryFilter(c.id);
                      setShowCategoryMenu(false);
                    }}
                  >
                    <span
                      className="item-dot"
                      style={{ backgroundColor: c.color || '#10B981' }}
                    />
                    <span className="item-name">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Payment Method Filter */}
        <div className="filter-dropdown-wrapper">
          <button
            id="filter-payment-btn"
            className={`filter-pill-btn ${selectedPaymentMethod ? 'pill-active' : ''}`}
            onClick={() => {
              setShowPaymentMenu(!showPaymentMenu);
              setShowCategoryMenu(false);
              setShowSortMenu(false);
            }}
          >
            <CreditCard size={12} />
            <span className="pill-text">
              {selectedPaymentMethod ? selectedPaymentMethod : 'Payment'}
            </span>
            {selectedPaymentMethod ? (
              <span
                className="pill-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  onPaymentFilter('');
                }}
              >
                <X size={12} />
              </span>
            ) : (
              <ChevronDown size={13} />
            )}
          </button>

          {showPaymentMenu && (
            <div className="custom-dropdown-panel animate-scale">
              <div className="dropdown-panel-header">
                <span>Payment Method</span>
                <button
                  className="dropdown-close-btn"
                  onClick={() => setShowPaymentMenu(false)}
                >
                  <X size={13} />
                </button>
              </div>
              <div className="dropdown-panel-body">
                <button
                  className={`panel-item ${!selectedPaymentMethod ? 'selected' : ''}`}
                  onClick={() => {
                    onPaymentFilter('');
                    setShowPaymentMenu(false);
                  }}
                >
                  <span>All Methods</span>
                </button>
                {['UPI', 'Cash', 'Credit Card', 'Debit Card', 'Net Banking'].map((p) => (
                  <button
                    key={p}
                    className={`panel-item ${selectedPaymentMethod === p ? 'selected' : ''}`}
                    onClick={() => {
                      onPaymentFilter(p);
                      setShowPaymentMenu(false);
                    }}
                  >
                    <span className="panel-item-icon">{getPaymentIcon(p)}</span>
                    <span className="item-name">{p}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sort By Filter */}
        <div className="filter-dropdown-wrapper">
          <button
            id="filter-sort-btn"
            className={`filter-pill-btn ${sortBy !== 'date_desc' ? 'pill-active' : ''}`}
            onClick={() => {
              setShowSortMenu(!showSortMenu);
              setShowCategoryMenu(false);
              setShowPaymentMenu(false);
            }}
          >
            <ArrowUpDown size={12} />
            <span className="pill-text">
              {sortBy === 'amount_desc'
                ? 'Highest Amount'
                : sortBy === 'amount_asc'
                ? 'Lowest Amount'
                : sortBy === 'date_asc'
                ? 'Oldest First'
                : 'Newest First'}
            </span>
            <ChevronDown size={13} />
          </button>

          {showSortMenu && (
            <div className="custom-dropdown-panel animate-scale">
              <div className="dropdown-panel-header">
                <span>Sort Transactions</span>
                <button
                  className="dropdown-close-btn"
                  onClick={() => setShowSortMenu(false)}
                >
                  <X size={13} />
                </button>
              </div>
              <div className="dropdown-panel-body">
                {[
                  { id: 'date_desc', label: 'Newest First' },
                  { id: 'date_asc', label: 'Oldest First' },
                  { id: 'amount_desc', label: 'Highest Amount' },
                  { id: 'amount_asc', label: 'Lowest Amount' }
                ].map((s) => (
                  <button
                    key={s.id}
                    className={`panel-item ${sortBy === s.id ? 'selected' : ''}`}
                    onClick={() => {
                      if (onSortChange) onSortChange(s.id);
                      setShowSortMenu(false);
                    }}
                  >
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reset All Filters Pill */}
        {hasActiveFilters && (
          <button className="reset-filters-btn" onClick={handleResetFilters}>
            <RotateCcw size={12} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Grouped Transactions List */}
      <div className="tx-list-area">
        {groupedTransactions.length === 0 ? (
          <div className="tx-empty-state animate-fade">
            <div className="empty-state-icon">
              <Receipt size={36} color="var(--accent-forest)" />
            </div>
            <h4 className="empty-state-title">No transactions found</h4>
            <p className="empty-state-text">
              {hasActiveFilters
                ? 'No transactions matched your current filters. Try resetting search or filter criteria.'
                : 'You have not added any transactions yet. Tap the button below to get started!'}
            </p>
            <div className="empty-state-actions">
              {hasActiveFilters ? (
                <button className="btn-empty-reset" onClick={handleResetFilters}>
                  <RotateCcw size={14} />
                  <span>Reset Filters</span>
                </button>
              ) : null}
              {onNavigateToAdd && (
                <button className="btn-empty-add" onClick={onNavigateToAdd}>
                  <Plus size={15} />
                  <span>Add First Expense</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          groupedTransactions.map((group, gIdx) => (
            <div key={gIdx} className="date-group-section">
              {/* Date Group Header */}
              <div className="date-group-header-row">
                <div className="date-header-left">
                  <Calendar size={13} className="date-calendar-icon" />
                  <span className="date-group-label">{group.date_label}</span>
                </div>
                <div className="date-header-right">
                  <span className="date-group-sum-pill">{formatRupee(group.total)}</span>
                </div>
              </div>

              {/* Transactions in Group */}
              <div className="date-group-items-stack">
                {group.transactions.map((tx) => {
                  const isExpense = tx.type === 'expense';
                  return (
                    <div
                      key={tx.id}
                      id={`tx-item-${tx.id}`}
                      className="tx-card-row"
                      onClick={() => onSelectTransaction(tx)}
                      role="button"
                      tabIndex={0}
                    >
                      {/* Left: Category Icon */}
                      <div
                        className="tx-category-badge"
                        style={{
                          backgroundColor: tx.category_bg_color || '#E8F5E9',
                          color: tx.category_color || '#10B981'
                        }}
                      >
                        <CategoryIcon name={tx.category_icon || tx.category_name} size={19} />
                      </div>

                      {/* Center: Details */}
                      <div className="tx-info-content">
                        <div className="tx-title-row">
                          <h4 className="tx-merchant-name">{tx.merchant_or_title}</h4>
                        </div>

                        <div className="tx-meta-subrow">
                          <span className="tx-category-path">
                            {tx.subtitle || tx.category_name || 'General Expense'}
                          </span>
                        </div>

                        {/* Badges: Payment, AI, Notes */}
                        <div className="tx-tags-row">
                          {tx.payment_method && (
                            <span className="tx-tag-badge payment-tag">
                              {getPaymentIcon(tx.payment_method)}
                              <span>{tx.payment_method}</span>
                            </span>
                          )}

                          {tx.account_name && (
                            <span className="tx-tag-badge account-tag">
                              <span>{tx.account_name}</span>
                            </span>
                          )}

                          {tx.is_auto_categorized && (
                            <span className="tx-tag-badge ai-tag" title="Auto-categorized by AI">
                              <Sparkles size={10} color="#7c3aed" />
                              <span>AI</span>
                            </span>
                          )}

                          {tx.notes && (
                            <span className="tx-tag-badge note-tag" title={tx.notes}>
                              <FileText size={10} />
                              <span>Note</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Amount & Time */}
                      <div className="tx-numeric-side">
                        <span className={`tx-amount-value ${isExpense ? 'amount-expense' : 'amount-income'}`}>
                          {isExpense ? `- ${formatRupee(tx.amount)}` : `+ ${formatRupee(tx.amount)}`}
                        </span>
                        <div className="tx-time-row">
                          <span className="tx-timestamp">{tx.time_display || 'Recent'}</span>
                          <ChevronRight size={14} className="tx-chevron" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .transactions-container {
          padding: 16px 18px 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .tx-toast {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-surface);
          border: 1px solid var(--accent-forest);
          color: var(--text-primary);
          padding: 8px 16px;
          border-radius: var(--radius-full);
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: var(--shadow-elevated);
          z-index: 120;
        }

        /* Top Header */
        .tx-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .icon-btn-back {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-full);
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
        }

        .icon-btn-back:hover {
          background: var(--bg-subtle);
          border-color: var(--accent-forest);
        }

        .header-titles {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-title {
          font-size: 19px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.3px;
          margin: 0;
        }

        .header-count-pill {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--bg-subtle);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-add-quick {
          display: flex;
          align-items: center;
          gap: 5px;
          background: var(--accent-forest);
          color: #ffffff;
          border: none;
          border-radius: var(--radius-full);
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition);
          box-shadow: 0 2px 8px rgba(30, 62, 50, 0.25);
        }

        .btn-add-quick:hover {
          background: var(--accent-forest-hover);
          transform: translateY(-1px);
        }

        .export-btn-group {
          display: flex;
          gap: 5px;
        }

        .icon-action-btn {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-md);
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition);
        }

        .icon-action-btn:hover {
          color: var(--accent-forest);
          border-color: var(--accent-forest);
          background: var(--accent-forest-light);
        }

        /* Financial Glance Overview Card */
        .financial-glance-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          box-shadow: var(--shadow-sm);
        }

        .glance-item {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .glance-icon-wrap {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .expense-tint {
          background: rgba(239, 68, 68, 0.12);
          color: #EF4444;
        }

        .income-tint {
          background: rgba(16, 185, 129, 0.12);
          color: #10B981;
        }

        .neutral-tint {
          background: rgba(99, 102, 241, 0.12);
          color: #6366F1;
        }

        .glance-meta {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .glance-label {
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.2px;
        }

        .glance-amount {
          font-size: 13.5px;
          font-weight: 800;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .expense-text {
          color: #EF4444;
        }

        .income-text {
          color: #10B981;
        }

        .glance-divider {
          width: 1px;
          height: 28px;
          background: var(--border-color);
          margin: 0 6px;
        }

        /* Segmented Type Control */
        .segmented-type-control {
          display: flex;
          background: var(--bg-subtle);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          padding: 3px;
          margin-bottom: 12px;
          gap: 3px;
        }

        .type-tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: transparent;
          border: none;
          padding: 7px 10px;
          border-radius: var(--radius-full);
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition);
        }

        .type-tab-btn.active {
          background: var(--bg-surface);
          color: var(--text-primary);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
          font-weight: 700;
        }

        .tab-indicator {
          width: 6px;
          height: 6px;
          border-radius: var(--radius-full);
        }

        .expense-indicator {
          background: #EF4444;
        }

        .income-indicator {
          background: #10B981;
        }

        .tab-badge {
          font-size: 10.5px;
          background: rgba(0, 0, 0, 0.06);
          padding: 1px 6px;
          border-radius: var(--radius-full);
          color: var(--text-muted);
        }

        /* Search Input */
        .tx-search-container {
          display: flex;
          align-items: center;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 9px 12px;
          margin-bottom: 10px;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }

        .tx-search-container:focus-within {
          border-color: var(--accent-forest);
          box-shadow: 0 0 0 2px var(--accent-forest-light);
        }

        .tx-search-icon {
          color: var(--text-muted);
          margin-right: 8px;
          flex-shrink: 0;
        }

        .tx-search-field {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 13.5px;
          color: var(--text-primary);
          outline: none;
          padding: 0;
        }

        .tx-search-field::placeholder {
          color: var(--text-muted);
        }

        .search-clear-btn {
          background: var(--bg-subtle);
          border: none;
          border-radius: var(--radius-full);
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
        }

        /* Filter Chips Scroller */
        .filter-chips-scroller {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          margin-bottom: 16px;
          scrollbar-width: none;
        }

        .filter-chips-scroller::-webkit-scrollbar {
          display: none;
        }

        .filter-dropdown-wrapper {
          position: relative;
        }

        .filter-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          padding: 6px 12px;
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          white-space: nowrap;
          transition: var(--transition);
        }

        .filter-pill-btn:hover {
          border-color: var(--accent-forest);
          color: var(--text-primary);
        }

        .filter-pill-btn.pill-active {
          background: var(--accent-forest-light);
          border-color: var(--accent-forest);
          color: var(--accent-forest);
          font-weight: 700;
        }

        .category-pill-dot {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
        }

        .pill-clear {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 2px;
          border-radius: var(--radius-full);
          color: inherit;
        }

        .custom-dropdown-panel {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-elevated);
          z-index: 80;
          min-width: 200px;
          max-height: 260px;
          overflow-y: auto;
          padding: 6px;
        }

        .dropdown-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 8px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 4px;
        }

        .dropdown-close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .dropdown-panel-body {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .panel-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          text-align: left;
          padding: 8px 10px;
          border: none;
          background: transparent;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-primary);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition);
        }

        .panel-item:hover {
          background: var(--bg-subtle);
        }

        .panel-item.selected {
          background: var(--accent-forest-light);
          color: var(--accent-forest);
          font-weight: 700;
        }

        .item-dot {
          width: 9px;
          height: 9px;
          border-radius: var(--radius-full);
          flex-shrink: 0;
        }

        .item-dot.all-dot {
          background: var(--text-muted);
        }

        .reset-filters-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: 1px dashed #EF4444;
          padding: 5px 10px;
          border-radius: var(--radius-full);
          font-size: 11.5px;
          font-weight: 600;
          color: #EF4444;
          cursor: pointer;
          white-space: nowrap;
          transition: var(--transition);
        }

        .reset-filters-btn:hover {
          background: rgba(239, 68, 68, 0.08);
        }

        /* Grouped Transactions List */
        .tx-list-area {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .date-group-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .date-group-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 4px;
        }

        .date-header-left {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .date-calendar-icon {
          color: var(--accent-forest);
        }

        .date-group-label {
          font-size: 12.5px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.2px;
        }

        .date-group-sum-pill {
          font-size: 12px;
          font-weight: 800;
          color: var(--text-primary);
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }

        .date-group-items-stack {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* Individual Transaction Card */
        .tx-card-row {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .tx-card-row:hover {
          border-color: var(--accent-forest);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
        }

        .tx-card-row:active {
          transform: scale(0.99);
        }

        .tx-category-badge {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.18s ease;
        }

        .tx-card-row:hover .tx-category-badge {
          transform: scale(1.05);
        }

        .tx-info-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .tx-merchant-name {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
          line-height: 1.25;
        }

        .tx-category-path {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tx-tags-row {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
          margin-top: 2px;
        }

        .tx-tag-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 10px;
          font-weight: 600;
          padding: 1.5px 6px;
          border-radius: var(--radius-sm);
        }

        .payment-tag {
          background: var(--bg-subtle);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        .account-tag {
          background: rgba(15, 118, 110, 0.08);
          color: #0f766e;
        }

        .ai-tag {
          background: rgba(124, 58, 237, 0.1);
          color: #7c3aed;
        }

        .note-tag {
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
        }

        .tx-numeric-side {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          flex-shrink: 0;
        }

        .tx-amount-value {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.2px;
        }

        .amount-expense {
          color: #EF4444;
        }

        .amount-income {
          color: #10B981;
        }

        .tx-time-row {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .tx-timestamp {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
        }

        .tx-chevron {
          color: var(--text-muted);
          transition: transform 0.18s ease;
        }

        .tx-card-row:hover .tx-chevron {
          transform: translateX(2px);
          color: var(--accent-forest);
        }

        /* Empty State */
        .tx-empty-state {
          padding: 44px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          background: var(--bg-surface);
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-xl);
          margin-top: 10px;
        }

        .empty-state-icon {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-full);
          background: var(--accent-forest-light);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }

        .empty-state-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 6px 0;
        }

        .empty-state-text {
          font-size: 12.5px;
          color: var(--text-secondary);
          max-width: 320px;
          line-height: 1.4;
          margin: 0 0 16px 0;
        }

        .empty-state-actions {
          display: flex;
          gap: 10px;
        }

        .btn-empty-reset {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-subtle);
          border: 1px solid var(--border-color);
          padding: 8px 14px;
          border-radius: var(--radius-full);
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
        }

        .btn-empty-add {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--accent-forest);
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: var(--radius-full);
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
