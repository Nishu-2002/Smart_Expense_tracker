import React from 'react';
import {
  X,
  PieChart,
  Calendar as CalendarIcon,
  Tag,
  ListOrdered,
  FileSpreadsheet,
  Moon,
  Sun,
  Smartphone,
  Monitor,
  Download,
  Info
} from 'lucide-react';
import { ActiveTab, User } from '../types';

interface MoreMenuModalProps {
  isOpen: boolean;
  user: User | null;
  activeTab: ActiveTab;
  isDarkMode: boolean;
  isMobileFrame: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onToggleTheme: () => void;
  onToggleFrame: () => void;
}

export const MoreMenuModal: React.FC<MoreMenuModalProps> = ({
  isOpen,
  user,
  activeTab,
  isDarkMode,
  isMobileFrame,
  onClose,
  onSelectTab,
  onToggleTheme,
  onToggleFrame
}) => {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'reports', label: 'Reports & Analytics', icon: PieChart, desc: 'Visual charts, trends & insights' },
    { id: 'categories', label: 'Categories Management', icon: Tag, desc: 'Manage categories & subcategories' },
    { id: 'calendar', label: 'Expense Calendar', icon: CalendarIcon, desc: 'Daily timeline & spending intensity' },
    { id: 'budgets', label: 'Budget Management', icon: PieChart, desc: 'Spending thresholds & goals' },
    { id: 'transactions', label: 'All Transactions', icon: ListOrdered, desc: 'Search, filter, edit & export' }
  ];

  return (
    <div className="more-modal-overlay animate-fade">
      <div className="more-drawer">
        <div className="drawer-header">
          <div className="drawer-user">
            <img
              src={user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
              alt="Avatar"
              className="drawer-avatar"
            />
            <div>
              <h3 className="drawer-username">{user?.name || 'My Profile'}</h3>
              <span className="drawer-email">{user?.email || 'Manage Account'}</span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* View Mode & Theme Switcher */}
        <div className="controls-row">
          <button className="control-pill" onClick={onToggleTheme}>
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button className="control-pill" onClick={onToggleFrame}>
            {isMobileFrame ? <Monitor size={16} /> : <Smartphone size={16} />}
            <span>{isMobileFrame ? 'Desktop Full View' : 'Mobile Frame View'}</span>
          </button>
        </div>

        {/* Menu Navigation Items */}
        <div className="menu-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`menu-row ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectTab(item.id as ActiveTab);
                  onClose();
                }}
              >
                <div className="menu-icon-wrap">
                  <Icon size={20} />
                </div>
                <div className="menu-text">
                  <span className="menu-title">{item.label}</span>
                  <span className="menu-desc">{item.desc}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Export Data Quick Links */}
        <div className="export-section">
          <span className="export-label">Data Exports</span>
          <div className="export-btns-row">
            <a href="/api/export/csv" target="_blank" rel="noreferrer" className="export-link-btn">
              <Download size={14} />
              <span>Export CSV</span>
            </a>
            <a href="/api/export/excel" target="_blank" rel="noreferrer" className="export-link-btn">
              <FileSpreadsheet size={14} />
              <span>Export Excel</span>
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .more-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .more-drawer {
          background: var(--bg-surface);
          width: 100%;
          max-width: 440px;
          border-top-left-radius: 28px;
          border-top-right-radius: 28px;
          padding: 22px 20px 30px;
          box-shadow: var(--shadow-elevated);
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .drawer-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .drawer-avatar {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-full);
          object-fit: cover;
          border: 2px solid var(--accent-forest);
        }

        .drawer-username {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .drawer-email {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .controls-row {
          display: flex;
          gap: 10px;
          margin-bottom: 18px;
        }

        .control-pill {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--bg-subtle);
          border: 1px solid var(--border-color);
          padding: 9px 12px;
          border-radius: var(--radius-full);
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .menu-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        .menu-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          border-radius: var(--radius-lg);
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          text-align: left;
          transition: var(--transition);
        }

        .menu-row:hover, .menu-row.active {
          border-color: var(--accent-forest);
          background: var(--accent-forest-light);
        }

        .menu-icon-wrap {
          color: var(--accent-forest);
        }

        .menu-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          display: block;
        }

        .menu-desc {
          font-size: 11.5px;
          color: var(--text-secondary);
          display: block;
        }

        .export-section {
          padding-top: 14px;
          border-top: 1px dashed var(--border-color);
        }

        .export-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          display: block;
          margin-bottom: 8px;
        }

        .export-btns-row {
          display: flex;
          gap: 10px;
        }

        .export-link-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: var(--bg-subtle);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
          text-decoration: none;
        }
      `}</style>
    </div>
  );
};
