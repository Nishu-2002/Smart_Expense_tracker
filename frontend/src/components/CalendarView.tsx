import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarData, Transaction } from '../types';

interface CalendarViewProps {
  calendarData: CalendarData | null;
  allTransactions: Transaction[];
  onBack: () => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  calendarData,
  allTransactions,
  onBack,
  onSelectTransaction
}) => {
  const now = new Date();
  const [selectedDay, setSelectedDay] = useState<number>(now.getDate());
  const [currentMonth, setCurrentMonth] = useState<number>(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState<number>(now.getFullYear());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Generate days in month
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 is Sun
  const totalDays = new Date(currentYear, currentMonth, 0).getDate();

  // Purely database-driven indicators
  const getDotLevel = (day: number): 'low' | 'medium' | 'high' | null => {
    if (calendarData?.days && calendarData.days[day]) {
      return calendarData.days[day].level;
    }
    return null;
  };

  // Filter transactions for selected day
  const dayTransactions = allTransactions.filter((tx) => {
    const d = new Date(tx.transaction_date);
    return d.getDate() === selectedDay;
  });

  const dayTotal = dayTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="calendar-container animate-fade">
      {/* Header */}
      <header className="page-header">
        <button id="calendar-back-btn" className="icon-btn" onClick={onBack} aria-label="Go Back">
          <ArrowLeft size={20} color="var(--text-primary)" />
        </button>
        <div className="month-picker">
          <button className="nav-arrow" onClick={handlePrevMonth}>
            <ChevronLeft size={18} />
          </button>
          <h2 className="month-title">{monthNames[currentMonth - 1]} {currentYear}</h2>
          <button className="nav-arrow" onClick={handleNextMonth}>
            <ChevronRight size={18} />
          </button>
        </div>
        <div style={{ width: 38 }} />
      </header>

      {/* Calendar Card */}
      <div className="calendar-card">
        {/* Days of week */}
        <div className="weekdays-row">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
            <span key={i} className="weekday-col">{d}</span>
          ))}
        </div>

        {/* Days grid */}
        <div className="days-grid">
          {/* Empty padding slots before 1st of month */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="day-cell empty" />
          ))}

          {/* Actual days */}
          {Array.from({ length: totalDays }).map((_, i) => {
            const dayNum = i + 1;
            const isSelected = selectedDay === dayNum;
            const level = getDotLevel(dayNum);

            return (
              <div
                key={dayNum}
                id={`calendar-day-${dayNum}`}
                className={`day-cell ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDay(dayNum)}
              >
                <span className="day-num">{dayNum}</span>
                {level && (
                  <span className={`day-dot ${level}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend matching screenshot */}
        <div className="calendar-legend">
          <div className="legend-entry">
            <span className="legend-dot low" />
            <span>Low Spending</span>
          </div>
          <div className="legend-entry">
            <span className="legend-dot medium" />
            <span>Medium</span>
          </div>
          <div className="legend-entry">
            <span className="legend-dot high" />
            <span>High</span>
          </div>
        </div>
      </div>

      {/* Selected Day Spending Details */}
      <div className="selected-day-details">
        <div className="day-detail-head">
          <h3 className="detail-title">{selectedDay} {monthNames[currentMonth - 1]}</h3>
          <span className="detail-total">
            Total Spent: ₹ {dayTotal.toLocaleString('en-IN')}
          </span>
        </div>

        {dayTransactions.length === 0 ? (
          <div className="no-day-tx">No recorded transactions for this date.</div>
        ) : (
          <div className="day-tx-list">
            {dayTransactions.map((tx) => (
              <div
                key={tx.id}
                className="day-tx-item"
                onClick={() => onSelectTransaction(tx)}
              >
                <div className="tx-meta-info">
                  <span className="tx-merchant-name">{tx.merchant_or_title}</span>
                  <span className="tx-sub-label">{tx.subtitle || tx.category_name}</span>
                </div>
                <span className="tx-val-expense">- ₹ {tx.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .calendar-container {
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

        .month-picker {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-arrow {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
        }

        .month-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .calendar-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 20px 16px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 20px;
        }

        .weekdays-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          margin-bottom: 12px;
        }

        .weekday-col {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px 4px;
        }

        .day-cell {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: var(--transition);
        }

        .day-num {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .day-cell.selected {
          background: var(--accent-forest);
        }

        .day-cell.selected .day-num {
          color: #FFFFFF;
          font-weight: 800;
        }

        .day-dot {
          width: 5px;
          height: 5px;
          border-radius: var(--radius-full);
          position: absolute;
          bottom: 4px;
        }

        .day-dot.low {
          background: #10B981;
        }

        .day-dot.medium {
          background: #F59E0B;
        }

        .day-dot.high {
          background: #EF4444;
        }

        .calendar-legend {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          margin-top: 20px;
          padding-top: 14px;
          border-top: 1px dashed var(--border-color);
        }

        .legend-entry {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .legend-dot {
          width: 7px;
          height: 7px;
          border-radius: var(--radius-full);
        }

        .legend-dot.low {
          background: #10B981;
        }
        .legend-dot.medium {
          background: #F59E0B;
        }
        .legend-dot.high {
          background: #EF4444;
        }

        /* Day Details */
        .selected-day-details {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 18px 20px;
        }

        .day-detail-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .detail-title {
          font-size: 14px;
          font-weight: 700;
        }

        .detail-total {
          font-size: 13px;
          font-weight: 700;
          color: var(--accent-forest);
        }

        .no-day-tx {
          font-size: 13px;
          color: var(--text-muted);
          padding: 10px 0;
        }

        .day-tx-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .day-tx-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 10px;
          background: var(--bg-subtle);
          border-radius: var(--radius-md);
          cursor: pointer;
        }

        .tx-merchant-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          display: block;
        }

        .tx-sub-label {
          font-size: 11px;
          color: var(--text-muted);
          display: block;
        }

        .tx-val-expense {
          font-size: 13.5px;
          font-weight: 700;
          color: #DC2626;
        }
      `}</style>
    </div>
  );
};
