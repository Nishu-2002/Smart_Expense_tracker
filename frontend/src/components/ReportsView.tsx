import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  TrendingDown,
  BarChart2,
  Lightbulb
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { ReportsData } from '../types';

interface ReportsViewProps {
  data: ReportsData | null;
  onBack: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ data, onBack }) => {
  const [period, setPeriod] = useState<string>('This Month');
  const [trendPeriod, setTrendPeriod] = useState<string>('This Week');

  const formatRupee = (val?: number) => {
    if (val === undefined || isNaN(val)) return '₹ 0';
    return `₹ ${Math.round(val).toLocaleString('en-IN')}`;
  };

  const totalExp = data?.total_expenses || 0;
  const pieData = data?.category_spending || [];
  const trendData = data?.daily_trend || [];
  const hasTrend = trendData.some((d) => d.amount > 0);

  return (
    <div className="reports-container animate-fade">
      {/* Header */}
      <header className="page-header">
        <button id="reports-back-btn" className="icon-btn" onClick={onBack} aria-label="Go Back">
          <ArrowLeft size={20} color="var(--text-primary)" />
        </button>
        <h2 className="header-title">Reports</h2>
        <div className="dropdown-pill">
          <span>{period}</span>
          <ChevronDown size={14} />
        </div>
      </header>

      {/* Total Expenses Card */}
      <div className="total-expenses-card">
        <div className="total-exp-info">
          <span className="total-exp-label">Total Expenses</span>
          <div className="total-exp-amount">{formatRupee(totalExp)}</div>
          <div className="total-exp-trend">
            <TrendingDown size={14} color="#10B981" />
            <span>Based on current period</span>
          </div>
        </div>
        <div className="chart-icon-box">
          <BarChart2 size={24} color="#10B981" />
        </div>
      </div>

      {/* Category-wise Spending Section */}
      <section className="report-section">
        <h3 className="section-title">Category-wise Spending</h3>

        {pieData.length === 0 ? (
          <div className="empty-chart-box">
            <p>No category expenses recorded yet.</p>
            <span>Add expenses to view category distribution.</span>
          </div>
        ) : (
          <div className="doughnut-container">
            <div className="doughnut-chart-wrapper">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center Donut Label */}
              <div className="donut-center-label">
                <span className="donut-amount">{formatRupee(totalExp)}</span>
                <span className="donut-sub">{period}</span>
              </div>
            </div>

            {/* Legend Grid */}
            <div className="category-legend">
              {pieData.map((cat, idx) => (
                <div key={idx} className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: cat.color }} />
                  <span className="legend-name">{cat.name}</span>
                  <span className="legend-pct">{cat.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Daily Expense Trend Section */}
      <section className="report-section">
        <div className="section-head-row">
          <h3 className="section-title">Daily Expense Trend</h3>
          <div className="dropdown-pill small">
            <span>{trendPeriod}</span>
            <ChevronDown size={12} />
          </div>
        </div>

        {!hasTrend ? (
          <div className="empty-chart-box">
            <p>No expense trend data yet.</p>
            <span>Daily spending activity will be charted here.</span>
          </div>
        ) : (
          <div className="line-chart-card">
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="var(--text-muted)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val >= 1000 ? (val / 1000).toFixed(0) + 'K' : val}`}
                />
                <Tooltip
                  formatter={(value: any) => [`₹ ${Number(value).toLocaleString('en-IN')}`, 'Spent']}
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#1E3E32"
                  strokeWidth={2.2}
                  dot={{ r: 3, fill: '#10B981', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  fillOpacity={1}
                  fill="url(#colorTrend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>


      {/* Smart Insight Banner */}
      <div className="insight-card">
        <div className="insight-icon-box">
          <Lightbulb size={20} color="#10B981" />
        </div>
        <div className="insight-content">
          <span className="insight-label">Insight</span>
          <p className="insight-text">
            {data?.insight || 'Your food expenses increased by 15% compared to last week.'}
          </p>
        </div>
      </div>

      <style>{`
        .reports-container {
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

        .dropdown-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          padding: 6px 12px;
          border-radius: var(--radius-full);
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .dropdown-pill.small {
          padding: 4px 10px;
          font-size: 11.5px;
        }

        /* Total Expenses Card */
        .total-expenses-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 20px 22px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
          box-shadow: var(--shadow-card);
        }

        .total-exp-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .total-exp-amount {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 4px 0 6px;
        }

        .total-exp-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 700;
          color: #10B981;
        }

        .chart-icon-box {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          background: #E8F5E9;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Report Section */
        .report-section {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 20px 18px;
          margin-bottom: 20px;
          box-shadow: var(--shadow-sm);
        }

        .section-head-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .section-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .section-head-row .section-title {
          margin-bottom: 0;
        }

        /* Doughnut Chart Wrap */
        .doughnut-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .doughnut-chart-wrapper {
          position: relative;
          width: 180px;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .donut-center-label {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          pointer-events: none;
        }

        .donut-amount {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .donut-sub {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .category-legend {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .legend-dot {
          width: 9px;
          height: 9px;
          border-radius: var(--radius-full);
          flex-shrink: 0;
        }

        .legend-name {
          color: var(--text-secondary);
          font-weight: 500;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .legend-pct {
          font-weight: 700;
          color: var(--text-primary);
        }

        .line-chart-card {
          margin-top: 10px;
        }

        /* Insight Card */
        .insight-card {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          border-radius: var(--radius-lg);
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .insight-icon-box {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background: #DCFCE7;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .insight-label {
          font-size: 12px;
          font-weight: 700;
          color: #15803D;
          display: block;
        }

        .insight-text {
          font-size: 13px;
          color: #166534;
          font-weight: 500;
          line-height: 1.4;
          margin-top: 2px;
        }

        .empty-chart-box {
          text-align: center;
          padding: 28px 16px;
          background: var(--bg-subtle);
          border-radius: var(--radius-lg);
          border: 1px dashed var(--border-color);
        }

        .empty-chart-box p {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .empty-chart-box span {
          font-size: 11.5px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
