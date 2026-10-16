import React, { useState } from 'react';
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
  Database,
  Cloud,
  Check,
  RotateCcw
} from 'lucide-react';
import { ActiveTab, User } from '../types';
import {
  triggerExportCsv,
  triggerExportExcel,
  isUsingLocalStorage,
  getCustomApiUrl,
  setCustomApiUrl
} from '../services/api';

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
  onRefreshData?: () => void;
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
  onToggleFrame,
  onRefreshData
}) => {
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [apiUrlInput, setApiUrlInput] = useState(getCustomApiUrl());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const isLocal = isUsingLocalStorage();

  const handleSaveApiUrl = () => {
    setCustomApiUrl(apiUrlInput);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowApiSettings(false);
      if (onRefreshData) onRefreshData();
    }, 1200);
  };

  const handleResetToLocal = () => {
    setCustomApiUrl('');
    setApiUrlInput('');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowApiSettings(false);
      if (onRefreshData) onRefreshData();
    }, 1200);
  };

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
          <button className="icon-btn" onClick={onClose} aria-label="Close Menu">
            <X size={20} />
          </button>
        </div>

        {/* Storage Mode Badge */}
        <div className="storage-status-banner">
          <div className="storage-status-left">
            {isLocal ? (
              <Database size={15} color="var(--accent-forest)" />
            ) : (
              <Cloud size={15} color="#0284c7" />
            )}
            <div>
              <span className="storage-mode-title">
                {isLocal ? 'Browser Storage Mode' : 'Cloud Backend Connected'}
              </span>
              <span className="storage-mode-subtitle">
                {isLocal ? 'Offline & GitHub Pages persistent' : 'Syncing with cloud API'}
              </span>
            </div>
          </div>
          <button
            className="storage-config-btn"
            onClick={() => setShowApiSettings(!showApiSettings)}
          >
            {showApiSettings ? 'Close' : 'Configure'}
          </button>
        </div>

        {/* API Settings Section */}
        {showApiSettings && (
          <div className="api-config-card animate-fade">
            <label className="api-config-label">Custom Backend API URL (Optional)</label>
            <p className="api-config-hint">
              On GitHub Pages, records save directly in your browser. If you host the Flask backend on Render or Railway, paste your API URL below:
            </p>
            <input
              type="text"
              placeholder="e.g. https://my-expense-backend.onrender.com/api"
              value={apiUrlInput}
              onChange={(e) => setApiUrlInput(e.target.value)}
              className="api-config-input"
            />
            <div className="api-config-actions">
              <button
                className="btn-api-save"
                onClick={handleSaveApiUrl}
                disabled={savedSuccess}
              >
                {savedSuccess ? <Check size={14} /> : null}
                <span>{savedSuccess ? 'Saved!' : 'Save & Connect'}</span>
              </button>
              {apiUrlInput && (
                <button className="btn-api-reset" onClick={handleResetToLocal}>
                  <RotateCcw size={13} />
                  <span>Use Local Storage</span>
                </button>
              )}
            </div>
          </div>
        )}

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
            <button
              onClick={() => {
                triggerExportCsv();
                onClose();
              }}
              className="export-link-btn"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => {
                triggerExportExcel();
                onClose();
              }}
              className="export-link-btn"
            >
              <FileSpreadsheet size={14} />
              <span>Export Excel</span>
            </button>
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
          max-height: 90vh;
          overflow-y: auto;
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
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

        .storage-status-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-subtle);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 10px 12px;
          margin-bottom: 14px;
        }

        .storage-status-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .storage-mode-title {
          display: block;
          font-size: 12.5px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .storage-mode-subtitle {
          display: block;
          font-size: 11px;
          color: var(--text-secondary);
        }

        .storage-config-btn {
          background: none;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          color: var(--accent-forest);
          cursor: pointer;
        }

        .api-config-card {
          background: var(--bg-subtle);
          border: 1px solid var(--accent-forest);
          border-radius: var(--radius-md);
          padding: 12px;
          margin-bottom: 14px;
        }

        .api-config-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
          display: block;
          margin-bottom: 4px;
        }

        .api-config-hint {
          font-size: 11px;
          color: var(--text-secondary);
          margin-bottom: 10px;
          line-height: 1.4;
        }

        .api-config-input {
          width: 100%;
          padding: 8px 10px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: var(--bg-surface);
          color: var(--text-primary);
          font-size: 12px;
          margin-bottom: 10px;
        }

        .api-config-actions {
          display: flex;
          gap: 8px;
        }

        .btn-api-save {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--accent-forest);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          padding: 7px 12px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-api-reset {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 7px 10px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
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
          cursor: pointer;
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
          cursor: pointer;
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
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
