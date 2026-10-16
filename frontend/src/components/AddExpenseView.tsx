import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  X,
  Search,
  CheckCircle2,
  Calendar,
  CreditCard,
  Building2,
  Mic,
  Camera,
  Car,
  Train,
  Bus,
  Fuel,
  Utensils,
  Salad,
  ShoppingBag,
  Tv,
  Flame,
  Zap,
  HeartPulse,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check
} from 'lucide-react';
import { Category, Subcategory } from '../types';
import { autoCategorize, createTransaction } from '../services/api';

interface AddExpenseViewProps {
  categories: Category[];
  initialMerchant?: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const AddExpenseView: React.FC<AddExpenseViewProps> = ({
  categories,
  initialMerchant = '',
  onBack,
  onSuccess
}) => {
  const [txType, setTxType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [merchant, setMerchant] = useState<string>(initialMerchant || '');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [accountName, setAccountName] = useState<string>('Bank of Baroda');
  const [notes, setNotes] = useState<string>('');
  
  // Date & Time State + Calendar Picker
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [tempDate, setTempDate] = useState<Date>(() => new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<number>(() => new Date().getMonth());
  const [viewYear, setViewYear] = useState<number>(() => new Date().getFullYear());
  const nativeDateInputRef = useRef<HTMLInputElement>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Year range from 2020 to 2035 for easy dropdown selection
  const yearOptions = Array.from({ length: 16 }, (_, i) => 2020 + i);

  const formatDateDisplay = (d: Date) => {
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTimeDisplay = (d: Date) => {
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateToInput = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const formatTimeToInput = (d: Date) => {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  };

  const openCalendar = () => {
    setTempDate(new Date(selectedDate));
    setViewMonth(selectedDate.getMonth());
    setViewYear(selectedDate.getFullYear());
    setIsCalendarOpen(true);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const next = new Date(tempDate);
    next.setFullYear(viewYear);
    next.setMonth(viewMonth);
    next.setDate(day);
    setTempDate(next);
  };

  const handleSelectToday = () => {
    const today = new Date();
    setTempDate(today);
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
  };

  const handleSelectYesterday = () => {
    const yest = getYesterday();
    setTempDate(yest);
    setViewMonth(yest.getMonth());
    setViewYear(yest.getFullYear());
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parts = e.target.value.split(':');
    if (parts.length === 2) {
      const next = new Date(tempDate);
      next.setHours(parseInt(parts[0], 10));
      next.setMinutes(parseInt(parts[1], 10));
      setTempDate(next);
    }
  };

  const handleConfirmDate = () => {
    setSelectedDate(new Date(tempDate));
    setIsCalendarOpen(false);
  };

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [y, m, d] = e.target.value.split('-').map(Number);
      const next = new Date(selectedDate);
      next.setFullYear(y);
      next.setMonth(m - 1);
      next.setDate(d);
      setSelectedDate(next);
      setTempDate(next);
      setViewMonth(m - 1);
      setViewYear(y);
    }
  };

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  
  // Auto-category state (empty until merchant is typed)
  const [autoResult, setAutoResult] = useState<{
    detected: boolean;
    categoryId: number | null;
    subcategoryId: number | null;
    displayPath: string | null;
    reason: string | null;
  }>({
    detected: false,
    categoryId: null,
    subcategoryId: null,
    displayPath: null,
    reason: null
  });

  const [selectedQuickCat, setSelectedQuickCat] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick categories matching the screenshot grid exactly
  const quickCategories = [
    { label: 'Cab', icon: Car, cat: 'Transportation', sub: 'Cab / Taxi' },
    { label: 'Metro', icon: Train, cat: 'Transportation', sub: 'Metro' },
    { label: 'Bus', icon: Bus, cat: 'Transportation', sub: 'Bus' },
    { label: 'Fuel', icon: Fuel, cat: 'Transportation', sub: 'Fuel / Gas' },
    { label: 'Food', icon: Utensils, cat: 'Food & Groceries', sub: 'Restaurants and Dining' },
    { label: 'Vegetables', icon: Salad, cat: 'Food & Groceries', sub: 'Vegetables' },
    { label: 'Shopping', icon: ShoppingBag, cat: 'Shopping', sub: 'Online Shopping' },
    { label: 'Home Appliances', icon: Tv, cat: 'Shopping', sub: 'Home Appliances' },
    { label: 'Gas', icon: Flame, cat: 'Home & Living', sub: 'Gas Cylinder / Cooking Gas' },
    { label: 'Bills', icon: Zap, cat: 'Home & Living', sub: 'Electricity Bill' },
    { label: 'Health', icon: HeartPulse, cat: 'Health & Fitness', sub: 'Medicines' },
    { label: 'Others', icon: MoreHorizontal, cat: 'Others', sub: 'General Miscellaneous' }
  ];

  // Debounced real-time auto-categorization as user types
  useEffect(() => {
    if (!merchant.trim()) {
      setAutoResult({
        detected: false,
        categoryId: null,
        subcategoryId: null,
        displayPath: null,
        reason: null
      });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await autoCategorize(merchant);
        if (res.detected) {
          setAutoResult({
            detected: true,
            categoryId: res.category_id,
            subcategoryId: res.subcategory_id,
            displayPath: res.display_path || `${res.category_name} > ${res.subcategory_name}`,
            reason: res.reason
          });

          // Highlight quick category button if matching
          const matchQuick = quickCategories.find(q =>
            (res.subcategory_name && res.subcategory_name.toLowerCase().includes(q.label.toLowerCase())) ||
            (res.category_name && res.category_name.toLowerCase().includes(q.label.toLowerCase()))
          );
          if (matchQuick) {
            setSelectedQuickCat(matchQuick.label);
          }
        } else {
          setAutoResult({
            detected: false,
            categoryId: null,
            subcategoryId: null,
            displayPath: null,
            reason: null
          });
        }
      } catch (err) {
        console.error("Auto categorize error:", err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [merchant]);

  // Voice Expense Entry simulation / Web Speech API
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      // Fallback voice demo
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        setMerchant('Swiggy Lunch 350');
        setAmount('350');
        setToastMessage('Voice captured: "Swiggy Lunch 350"');
        setTimeout(() => setToastMessage(null), 3000);
      }, 1500);
      return;
    }

    try {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        
        // Extract numbers
        const numMatch = transcript.match(/\d+(\.\d+)?/);
        if (numMatch) {
          setAmount(numMatch[0]);
        }
        
        // Clean merchant
        const cleanWords = transcript
          .replace(/spent|rupees|rupee|rs|for|on/gi, '')
          .trim();
        setMerchant(cleanWords || transcript);
        setToastMessage(`Voice recognized: "${transcript}"`);
        setTimeout(() => setToastMessage(null), 3000);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  // Receipt image mock / upload
  const handleReceiptScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setToastMessage('Receipt scanned! Parsed ₹ 420 at Star Hypermarket');
      setMerchant('Star Hypermarket Grocery');
      setAmount('420');
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleSelectQuickCategory = (item: typeof quickCategories[0]) => {
    setSelectedQuickCat(item.label);
    const catObj = categories.find(c => c.name.toLowerCase() === item.cat.toLowerCase());
    const subObj = catObj?.subcategories.find(s => s.name.toLowerCase().includes(item.sub.toLowerCase()));
    
    setAutoResult({
      detected: true,
      categoryId: catObj ? catObj.id : null,
      subcategoryId: subObj ? subObj.id : null,
      displayPath: `${item.cat} > ${item.label}`,
      reason: `Manually chosen: ${item.label}`
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!merchant.trim()) {
      alert('Please enter description or merchant name');
      return;
    }

    setIsSubmitting(true);
    try {
      await createTransaction({
        amount: parsedAmount,
        merchant_or_title: merchant.trim(),
        type: txType,
        category_id: autoResult.categoryId,
        subcategory_id: autoResult.subcategoryId,
        payment_method: paymentMethod,
        account_name: accountName,
        transaction_date: selectedDate.toISOString(),
        notes: notes.trim(),
        is_auto_categorized: autoResult.detected,
        auto_detected_reason: autoResult.reason || undefined
      });
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-expense-container animate-fade">
      {/* Top Bar */}
      <header className="page-header">
        <button id="add-back-btn" className="icon-btn" onClick={onBack} aria-label="Go Back">
          <ArrowLeft size={20} color="var(--text-primary)" />
        </button>
        <h2 className="header-title">Add Expense</h2>
        <div style={{ width: 38 }} />
      </header>

      {toastMessage && (
        <div className="toast-banner animate-fade">
          {toastMessage}
        </div>
      )}

      {/* Segmented Type Control */}
      <div className="segmented-control" role="tablist">
        <button
          type="button"
          className={`segment-btn ${txType === 'expense' ? 'active' : ''}`}
          onClick={() => setTxType('expense')}
        >
          Expense
        </button>
        <button
          type="button"
          className={`segment-btn ${txType === 'income' ? 'active' : ''}`}
          onClick={() => setTxType('income')}
        >
          Income
        </button>
        <button
          type="button"
          className={`segment-btn ${txType === 'transfer' ? 'active' : ''}`}
          onClick={() => setTxType('transfer')}
        >
          Transfer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="expense-form">
        {/* Large Amount Field */}
        <div className="amount-input-card">
          <span className="currency-symbol">₹</span>
          <input
            id="expense-amount-input"
            type="number"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="amount-input"
            placeholder="0"
            required
          />
          {amount && (
            <button
              type="button"
              className="clear-btn"
              onClick={() => setAmount('')}
              aria-label="Clear amount"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Merchant / Description Input with Voice & Camera */}
        <div className="input-group search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            id="expense-merchant-input"
            type="text"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            className="search-input"
            placeholder="Merchant or description..."
            required
          />
          <div className="action-buttons-wrap">
            <button
              type="button"
              id="voice-input-btn"
              className={`mic-btn ${isListening ? 'listening' : ''}`}
              onClick={handleVoiceInput}
              title="Voice entry"
            >
              <Mic size={18} />
            </button>
            <label className="camera-btn" title="Scan receipt" htmlFor="receipt-upload">
              <Camera size={18} />
              <input
                id="receipt-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleReceiptScan}
              />
            </label>
          </div>
        </div>

        {/* Real-time Auto-Detected Category Banner */}
        {autoResult.detected && (
          <div className="auto-category-banner animate-fade">
            <div className="auto-cat-left">
              <div className="auto-cat-icon">
                <Car size={20} color="#10B981" />
              </div>
              <div className="auto-cat-text">
                <span className="auto-cat-title">{autoResult.displayPath}</span>
                <span className="auto-cat-subtitle">{autoResult.reason}</span>
              </div>
            </div>
            <div className="auto-cat-check">
              <CheckCircle2 size={18} color="#10B981" />
            </div>
          </div>
        )}

        {/* Quick Category Grid */}
        <div className="quick-category-grid">
          {quickCategories.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = selectedQuickCat.toLowerCase() === item.label.toLowerCase();
            return (
              <button
                type="button"
                key={idx}
                id={`cat-select-${item.label.toLowerCase()}`}
                className={`quick-cat-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectQuickCategory(item)}
              >
                <div className="cat-icon-wrap">
                  <Icon size={19} />
                </div>
                <span className="cat-btn-label">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Date & Time Picker Card */}
        <div 
          className="form-row-card date-picker-card"
          onClick={openCalendar}
          role="button"
          tabIndex={0}
          aria-label="Select date and time"
        >
          <div className="row-left">
            <div className="cal-icon-wrapper">
              <Calendar size={18} className="row-icon" />
            </div>
            <div className="date-info-content">
              <span className="selected-date-title">{formatDateDisplay(selectedDate)}</span>
              <span className="selected-date-sub">{formatTimeDisplay(selectedDate)} · Tap to change day, month, year</span>
            </div>
          </div>
          <div className="row-right-actions">
            <span className="cal-change-badge">Change</span>
            {/* Hidden native input for system picker */}
            <input
              ref={nativeDateInputRef}
              type="date"
              value={formatDateToInput(selectedDate)}
              onChange={handleNativeDateChange}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
              tabIndex={-1}
            />
          </div>
        </div>

        {/* Normal Calendar Popup Modal */}
        {isCalendarOpen && (
          <div className="calendar-modal-backdrop animate-fade" onClick={() => setIsCalendarOpen(false)}>
            <div className="calendar-modal-content animate-scale" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="cal-modal-header">
                <div className="cal-modal-title-wrap">
                  <Calendar size={19} className="cal-header-icon" />
                  <span className="cal-modal-title">Select Date & Year</span>
                </div>
                <button
                  type="button"
                  className="cal-close-btn"
                  onClick={() => setIsCalendarOpen(false)}
                  aria-label="Close Calendar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="cal-presets-row">
                <button
                  type="button"
                  className={`cal-preset-pill ${isSameDay(tempDate, new Date()) ? 'active' : ''}`}
                  onClick={handleSelectToday}
                >
                  Today
                </button>
                <button
                  type="button"
                  className={`cal-preset-pill ${isSameDay(tempDate, getYesterday()) ? 'active' : ''}`}
                  onClick={handleSelectYesterday}
                >
                  Yesterday
                </button>
                <button
                  type="button"
                  className="cal-preset-pill cal-system-picker-pill"
                  onClick={() => nativeDateInputRef.current?.showPicker?.()}
                  title="Open system calendar"
                >
                  📅 Device Picker
                </button>
              </div>

              {/* Month & Year Selectors with Next/Prev Controls */}
              <div className="cal-navigation-bar">
                <button
                  type="button"
                  className="cal-nav-btn"
                  onClick={handlePrevMonth}
                  aria-label="Previous Month"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="cal-selects-container">
                  {/* Month Dropdown */}
                  <select
                    className="cal-header-select cal-select-month"
                    value={viewMonth}
                    onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                  >
                    {monthNames.map((m, idx) => (
                      <option key={m} value={idx}>{m}</option>
                    ))}
                  </select>

                  {/* Year Dropdown - selects year easily */}
                  <select
                    className="cal-header-select cal-select-year"
                    value={viewYear}
                    onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="cal-nav-btn"
                  onClick={handleNextMonth}
                  aria-label="Next Month"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Day-of-week header */}
              <div className="cal-weekdays-row">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="cal-weekday-cell">{d}</div>
                ))}
              </div>

              {/* Day cells grid */}
              <div className="cal-days-grid">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="cal-day-cell cal-cell-empty" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const isSelected =
                    tempDate.getDate() === dayNum &&
                    tempDate.getMonth() === viewMonth &&
                    tempDate.getFullYear() === viewYear;
                  const isToday =
                    new Date().getDate() === dayNum &&
                    new Date().getMonth() === viewMonth &&
                    new Date().getFullYear() === viewYear;

                  return (
                    <button
                      type="button"
                      key={dayNum}
                      className={`cal-day-cell cal-day-btn ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                      onClick={() => handleSelectDay(dayNum)}
                    >
                      <span className="cal-day-number">{dayNum}</span>
                      {isToday && !isSelected && <span className="cal-today-indicator" />}
                    </button>
                  );
                })}
              </div>

              {/* Time Selection */}
              <div className="cal-time-picker-bar">
                <div className="cal-time-label">
                  <Clock size={16} />
                  <span>Time</span>
                </div>
                <input
                  type="time"
                  className="cal-time-input"
                  value={formatTimeToInput(tempDate)}
                  onChange={handleTimeChange}
                />
              </div>

              {/* Action Buttons */}
              <div className="cal-actions-footer">
                <button
                  type="button"
                  className="cal-btn-cancel"
                  onClick={() => setIsCalendarOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="cal-btn-confirm"
                  onClick={handleConfirmDate}
                >
                  <Check size={16} />
                  <span>Set Date</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method Selector */}
        <div className="form-row-card">
          <div className="row-left">
            <CreditCard size={18} className="row-icon" />
            <select
              id="payment-method-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="row-select"
            >
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <span className="chevron">&gt;</span>
        </div>

        {/* Account / Wallet Selector */}
        <div className="form-row-card">
          <div className="row-left">
            <Building2 size={18} className="row-icon" />
            <select
              id="account-name-select"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="row-select"
            >
              <option value="Bank of Baroda">Bank of Baroda</option>
              <option value="Canara Bank">Canara Bank</option>
              <option value="Cash">Cash Wallet</option>
              <option value="Bank Account">Bank Account</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Default Account">Default Account</option>
            </select>
          </div>
          <span className="chevron">&gt;</span>
        </div>

        {/* Notes (Optional) */}
        <div className="notes-group">
          <label className="notes-label">Notes (optional)</label>
          <textarea
            id="expense-notes-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add a note..."
            rows={2}
            className="notes-textarea"
          />
        </div>

        {/* Save Expense CTA Button */}
        <button
          type="submit"
          id="save-expense-btn"
          disabled={isSubmitting}
          className="save-expense-btn"
        >
          {isSubmitting ? 'Saving...' : 'Save Expense'}
        </button>
      </form>

      <style>{`
        .add-expense-container {
          padding: 18px 18px 24px;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          overflow-x: hidden;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .expense-form {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          width: 100%;
          box-sizing: border-box;
        }

        .toast-banner {
          background: #E8F5E9;
          color: #10B981;
          border: 1px solid #C8E6C9;
          border-radius: var(--radius-md);
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 14px;
          text-align: center;
          width: 100%;
          box-sizing: border-box;
        }

        /* Segmented Control */
        .segmented-control {
          display: flex;
          background: #EAE6DC;
          padding: 4px;
          border-radius: var(--radius-full);
          margin-bottom: 20px;
          width: 100%;
          box-sizing: border-box;
        }

        .segment-btn {
          flex: 1;
          padding: 8px 10px;
          border-radius: var(--radius-full);
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: center;
        }

        .segment-btn.active {
          background: var(--accent-forest);
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(30, 62, 50, 0.25);
        }

        /* Amount Input Card */
        .amount-input-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 14px;
          width: 100%;
          box-sizing: border-box;
        }

        .currency-symbol {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          flex-shrink: 0;
        }

        .amount-input {
          flex: 1;
          min-width: 0;
          font-size: 32px;
          font-weight: 800;
          border: none;
          background: transparent;
          color: var(--text-primary);
          padding: 0;
          width: 100%;
          box-sizing: border-box;
        }

        .amount-input:focus {
          box-shadow: none;
          border: none;
        }

        .clear-btn {
          width: 26px;
          height: 26px;
          border-radius: var(--radius-full);
          background: var(--bg-subtle);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Search input wrap */
        .search-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 12px 14px;
          margin-bottom: 14px;
          box-shadow: var(--shadow-sm);
          width: 100%;
          box-sizing: border-box;
        }

        .search-icon {
          color: var(--text-secondary);
          margin-right: 10px;
          flex-shrink: 0;
        }

        .search-input {
          flex: 1;
          min-width: 0;
          border: none;
          background: transparent;
          font-size: 15px;
          font-weight: 600;
          width: 100%;
          box-sizing: border-box;
        }

        .search-input:focus {
          box-shadow: none;
        }

        .action-buttons-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .mic-btn, .camera-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          background: var(--bg-subtle);
          cursor: pointer;
        }

        .mic-btn.listening {
          background: #FEE2E2;
          color: #DC2626;
          animation: pulse 1s infinite;
        }

        /* Auto Category Banner */
        .auto-category-banner {
          background: #E8F5E9;
          border: 1px solid #C8E6C9;
          border-radius: var(--radius-lg);
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          width: 100%;
          box-sizing: border-box;
        }

        .auto-cat-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex: 1;
        }

        .auto-cat-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .auto-cat-text {
          min-width: 0;
          flex: 1;
        }

        .auto-cat-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #1E3E32;
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .auto-cat-subtitle {
          font-size: 11px;
          color: #2E7D32;
          display: block;
          margin-top: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .auto-cat-check {
          flex-shrink: 0;
          margin-left: 8px;
        }

        /* Quick Category Grid */
        .quick-category-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 18px;
          width: 100%;
          box-sizing: border-box;
        }

        .quick-cat-btn {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 10px 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          transition: var(--transition);
          width: 100%;
          box-sizing: border-box;
          min-width: 0;
        }

        .quick-cat-btn.selected {
          border: 1.5px solid var(--accent-forest);
          background: var(--accent-forest-light);
        }

        .cat-icon-wrap {
          color: var(--accent-forest);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cat-btn-label {
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-primary);
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
          padding: 0 2px;
          box-sizing: border-box;
        }

        /* Form Row Cards */
        .form-row-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 13px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          box-shadow: var(--shadow-sm);
          width: 100%;
          box-sizing: border-box;
        }

        .row-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }

        .row-icon {
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .row-text-input {
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .row-select {
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          cursor: pointer;
        }

        .chevron {
          color: var(--text-muted);
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
          margin-left: 6px;
        }

        /* Notes */
        .notes-group {
          margin-bottom: 22px;
          width: 100%;
          box-sizing: border-box;
        }

        .notes-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 6px;
          display: block;
        }

        .notes-textarea {
          width: 100%;
          border-radius: var(--radius-lg);
          padding: 12px 14px;
          font-size: 13px;
          resize: none;
          box-sizing: border-box;
        }

        /* Save Button */
        .save-expense-btn {
          width: 100%;
          background: var(--accent-forest);
          color: #FFFFFF;
          padding: 14px;
          border-radius: var(--radius-lg);
          font-size: 15px;
          font-weight: 700;
          box-shadow: 0 4px 14px rgba(30, 62, 50, 0.3);
          transition: var(--transition);
          box-sizing: border-box;
        }

        .save-expense-btn:hover {
          background: var(--accent-forest-hover);
          transform: translateY(-1px);
        }

        /* Date Picker Row Card */
        .date-picker-card {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .date-picker-card:hover {
          border-color: var(--accent-forest);
          transform: translateY(-1px);
        }

        .cal-icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #E8F5E9;
          color: #10B981;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .date-info-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .selected-date-title {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .selected-date-sub {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
        }

        .row-right-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .cal-change-badge {
          font-size: 11px;
          font-weight: 700;
          background: #F1F5F9;
          color: var(--text-secondary);
          padding: 4px 10px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        /* Calendar Modal Backdrop & Container */
        .calendar-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          box-sizing: border-box;
        }

        .calendar-modal-content {
          background: var(--bg-surface);
          border-radius: 20px;
          width: 100%;
          max-width: 360px;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-color);
          padding: 18px 20px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .cal-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border-color);
        }

        .cal-modal-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cal-header-icon {
          color: var(--accent-forest);
        }

        .cal-modal-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .cal-close-btn {
          background: #F3F4F6;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
          transition: background 0.15s;
        }

        .cal-close-btn:hover {
          background: #E5E7EB;
        }

        /* Presets */
        .cal-presets-row {
          display: flex;
          gap: 8px;
        }

        .cal-preset-pill {
          flex: 1;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: var(--bg-surface);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s;
          text-align: center;
        }

        .cal-preset-pill:hover {
          border-color: var(--accent-forest);
          color: var(--text-primary);
        }

        .cal-preset-pill.active {
          background: var(--accent-forest);
          color: #FFFFFF;
          border-color: var(--accent-forest);
        }

        .cal-system-picker-pill {
          background: #F8FAFC;
        }

        /* Navigation Bar */
        .cal-navigation-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .cal-nav-btn {
          background: #F3F4F6;
          border: 1px solid var(--border-color);
          border-radius: 10px;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
        }

        .cal-nav-btn:hover {
          background: #E5E7EB;
        }

        .cal-selects-container {
          display: flex;
          gap: 8px;
          flex: 1;
        }

        .cal-header-select {
          padding: 6px 10px;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: var(--bg-surface);
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          cursor: pointer;
          outline: none;
        }

        .cal-select-month {
          flex: 3;
        }

        .cal-select-year {
          flex: 2;
        }

        /* Weekdays */
        .cal-weekdays-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
        }

        .cal-weekday-cell {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          padding: 4px 0;
        }

        /* Days Grid */
        .cal-days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }

        .cal-day-cell {
          height: 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: 1px solid transparent;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
          position: relative;
          transition: all 0.15s;
          padding: 0;
        }

        .cal-cell-empty {
          cursor: default;
        }

        .cal-day-btn:hover {
          background: #F3F4F6;
        }

        .cal-day-btn.today {
          border-color: #10B981;
          color: #047857;
          font-weight: 700;
        }

        .cal-today-indicator {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #10B981;
          position: absolute;
          bottom: 3px;
        }

        .cal-day-btn.selected {
          background: var(--accent-forest) !important;
          color: #FFFFFF !important;
          font-weight: 700;
          box-shadow: 0 4px 10px rgba(30, 62, 50, 0.3);
        }

        /* Time Picker */
        .cal-time-picker-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: #F8FAFC;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .cal-time-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .cal-time-input {
          border: 1px solid var(--border-color);
          background: #FFFFFF;
          border-radius: 8px;
          padding: 4px 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          outline: none;
        }

        /* Footer Actions */
        .cal-actions-footer {
          display: flex;
          gap: 10px;
          padding-top: 6px;
        }

        .cal-btn-cancel {
          flex: 1;
          padding: 10px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-surface);
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: background 0.15s;
        }

        .cal-btn-cancel:hover {
          background: #F3F4F6;
        }

        .cal-btn-confirm {
          flex: 1.5;
          padding: 10px;
          border-radius: 12px;
          border: none;
          background: var(--accent-forest);
          color: #FFFFFF;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: background 0.15s;
          box-shadow: 0 3px 10px rgba(30, 62, 50, 0.25);
        }

        .cal-btn-confirm:hover {
          background: var(--accent-forest-hover);
        }
      `}</style>

    </div>
  );
};
