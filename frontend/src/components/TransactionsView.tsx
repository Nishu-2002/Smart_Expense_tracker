import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Calendar,
  CreditCard,
  ChevronDown,
  FileSpreadsheet
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
  onSearchChange: (val: string) => void;
  onCategoryFilter: (id: number | null) => void;
  onPaymentFilter: (val: string) => void;
  onSelectTransaction: (tx: Transaction) => void;
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
  onSearchChange,
  onCategoryFilter,
  onPaymentFilter,
  onSelectTransaction,
  onBack
}) => {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showPaymentMenu, setShowPaymentMenu] = useState(false);

  const formatRupee = (val?: number) => {
    if (val === undefined || isNaN(val)) return '₹ 0';
    return `₹ ${Math.round(val).toLocaleString('en-IN')}`;
  };

  const handleExportCsv = () => {
    triggerExportCsv();
  };

  const handleExportExcel = () => {
    triggerExportExcel();
  };

  return (
    <div className="transactions-container animate-fade">
      {/* Header */}
      <header className="page-header">
        <button id="transactions-back-btn" className="icon-btn" onClick={onBack} aria-label="Go Back">
          <ArrowLeft size={20} color="var(--text-primary)" />
        </button>
        <h2 className="header-title">Transactions</h2>
        <div className="header-actions">
          <button
            id="export-csv-btn"
            className="icon-btn"
            onClick={handleExportCsv}
            title="Export CSV"
          >
            <Download size={18} />
          </button>
          <button
            id="export-excel-btn"
            className="icon-btn"
            onClick={handleExportExcel}
            title="Export Excel"
          >
            <FileSpreadsheet size={18} />
          </button>
        </div>
      </header>

      {/* Search Input */}
      <div className="search-wrap">
        <Search size={18} className="search-icon" />
        <input
          id="transactions-search-input"
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by merchant, category..."
          className="search-input"
        />
      </div>

      {/* Filter Chips */}
      <div className="filter-chips-row">
        {/* Category Dropdown */}
        <div className="filter-chip-wrap">
          <button
            id="filter-category-btn"
            className={`filter-chip ${selectedCategoryId ? 'active' : ''}`}
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
          >
            <span>
              {selectedCategoryId
                ? categories.find((c) => c.id === selectedCategoryId)?.name || 'Category'
                : 'Category'}
            </span>
            <ChevronDown size={14} />
          </button>
          {showCategoryMenu && (
            <div className="dropdown-menu animate-scale">
              <button
                className="dropdown-item"
                onClick={() => {
                  onCategoryFilter(null);
                  setShowCategoryMenu(false);
                }}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  className="dropdown-item"
                  onClick={() => {
                    onCategoryFilter(c.id);
                    setShowCategoryMenu(false);
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Payment Dropdown */}
        <div className="filter-chip-wrap">
          <button
            id="filter-payment-btn"
            className={`filter-chip ${selectedPaymentMethod ? 'active' : ''}`}
            onClick={() => setShowPaymentMenu(!showPaymentMenu)}
          >
            <span>{selectedPaymentMethod || 'Payment'}</span>
            <ChevronDown size={14} />
          </button>
          {showPaymentMenu && (
            <div className="dropdown-menu animate-scale">
              <button
                className="dropdown-item"
                onClick={() => {
                  onPaymentFilter('');
                  setShowPaymentMenu(false);
                }}
              >
                All Payment Methods
              </button>
              {['UPI', 'Cash', 'Credit Card', 'Debit Card', 'Net Banking'].map((p) => (
                <button
                  key={p}
                  className="dropdown-item"
                  onClick={() => {
                    onPaymentFilter(p);
                    setShowPaymentMenu(false);
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Total Summary Badge */}
        <div className="total-badge">
          <span>{totalCount} items</span>
        </div>
      </div>

      {/* Grouped Transactions List by Date */}
      <div className="grouped-list">
        {groupedTransactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions found matching your criteria.</p>
          </div>
        ) : (
          groupedTransactions.map((group, gIdx) => (
            <div key={gIdx} className="date-group-block">
              {/* Group Header matching screenshot: "Today · 14 Oct 2025" and "₹ 700" */}
              <div className="date-group-header">
                <span className="date-group-title">{group.date_label}</span>
                <span className="date-group-total">{formatRupee(group.total)}</span>
              </div>

              <div className="group-items">
                {group.transactions.map((tx) => {
                  const isNegative = tx.type === 'expense';
                  return (
                    <div
                      key={tx.id}
                      id={`tx-item-${tx.id}`}
                      className="transaction-row"
                      onClick={() => onSelectTransaction(tx)}
                    >
                      <div
                        className="tx-icon-circle"
                        style={{
                          backgroundColor: tx.category_bg_color || '#E8F5E9',
                          color: tx.category_color || '#10B981'
                        }}
                      >
                        <CategoryIcon name={tx.category_icon || tx.category_name} size={18} />
                      </div>

                      <div className="tx-details">
                        <h4 className="tx-merchant">{tx.merchant_or_title}</h4>
                        <span className="tx-sub">{tx.subtitle || tx.category_name || 'Expense'}</span>
                      </div>

                      <div className="tx-right">
                        <span className={`tx-amount ${isNegative ? 'expense' : 'income'}`}>
                          {isNegative ? `- ${formatRupee(tx.amount)}` : `+ ${formatRupee(tx.amount)}`}
                        </span>
                        <span className="tx-time">{tx.time_display || 'Recent'}</span>
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
          padding: 18px 20px 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .search-wrap {
          display: flex;
          align-items: center;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 12px 14px;
          margin-bottom: 14px;
          box-shadow: var(--shadow-sm);
        }

        .search-icon {
          color: var(--text-secondary);
          margin-right: 10px;
        }

        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 14.5px;
          font-weight: 500;
        }

        .search-input:focus {
          box-shadow: none;
        }

        /* Filter Chips */
        .filter-chips-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          position: relative;
        }

        .filter-chip-wrap {
          position: relative;
        }

        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          padding: 7px 12px;
          border-radius: var(--radius-full);
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .filter-chip.active {
          border-color: var(--accent-forest);
          background: var(--accent-forest-light);
          color: var(--accent-forest);
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-elevated);
          z-index: 60;
          min-width: 170px;
          max-height: 220px;
          overflow-y: auto;
          padding: 4px;
        }

        .dropdown-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          border-radius: var(--radius-sm);
        }

        .dropdown-item:hover {
          background: var(--bg-subtle);
        }

        .total-badge {
          margin-left: auto;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
        }

        /* Grouped List */
        .grouped-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .date-group-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding: 0 4px;
        }

        .date-group-title {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .date-group-total {
          font-size: 14px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .group-items {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: var(--text-secondary);
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};
