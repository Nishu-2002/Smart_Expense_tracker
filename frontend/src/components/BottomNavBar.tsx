import React from 'react';
import { Home, ListOrdered, Plus, PieChart, Menu } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenMore: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  onOpenMore
}) => {
  return (
    <nav className="bottom-nav-bar" aria-label="Main Navigation">
      <button
        id="nav-home-btn"
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onTabChange('home')}
      >
        <div className="nav-icon-wrap">
          <Home size={22} />
        </div>
        <span>Home</span>
      </button>

      <button
        id="nav-transactions-btn"
        className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
        onClick={() => onTabChange('transactions')}
      >
        <div className="nav-icon-wrap">
          <ListOrdered size={22} />
        </div>
        <span>Transactions</span>
      </button>

      {/* Floating Center Add Button */}
      <div className="nav-center-action">
        <button
          id="nav-add-btn"
          className="nav-fab-btn"
          onClick={() => onTabChange('add')}
          aria-label="Add Expense"
        >
          <Plus size={26} strokeWidth={2.6} />
        </button>
      </div>

      <button
        id="nav-budgets-btn"
        className={`nav-item ${activeTab === 'budgets' ? 'active' : ''}`}
        onClick={() => onTabChange('budgets')}
      >
        <div className="nav-icon-wrap">
          <PieChart size={22} />
        </div>
        <span>Budgets</span>
      </button>

      <button
        id="nav-more-btn"
        className={`nav-item ${activeTab === 'reports' || activeTab === 'categories' || activeTab === 'calendar' ? 'active' : ''}`}
        onClick={onOpenMore}
      >
        <div className="nav-icon-wrap">
          <Menu size={22} />
        </div>
        <span>More</span>
      </button>

      <style>{`
        .bottom-nav-bar {
          position: sticky;
          bottom: 0;
          left: 0;
          right: 0;
          height: 68px;
          background: var(--bg-surface);
          border-top: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 0 12px;
          z-index: 50;
          backdrop-filter: blur(12px);
          box-shadow: 0 -4px 16px rgba(0,0,0,0.03);
          margin-top: auto;
          flex-shrink: 0;
          width: 100%;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: var(--radius-md);
          min-width: 58px;
        }

        .nav-item.active {
          color: var(--accent-forest);
          font-weight: 700;
        }

        .nav-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .nav-item.active .nav-icon-wrap {
          transform: translateY(-2px);
        }

        .nav-center-action {
          position: relative;
          top: -14px;
        }

        .nav-fab-btn {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-full);
          background: var(--accent-forest);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 18px rgba(30, 62, 50, 0.35);
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s;
        }

        .nav-fab-btn:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 8px 24px rgba(30, 62, 50, 0.45);
        }

        .nav-fab-btn:active {
          transform: scale(0.95);
        }
      `}</style>
    </nav>
  );
};
