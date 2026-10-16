import React from 'react';
import {
  Menu,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  Car,
  Utensils,
  Train,
  ShoppingBag,
  Flame,
  Zap,
  HeartPulse,
  MoreHorizontal
} from 'lucide-react';
import { AnalyticsSummary, Transaction, User } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface DashboardViewProps {
  user: User | null;
  summary: AnalyticsSummary | null;
  recentTransactions: Transaction[];
  onOpenAddExpense: (prefilledMerchant?: string, categoryHint?: string) => void;
  onSelectTransaction: (tx: Transaction) => void;
  onViewAllTransactions: () => void;
  onOpenMenu: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  summary,
  recentTransactions,
  onOpenAddExpense,
  onSelectTransaction,
  onViewAllTransactions,
  onOpenMenu
}) => {
  const formatRupee = (val?: number) => {
    if (val === undefined || isNaN(val)) return '₹ 0';
    return `₹ ${Math.round(val).toLocaleString('en-IN')}`;
  };

  const quickAddItems = [
    { label: 'Food', icon: Utensils, color: '#F97316', bg: '#FFF3E0', query: 'Food' },
    { label: 'Cab', icon: Car, color: '#10B981', bg: '#E8F5E9', query: 'Uber ride' },
    { label: 'Metro', icon: Train, color: '#0EA5E9', bg: '#E0F2FE', query: 'Namma Metro' },
    { label: 'Shopping', icon: ShoppingBag, color: '#F59E0B', bg: '#FEF3C7', query: 'Shopping' },
    { label: 'Gas', icon: Flame, color: '#EAB308', bg: '#FEF9C3', query: 'LPG Gas cylinder' },
    { label: 'Bills', icon: Zap, color: '#0D9488', bg: '#CCFBF1', query: 'Electricity bill' },
    { label: 'Health', icon: HeartPulse, color: '#EF4444', bg: '#FEE2E2', query: 'Medicines' },
    { label: 'Others', icon: MoreHorizontal, color: '#64748B', bg: '#F1F5F9', query: 'Misc expense' },
  ];

  const todayTotal = summary?.today.total ?? 0;
  const todayCount = summary?.today.count ?? 0;
  const thisWeekTotal = summary?.this_week.total ?? 0;
  const thisMonthTotal = summary?.this_month.total ?? 0;
  const todayDiff = summary?.today.diff_yesterday_pct ?? 0;
  const weekDiff = summary?.this_week.diff_pct ?? 0;
  const monthDiff = summary?.this_month.diff_pct ?? 0;

  return (
    <div className="dashboard-container animate-fade">
      {/* Header */}
      <header className="dashboard-header">
        <button id="menu-btn" className="icon-btn" onClick={onOpenMenu} aria-label="Menu">
          <Menu size={22} color="var(--text-primary)" />
        </button>
        <h1 className="header-title">Expense Tracker</h1>
        <div className="avatar-wrap">
          <img
            src={user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
            alt="Profile"
            className="avatar-img"
          />
          <span className="online-dot" />
        </div>
      </header>

      {/* Greeting Banner with Leaf Art */}
      <div className="greeting-card">
        <div className="greeting-text">
          <h2 className="greeting-title">Good Morning{user?.name ? `, ${user.name}` : ''}!</h2>
          <p className="greeting-sub">Track your expenses, build better tomorrow.</p>
        </div>
        {/* Organic Leaf Vector Decor */}
        <div className="leaf-decor" aria-hidden="true">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M110 10C80 30 50 20 20 60C50 65 80 50 110 10Z" fill="#1E3E32" fillOpacity="0.12"/>
            <path d="M115 25C95 45 75 40 45 75C70 80 95 65 115 25Z" fill="#10B981" fillOpacity="0.14"/>
            <path d="M85 5C70 25 55 22 35 48C52 52 70 42 85 5Z" fill="#1E3E32" fillOpacity="0.08"/>
            <path d="M20 60C50 70 80 75 115 25" stroke="#1E3E32" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.18"/>
          </svg>
        </div>
      </div>

      {/* Today's Expense Featured Card */}
      <div className="featured-card">
        <div className="card-top-row">
          <div className="card-title-group">
            <span className="featured-label">Today's Expense</span>
            <div className="featured-amount">{formatRupee(todayTotal)}</div>
            <span className="featured-meta">{todayCount} transactions</span>
          </div>
          <div className="featured-right">
            {todayDiff !== 0 && (
              <div className={`badge-pill ${todayDiff <= 0 ? 'positive' : 'negative'}`}>
                {todayDiff <= 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                <span>{Math.abs(todayDiff)}%</span>
              </div>
            )}
            <div className="car-circle-icon">
              <Car size={24} color="#10B981" />
            </div>
          </div>
        </div>
      </div>

      {/* Week & Month Metric Sub-Cards */}
      <div className="metric-row">
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: '#FFF7ED', color: '#EA580C' }}>
            <BarChart3 size={18} />
          </div>
          <div className="metric-info">
            <span className="metric-label">This Week</span>
            <span className="metric-val">{formatRupee(thisWeekTotal)}</span>
            {weekDiff !== 0 && (
              <div className={`metric-trend ${weekDiff <= 0 ? 'down' : 'up'}`}>
                {weekDiff <= 0 ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
                <span>{Math.abs(weekDiff)}%</span>
              </div>
            )}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: '#FDF2F8', color: '#DB2777' }}>
            <Briefcase size={18} />
          </div>
          <div className="metric-info">
            <span className="metric-label">This Month</span>
            <span className="metric-val">{formatRupee(thisMonthTotal)}</span>
            {monthDiff !== 0 && (
              <div className={`metric-trend ${monthDiff >= 0 ? 'up' : 'down'}`}>
                {monthDiff >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                <span>{Math.abs(monthDiff)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Add Section */}
      <section className="section-block">
        <div className="section-head">
          <h3 className="section-title">Quick Add</h3>
        </div>
        <div className="quick-add-grid">
          {quickAddItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                id={`quick-add-${item.label.toLowerCase()}`}
                className="quick-add-item"
                onClick={() => onOpenAddExpense(item.query, item.label)}
              >
                <div className="quick-circle" style={{ backgroundColor: item.bg, color: item.color }}>
                  <Icon size={20} />
                </div>
                <span className="quick-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recent Transactions Section */}
      <section className="section-block">
        <div className="section-head">
          <h3 className="section-title">Recent Transactions</h3>
          <button id="view-all-tx-btn" className="link-btn" onClick={onViewAllTransactions}>
            View All
          </button>
        </div>

        <div className="transactions-list">
          {recentTransactions.length === 0 ? (
            <div className="empty-tx-placeholder">
              <p>No transactions recorded yet.</p>
              <span>Tap a category above or "+" to record an expense.</span>
            </div>
          ) : (
            recentTransactions.slice(0, 5).map((tx) => {
              const isNegative = tx.type === 'expense';
              return (
                <div
                  key={tx.id}
                  id={`recent-tx-${tx.id}`}
                  className="transaction-row"
                  onClick={() => onSelectTransaction(tx)}
                >
                  <div
                    className="tx-icon-circle"
                    style={{ backgroundColor: tx.category_bg_color || '#E8F5E9', color: tx.category_color || '#10B981' }}
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
                    <span className="tx-time">{tx.time_display || 'Today'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>


      <style>{`
        .dashboard-container {
          padding: 18px 20px 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .icon-btn {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
        }

        .header-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .avatar-wrap {
          position: relative;
          width: 38px;
          height: 38px;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          border-radius: var(--radius-full);
          object-fit: cover;
          border: 2px solid #FFFFFF;
          box-shadow: var(--shadow-sm);
        }

        .online-dot {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 9px;
          height: 9px;
          background: #10B981;
          border: 2px solid #FFFFFF;
          border-radius: var(--radius-full);
        }

        /* Greeting */
        .greeting-card {
          position: relative;
          margin-bottom: 18px;
          overflow: hidden;
          padding: 6px 0 2px;
        }

        .greeting-title {
          font-size: 23px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.25;
        }

        .greeting-sub {
          font-size: 13.5px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .leaf-decor {
          position: absolute;
          right: -10px;
          top: -15px;
          width: 100px;
          height: 100px;
          pointer-events: none;
        }

        /* Featured Card */
        .featured-card {
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          padding: 20px 22px;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-card);
          margin-bottom: 16px;
          position: relative;
        }

        .card-top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .featured-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .featured-amount {
          font-size: 32px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.5px;
          margin: 4px 0 2px;
        }

        .featured-meta {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .featured-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }

        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 12px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: var(--radius-full);
        }

        .badge-pill.positive {
          background: #E8F5E9;
          color: #10B981;
        }

        .car-circle-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-full);
          background: #E8F5E9;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Metric Row */
        .metric-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }

        .metric-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: var(--shadow-sm);
        }

        .metric-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .metric-info {
          display: flex;
          flex-direction: column;
        }

        .metric-label {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .metric-val {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.2;
          margin-top: 1px;
        }

        .metric-trend {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 11px;
          font-weight: 700;
          margin-top: 2px;
        }

        .metric-trend.down {
          color: #10B981;
        }

        .metric-trend.up {
          color: #10B981;
        }

        /* Section Block */
        .section-block {
          margin-bottom: 24px;
        }

        .section-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .link-btn {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          transition: color 0.15s;
        }

        .link-btn:hover {
          color: var(--accent-forest);
        }

        /* Quick Add */
        .quick-add-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px 10px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 18px 14px;
          box-shadow: var(--shadow-sm);
        }

        .quick-add-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .quick-circle {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s ease;
        }

        .quick-add-item:hover .quick-circle {
          transform: translateY(-2px) scale(1.06);
        }

        .quick-label {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-primary);
        }

        /* Transactions List */
        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .transaction-row {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: var(--transition);
        }

        .transaction-row:hover {
          border-color: var(--accent-forest-hover);
          transform: translateX(2px);
        }

        .tx-icon-circle {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .tx-details {
          flex: 1;
          min-width: 0;
        }

        .tx-merchant {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tx-sub {
          font-size: 11.5px;
          color: var(--text-secondary);
          display: block;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tx-right {
          text-align: right;
          flex-shrink: 0;
        }

        .tx-amount {
          font-size: 14.5px;
          font-weight: 800;
          display: block;
        }

        .tx-amount.expense {
          color: #DC2626;
        }

        .tx-amount.income {
          color: #10B981;
        }

        .tx-time {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
          display: block;
        }

        .empty-tx-placeholder {
          text-align: center;
          padding: 24px 16px;
          background: var(--bg-surface);
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-lg);
        }

        .empty-tx-placeholder p {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .empty-tx-placeholder span {
          font-size: 11.5px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
