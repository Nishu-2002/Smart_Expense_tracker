import React, { useState } from 'react';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Check,
  CreditCard,
  Building2,
  Tag,
  FileText,
  Car
} from 'lucide-react';
import { Transaction, Category } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { updateTransaction, deleteTransaction } from '../services/api';

interface ExpenseDetailsModalProps {
  transaction: Transaction | null;
  categories: Category[];
  onBack: () => void;
  onRefresh: () => void;
}

export const ExpenseDetailsModal: React.FC<ExpenseDetailsModalProps> = ({
  transaction,
  categories,
  onBack,
  onRefresh
}) => {
  if (!transaction) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [merchant, setMerchant] = useState(transaction.merchant_or_title);
  const [paymentMethod, setPaymentMethod] = useState(transaction.payment_method);
  const [accountName, setAccountName] = useState(transaction.account_name);
  const [notes, setNotes] = useState(transaction.notes || '');
  const [selectedCatId, setSelectedCatId] = useState<number | undefined>(transaction.category_id);
  const [isSaving, setIsSaving] = useState(false);

  const formatRupee = (val: number) => {
    return `₹ ${Math.round(val).toLocaleString('en-IN')}`;
  };

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsSaving(true);
    try {
      await updateTransaction(transaction.id, {
        amount: parsedAmount,
        merchant_or_title: merchant,
        payment_method: paymentMethod,
        account_name: accountName,
        notes: notes,
        category_id: selectedCatId
      });
      setIsEditing(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update transaction');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(transaction.id);
        onRefresh();
        onBack();
      } catch (err: any) {
        alert(err.message || 'Failed to delete transaction');
      }
    }
  };

  const isNegative = transaction.type === 'expense';

  return (
    <div className="expense-details-container animate-fade">
      {/* Header */}
      <header className="page-header">
        <button id="expense-detail-back-btn" className="icon-btn" onClick={onBack} aria-label="Go Back">
          <ArrowLeft size={20} color="var(--text-primary)" />
        </button>
        <h2 className="header-title">Expense Details</h2>
        <div className="header-actions">
          {isEditing ? (
            <button className="icon-btn save-active" onClick={handleSave} title="Save">
              <Check size={18} color="#10B981" />
            </button>
          ) : (
            <button id="edit-tx-btn" className="icon-btn" onClick={() => setIsEditing(true)} title="Edit">
              <Pencil size={18} color="var(--text-primary)" />
            </button>
          )}
          <button id="delete-tx-btn" className="icon-btn delete-btn" onClick={handleDelete} title="Delete">
            <Trash2 size={18} color="#EF4444" />
          </button>
        </div>
      </header>

      {/* Main Expense Identity Card */}
      <div className="details-hero-card">
        <div
          className="hero-icon-circle"
          style={{
            backgroundColor: transaction.category_bg_color || '#E8F5E9',
            color: transaction.category_color || '#10B981'
          }}
        >
          <CategoryIcon name={transaction.category_icon || transaction.category_name} size={36} />
        </div>

        {isEditing ? (
          <div className="edit-hero-inputs">
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="edit-merchant-input"
            />
            <div className="edit-amount-row">
              <span>₹</span>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="edit-amount-input"
              />
            </div>
          </div>
        ) : (
          <div className="hero-text-group">
            <h3 className="hero-merchant">{transaction.merchant_or_title}</h3>
            <div className={`hero-amount ${isNegative ? 'expense' : 'income'}`}>
              {isNegative ? `- ${formatRupee(transaction.amount)}` : `+ ${formatRupee(transaction.amount)}`}
            </div>
            <span className="hero-subtitle">
              {transaction.subtitle || transaction.category_name || 'Expense'}
            </span>
            <span className="hero-time">
              {transaction.formatted_date || '14 Oct 2025, 08:45 AM'}
            </span>
          </div>
        )}
      </div>

      {/* Property rows matching screenshot */}
      <div className="property-rows-card">
        {/* Payment Method */}
        <div className="prop-row">
          <div className="prop-left">
            <CreditCard size={18} className="prop-icon" />
            <span className="prop-label">Payment Method</span>
          </div>
          {isEditing ? (
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="prop-select"
            >
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Net Banking">Net Banking</option>
            </select>
          ) : (
            <span className="prop-val">{transaction.payment_method} &gt;</span>
          )}
        </div>

        {/* Account / Wallet */}
        <div className="prop-row">
          <div className="prop-left">
            <Building2 size={18} className="prop-icon" />
            <span className="prop-label">Account / Wallet</span>
          </div>
          {isEditing ? (
            <select
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="prop-select"
            >
              <option value="Bank of Baroda">Bank of Baroda</option>
              <option value="Canara Bank">Canara Bank</option>
              <option value="HDFC Bank">HDFC Bank</option>
              <option value="Cash Wallet">Cash Wallet</option>
              <option value="ICICI Credit Card">ICICI Credit Card</option>
              <option value="Zerodha Trading">Zerodha Trading</option>
            </select>
          ) : (
            <span className="prop-val">{transaction.account_name} &gt;</span>
          )}
        </div>

        {/* Category */}
        <div className="prop-row">
          <div className="prop-left">
            <Tag size={18} className="prop-icon" />
            <span className="prop-label">Category</span>
          </div>
          {isEditing ? (
            <select
              value={selectedCatId || ''}
              onChange={(e) => setSelectedCatId(e.target.value ? Number(e.target.value) : undefined)}
              className="prop-select"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="prop-val">
              {transaction.category_name} &gt; {transaction.subcategory_name || 'Cab'} &gt;
            </span>
          )}
        </div>

        {/* Notes */}
        <div className="prop-row">
          <div className="prop-left">
            <FileText size={18} className="prop-icon" />
            <span className="prop-label">Notes</span>
          </div>
          {isEditing ? (
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add note..."
              className="prop-input"
            />
          ) : (
            <span className="prop-val">{transaction.notes || '-'}</span>
          )}
        </div>
      </div>

      {/* Auto Categorization Reason Badge */}
      {transaction.is_auto_categorized && (
        <div className="auto-info-pill">
          <span>{transaction.auto_detected_reason || 'Auto detected by keyword matching engine'}</span>
        </div>
      )}

      {isEditing && (
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="save-changes-btn"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      )}

      <style>{`
        .expense-details-container {
          padding: 18px 20px 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .details-hero-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 20px;
          box-shadow: var(--shadow-card);
        }

        .hero-icon-circle {
          width: 72px;
          height: 72px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }

        .hero-merchant {
          font-size: 20px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .hero-amount {
          font-size: 28px;
          font-weight: 800;
          margin: 4px 0 2px;
        }

        .hero-amount.expense {
          color: #DC2626;
        }

        .hero-amount.income {
          color: #10B981;
        }

        .hero-subtitle {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          display: block;
        }

        .hero-time {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
          display: block;
        }

        .edit-hero-inputs {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .edit-merchant-input {
          font-size: 18px;
          font-weight: 700;
          text-align: center;
          padding: 6px 12px;
          border-radius: var(--radius-md);
          width: 80%;
        }

        .edit-amount-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 24px;
          font-weight: 800;
        }

        .edit-amount-input {
          font-size: 24px;
          font-weight: 800;
          width: 120px;
          text-align: center;
          padding: 4px;
          border-radius: var(--radius-md);
        }

        .property-rows-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 8px 18px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 16px;
        }

        .prop-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid var(--border-color);
        }

        .prop-row:last-child {
          border-bottom: none;
        }

        .prop-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .prop-icon {
          color: var(--text-secondary);
        }

        .prop-label {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .prop-val {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .prop-select, .prop-input {
          font-size: 13px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
        }

        .auto-info-pill {
          background: #E8F5E9;
          color: #2E7D32;
          border: 1px solid #C8E6C9;
          border-radius: var(--radius-full);
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
          margin-bottom: 20px;
        }

        .save-changes-btn {
          width: 100%;
          background: var(--accent-forest);
          color: #FFFFFF;
          padding: 14px;
          border-radius: var(--radius-lg);
          font-size: 15px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};
