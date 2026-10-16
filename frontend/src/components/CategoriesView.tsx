import React, { useState } from 'react';
import { ArrowLeft, Plus, ChevronRight, X, Check } from 'lucide-react';
import { Category } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { createCategory } from '../services/api';

interface CategoriesViewProps {
  categories: Category[];
  onBack: () => void;
  onRefresh: () => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  onBack,
  onRefresh
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('tag');
  const [newCatColor, setNewCatColor] = useState('#10B981');
  const [newSubcategories, setNewSubcategories] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsSubmitting(true);
    try {
      const subs = newSubcategories.split(',').map(s => s.trim()).filter(Boolean);
      await createCategory({
        name: newCatName.trim(),
        icon: newCatIcon,
        color: newCatColor,
        bg_color: `${newCatColor}20`,
        subcategories: subs
      });
      setShowAddModal(false);
      setNewCatName('');
      setNewSubcategories('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="categories-container animate-fade">
      {/* Header */}
      <header className="page-header">
        <button id="categories-back-btn" className="icon-btn" onClick={onBack} aria-label="Go Back">
          <ArrowLeft size={20} color="var(--text-primary)" />
        </button>
        <h2 className="header-title">Categories</h2>
        <button id="add-category-btn" className="add-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>Add</span>
        </button>
      </header>

      {/* Category List */}
      <div className="categories-list">
        {categories.length === 0 ? (
          <div className="empty-category-box">
            <p>No categories created yet.</p>
            <span>Click "+ Add" in the top right to create your first category.</span>
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              id={`cat-card-${cat.id}`}
              className="category-card"
              onClick={() => setSelectedCategory(selectedCategory?.id === cat.id ? null : cat)}
            >
            <div className="cat-card-main">
              <div
                className="cat-icon-badge"
                style={{ backgroundColor: cat.bg_color || '#E8F5E9', color: cat.color || '#10B981' }}
              >
                <CategoryIcon name={cat.icon || cat.name} size={20} />
              </div>

              <div className="cat-info">
                <h3 className="cat-title">{cat.name}</h3>
                <span className="cat-sub-preview">
                  {cat.subcategories_summary || cat.subcategories.map(s => s.name).slice(0, 3).join(', ') + '...'}
                </span>
              </div>

              <ChevronRight
                size={18}
                className={`cat-chevron ${selectedCategory?.id === cat.id ? 'rotated' : ''}`}
              />
            </div>

            {/* Subcategories Expanded View */}
            {selectedCategory?.id === cat.id && (
              <div className="subcategories-expand animate-fade">
                <span className="subs-label">Subcategories ({cat.subcategories.length}):</span>
                <div className="subs-pills">
                  {cat.subcategories.map((sub) => (
                    <span key={sub.id} className="sub-pill">
                      {sub.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>

      {/* Add Custom Category Modal */}
      {showAddModal && (
        <div className="modal-overlay animate-fade">
          <div className="modal-card">
            <div className="modal-head">
              <h3>Add Custom Category</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCategory}>
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pet Care, Gadgets"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Subcategories (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Food, Vet, Grooming, Toys"
                  value={newSubcategories}
                  onChange={(e) => setNewSubcategories(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Color Accent</label>
                <div className="color-swatches">
                  {['#10B981', '#F97316', '#F59E0B', '#0D9488', '#EF4444', '#8B5CF6', '#6366F1'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-swatch ${newCatColor === c ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setNewCatColor(c)}
                    >
                      {newCatColor === c && <Check size={14} color="#FFF" />}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="modal-submit-btn">
                {isSubmitting ? 'Creating...' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .categories-container {
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

        .add-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: var(--accent-forest-light);
          color: var(--accent-forest);
          font-weight: 700;
          font-size: 13px;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          transition: var(--transition);
        }

        .add-btn:hover {
          background: var(--accent-forest);
          color: #FFFFFF;
        }

        .categories-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .empty-category-box {
          text-align: center;
          padding: 42px 20px;
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          border: 1px dashed var(--border-color);
        }

        .empty-category-box p {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .empty-category-box span {
          font-size: 13px;
          color: var(--text-muted);
        }

        .category-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 14px 18px;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }

        .category-card:hover {
          border-color: var(--accent-forest);
        }

        .cat-card-main {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .cat-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cat-info {
          flex: 1;
          min-width: 0;
        }

        .cat-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .cat-sub-preview {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 2px;
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cat-chevron {
          color: var(--text-muted);
          transition: transform 0.2s ease;
        }

        .cat-chevron.rotated {
          transform: rotate(90deg);
        }

        .subcategories-expand {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px dashed var(--border-color);
        }

        .subs-label {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--text-secondary);
          display: block;
          margin-bottom: 8px;
        }

        .subs-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .sub-pill {
          background: var(--bg-subtle);
          color: var(--text-primary);
          font-size: 11.5px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: var(--radius-full);
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

        .form-group input {
          width: 100%;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          font-size: 14px;
        }

        .color-swatches {
          display: flex;
          gap: 10px;
        }

        .color-swatch {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
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
      `}</style>
    </div>
  );
};
