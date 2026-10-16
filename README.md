# Smart Expense Tracker – Personal Finance Management Application

A complete, responsive, fullstack personal finance management application with real-time automatic expense categorization, daily spending calculations, budget tracking, and visual analytics matching the design specification and UI screenshots.

---

## 🌟 Key Features

1. **Intelligent Real-Time Categorization**:
   - Detects merchant names and keywords on-the-fly as you type (e.g., `Uber` -> `Transportation > Cab`, `Swiggy` -> `Food & Groceries > Food Delivery`, `Vegetable shop` -> `Food & Groceries > Vegetables`).
   - Learns from previously confirmed user transactions and custom user-defined rules.
   - Live banner: Shows matched category path, detection reason, and verification indicator.
   - Voice expense input (`🎙️`) and receipt photo scanning (`📷`).

2. **Dashboard & Metrics (Matching Screenshot)**:
   - **Good Morning, Nishanth!** header with user profile avatar and soft organic botanical accents.
   - **Today's Expense**: `₹ 700` with 5 transactions and `↓ 12%` indicator.
   - **This Week**: `₹ 4,850` (`↓ 8%`) & **This Month**: `₹ 18,420` (`↑ 15%`).
   - **Quick Add Grid**: 8 fast categories (Food, Cab, Metro, Shopping, Gas, Bills, Health, Others).
   - **Recent Transactions**: Real-time list with status indicators and details drawer.

3. **Complete Suite of Screens**:
   - **Add Expense (Auto Category)**: Segmented tabs (Expense / Income / Transfer), large amount input with clear button, auto-detection banner, 12 quick categories grid, date/time picker, payment method, wallet selector, and notes.
   - **Categories**: Detailed list cards with colored icons, subcategories expandable view, and modal to create custom categories.
   - **Transactions**: Search, category filters, payment method filters, grouped by date with daily subtotals, grand totals, and instant Excel / CSV export.
   - **Reports**: Total expenses card (`₹ 18,420`), doughnut chart with center value and legend, daily trend area line chart, and smart financial insights.
   - **Budgets**: Category budget progress bars (`Transportation: 60%`, `Food: 66%`, `Shopping: 70%`, `Home: 36%`), threshold alerts, and configure budget modal.
   - **Calendar View**: October 2025 calendar with day highlight and Low/Medium/High spending dots.
   - **Expense Details / Edit**: Complete transaction card with inline editing, category changer, and delete action.

4. **Multi-Mode Experience**:
   - **Mobile Device Frame Preview**: Authentic phone mockup frame matching the screenshot.
   - **Fluid Desktop View**: Expanded layout for widescreen monitors and tablets.
   - **Light / Dark Mode**: Theme toggle with persistent storage.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Recharts, Lucide Icons, Vanilla CSS Design System.
- **Backend**: Python Flask 3.1, SQLAlchemy 2.0, SQLite (or PostgreSQL via `DATABASE_URL`), Pandas, OpenPyXL.
- **REST APIs**: Full CRUD for transactions, categories, budgets, rules, analytics summary, and export endpoints.

---

## 🚀 How to Run

### Option 1: One-Click Launch (Windows)
Double-click `start.bat` in the project root.

### Option 2: Manual Terminal Execution

#### 1. Backend:
```bash
cd backend
python seed_data.py   # Populates initial data matching the screenshot
python app.py         # Runs Flask on http://127.0.0.1:5000
```

#### 2. Frontend:
```bash
cd frontend
npm install
npm run dev           # Runs Vite on http://localhost:5173
```

Visit **http://localhost:5173** in your browser.
