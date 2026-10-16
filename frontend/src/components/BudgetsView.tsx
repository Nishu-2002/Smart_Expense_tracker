import React, { useState } from 'react';
import { ArrowLeft, Plus, X, Car, Utensils, ShoppingBag, Home } from 'lucide-react';
import { BudgetCategory, Category } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { setBudget } from '../services/api';

interface BudgetsViewProps {
  budgets: BudgetCategory[];
  categories: Category[];
  onBack: () => void;
  onRefresh: () => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  categories,
  onBack,
  onRefresh
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<number | ''>('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatRupee = (val?: number) => {
    if (val === undefined || isNaN(val)) return '₹ 0';
    return `₹ ${Math.round(val).toLocaleString('en-IN')}`;
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(budgetAmount);
    if (isNaN(amt) || amt <= 0) return;

    setIsSubmitting(true);
    try {
      await setBudget({
        category_id: selectedCatId === '' ? null : Number(selectedCatId),
        amount: amt
      });
      setShowModal(false);
      setBudgetAmount('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Strictly display category budgets configured in the database
  const displayBudgets = budgets.filter((b) => b.category_id !== null);

  return (
    <div className="budgets-container animate-fade">
      {/* Header */}
      <header className="page-header">
        <button id="budgets-back-btn" className="icon-btn" onClick={onBack} aria-label="Go Back">
          <ArrowLeft size={20} color="var(--text-primary)" />
        </button>
        <h2 className="header-title">Budgets</h2>
        <button id="set-budget-btn" className="set-budget-cta" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          <span>Set Budget</span>
        </button>
      </header>

      {/* Category Budget Cards */}
      <div className="budgets-list">
        {displayBudgets.length === 0 ? (
          <div className="empty-budget-box">
            <p>No category budgets configured yet.</p>
            <span>Click "+ Set Budget" above to assign budget targets to categories.</span>
          </div>
        ) : (
          displayBudgets.map((b) => {
            // Dynamic bar color based on percentage
            let barColor = '#10B981';
            let badgeBg = '#E8F5E9';
            let badgeColor = '#10B981';
            if (b.percentage > 85) {
              barColor = '#EF4444';
              badgeBg = '#FEE2E2';
              badgeColor = '#DC2626';
            } else if (b.percentage > 65) {
              barColor = '#F59E0B';
              badgeBg = '#FEF3C7';
              badgeColor = '#D97706';
            } else if (b.percentage > 50) {
              barColor = '#F97316';
              badgeBg = '#FFEDD5';
              badgeColor = '#EA580C';
            } else {
              barColor = '#0EA5E9';
              badgeBg = '#E0F2FE';
              badgeColor = '#0284C7';
            }

            return (
              <div key={b.id} id={`budget-card-${b.id}`} className="budget-card">
              <div className="budget-card-top">
                <div className="budget-icon-wrap" style={{ backgroundColor: badgeBg, color: badgeColor }}>
                  <CategoryIcon name={b.icon || b.name} size={18} />
                </div>
                <div className="budget-meta">
                  <h3 className="budget-name">{b.name}</h3>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(100, b.percentage)}%`,
                        backgroundColor: barColor
                      }}
                    />
                  </div>
                </div>
                <div className="percentage-badge" style={{ backgroundColor: badgeBg, color: badgeColor }}>
                  {b.percentage}%
                </div>
              </div>

              <div className="budget-sub-info">
                <span>Spent: {formatRupee(b.spent_amount)}</span>
                <span>Budget: {formatRupee(b.budget_amount)}</span>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Set Budget Modal */}
      {showModal && (
        <div className="modal-overlay animate-fade">
          <div className="modal-card">
            <div className="modal-head">
              <h3>Configure Budget</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveBudget}>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="modal-select"
                >
                  <option value="">Overall Monthly Budget</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Monthly Budget Amount (₹)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 5000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="modal-input"
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="modal-submit-btn">
                {isSubmitting ? 'Saving...' : 'Set Budget'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .budgets-container {
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

        .set-budget-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--accent-forest);
          color: #FFFFFF;
          font-weight: 700;
          font-size: 13px;
          padding: 7px 14px;
          border-radius: var(--radius-full);
          box-shadow: 0 3px 10px rgba(30, 62, 50, 0.25);
          transition: var(--transition);
        }

        .set-budget-cta:hover {
          background: var(--accent-forest-hover);
        }

        .budgets-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .budget-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 16px 18px;
          box-shadow: var(--shadow-sm);
        }

        .budget-card-top {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .budget-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .budget-meta {
          flex: 1;
        }

        .budget-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .progress-track {
          width: 100%;
          height: 7px;
          background: #EFECE6;
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.4s ease;
        }

        .percentage-badge {
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          flex-shrink: 0;
        }

        .budget-sub-info {
          display: flex;
          justify-content: space-between;
          font-size: 11.5px;
          color: var(--text-muted);
          font-weight: 500;
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px dashed var(--border-color);
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }

        .modal-card {
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          width: 100%;
          max-width: 400px;
          padding: 22px;
          box-shadow: var(--shadow-elevated);
        }

        .modal-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .modal-close {
          color: var(--text-secondary);
        }

        .form-group {
          margin-bottom: 14px;
        }

        .form-group label {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .modal-select, .modal-input {
          width: 100%;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          font-size: 14px;
        }

        .modal-submit-btn {
          width: 100%;
          background: var(--accent-forest);
          color: #FFF;
          font-weight: 700;
          padding: 12px;
          border-radius: var(--radius-lg);
          margin-top: 10px;
        }

        .empty-budget-box {
          text-align: center;
          padding: 30px 18px;
          background: var(--bg-surface);
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-xl);
        }

        .empty-budget-box p {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .empty-budget-box span {
          font-size: 12px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
