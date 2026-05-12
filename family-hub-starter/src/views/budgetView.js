import { state } from '../main.js';
import { todayStr } from '../utils/constants.js';

export function renderBudget() {
  const { budgetTab, budgetViewMonth, budget } = state;
  const { periodAmount, periodType, categories, transactions } = budget;

  // Filter transactions for the current viewing month
  const txnsInMonth = transactions.filter(t => {
    const txnDate = new Date(t.date);
    return txnDate.getMonth() === budgetViewMonth.getMonth() &&
           txnDate.getFullYear() === budgetViewMonth.getFullYear();
  });

  // Recalculate spent categories for the current month only
  const catSpentInMonth = {};
  categories.forEach(c => { catSpentInMonth[c.name] = 0; });
  txnsInMonth.forEach(t => {
    if (catSpentInMonth.hasOwnProperty(t.category)) {
      catSpentInMonth[t.category] += t.amount;
    }
  });

  const totalSpent = Object.values(catSpentInMonth).reduce((a, b) => a + b, 0);
  const totalBudgeted = categories.reduce((s, c) => s + c.budgeted, 0);
  const overallPct = totalBudgeted > 0 ? Math.min(100, Math.round((totalSpent / totalBudgeted) * 100)) : 0;

  // Format month display
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const monthDisplay = `${monthNames[budgetViewMonth.getMonth()]} ${budgetViewMonth.getFullYear()}`;

  const budgetContent = `
    <div class="page">
      <header class="tasks-header">
        <button class="back-btn" type="button" data-nav="home">←</button>
        <h1 class="tasks-date">Budget & Bills</h1>
        <div class="tasks-nav"></div>
      </header>

      <!-- Tab Navigation -->
      <div style="display:flex;gap:10px;padding:16px;border-bottom:1px solid var(--border);background:var(--card-bg)">
        <button data-budget-tab="budget" class="tab-btn${budgetTab === 'budget' ? ' active' : ''}" style="padding:8px 16px;border:none;border-bottom:2px solid${budgetTab === 'budget' ? ' var(--lavender-acc)' : ' transparent'};background:transparent;cursor:pointer;font-weight:${budgetTab === 'budget' ? '600' : '400'};color:var(--text)">Budget</button>
        <button data-budget-tab="bills" class="tab-btn${budgetTab === 'bills' ? ' active' : ''}" style="padding:8px 16px;border:none;border-bottom:2px solid${budgetTab === 'bills' ? ' var(--lavender-acc)' : ' transparent'};background:transparent;cursor:pointer;font-weight:${budgetTab === 'bills' ? '600' : '400'};color:var(--text)">Bills</button>
      </div>

      ${budgetTab === 'budget' ? `
      <!-- BUDGET VIEW -->
      <div class="budget-summary">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 style="margin:0">${monthDisplay}</h3>
          <button id="budget-settings-btn" type="button" style="background:transparent;border:none;cursor:pointer;font-size:1.2rem">⚙️</button>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <button data-prev-month type="button" style="padding:6px 12px;background:var(--border);border:none;border-radius:4px;cursor:pointer">← Prev</button>
          <span style="font-size:0.9rem;color:var(--muted)">${periodType === 'bi-weekly' ? 'Bi-weekly' : 'Monthly'} Budget</span>
          <button data-next-month type="button" style="padding:6px 12px;background:var(--border);border:none;border-radius:4px;cursor:pointer">Next →</button>
        </div>
      </div>

      <div class="budget-summary">
        <div class="budget-total">
          <p class="budget-label">${monthDisplay} spending</p>
          <p class="budget-amount">$${totalSpent.toFixed(2)} <span>/ $${totalBudgeted.toFixed(2)}</span></p>
          <div class="budget-bar-wrap">
            <div class="budget-bar-fill" style="width:${overallPct}%"></div>
          </div>
          <p class="budget-pct">${overallPct}% used</p>
        </div>
        <div class="budget-monthly-row">
          <span class="budget-label">${periodType === 'bi-weekly' ? 'Bi-weekly' : 'Monthly'} limit</span>
          <span class="budget-monthly-amt" id="period-display">$${periodAmount.toLocaleString()}</span>
          <button class="icon-btn" id="edit-period-btn" type="button" style="font-size:0.8rem">✏️</button>
        </div>
      </div>

      <h3 class="section-label">Categories</h3>
      <div class="budget-cats">
        ${categories.map((cat, ci) => {
          const spent = catSpentInMonth[cat.name] || 0;
          const pct = cat.budgeted > 0 ? Math.min(100, Math.round((spent / cat.budgeted) * 100)) : 0;
          const over = spent > cat.budgeted;
          return `
            <div class="budget-cat">
              <div class="budget-cat-icon">${cat.icon}</div>
              <div class="budget-cat-info">
                <div class="budget-cat-top">
                  <span class="budget-cat-name">${cat.name}</span>
                  <span class="budget-cat-amt${over ? ' over' : ''}">$${spent.toFixed(2)} / $${cat.budgeted}</span>
                  <button class="icon-btn" data-edit-cat="${ci}" type="button" style="margin-left:6px;font-size:0.8rem;">✏️</button>
                  <button class="del-sm" data-del-cat="${ci}" type="button" aria-label="Delete category">×</button>
                </div>
                <div class="budget-bar-wrap sm">
                  <div class="budget-bar-fill${over ? ' over' : ''}" style="width:${pct}%"></div>
                </div>
              </div>
            </div>`;
        }).join('')}
      </div>
      <button class="add-txn-btn" id="add-cat-btn" type="button" style="background:var(--nv-yellow);color:#7a5c00;margin-bottom:10px">+ Add Category</button>

      <h3 class="section-label">${monthDisplay} Transactions</h3>
      <div class="txn-list">
        ${txnsInMonth.length === 0 ? `<p style="color:var(--muted);text-align:center;padding:16px 0 8px">No transactions this month</p>` : `
          ${txnsInMonth.slice().reverse().map((t, ri) => {
            const realIdx = transactions.indexOf(t);
            return `
            <div class="txn-row">
              <div class="txn-left">
                <span class="txn-desc">${t.desc}</span>
                <span class="txn-cat">${t.category} · ${t.date}</span>
              </div>
              <div style="display:flex;align-items:center;gap:10px">
                <span class="txn-amt">-$${t.amount.toFixed(2)}</span>
                <button class="icon-btn" data-edit-txn="${realIdx}" type="button" style="font-size:0.75rem">✏️</button>
                <button class="del-sm" data-del-txn="${realIdx}" type="button" aria-label="Delete">×</button>
              </div>
            </div>`;
          }).join('')}
        `}
      </div>
      <button class="add-txn-btn" id="add-txn-btn" type="button">+ Add Transaction</button>
      ` : `
      <!-- BILLS VIEW -->
      <div class="bills-list">
        ${state.bills.length === 0
          ? `<p style="color:var(--muted);text-align:center;padding:16px 0 8px">No bills added yet 📬</p>`
          : state.bills.slice().sort((a,b) => a.dueDate.localeCompare(b.dueDate)).map((b, i) => {
              const daysUntil = Math.ceil((new Date(b.dueDate) - new Date(todayStr())) / 86400000);
              const overdue   = daysUntil < 0;
              const dueSoon   = daysUntil >= 0 && daysUntil <= 3;
              const statusCls = b.paid ? 'bill-paid' : overdue ? 'bill-overdue' : dueSoon ? 'bill-soon' : '';
              const statusLabel = b.paid ? '✓ Paid' : overdue ? `${Math.abs(daysUntil)}d overdue` : daysUntil === 0 ? 'Due today' : `Due in ${daysUntil}d`;
              return `
              <div class="bill-row ${statusCls}">
                <div class="bill-icon">${b.emoji || '📄'}</div>
                <div class="bill-info">
                  <div class="bill-title">${b.name}</div>
                  <div class="bill-meta">${b.dueDate}${b.autopay ? ' · 🔄 Autopay' : ''}${b.reminder ? ' · 🔔' : ''}</div>
                </div>
                <div class="bill-right">
                  <span class="bill-amt">$${Number(b.amount).toFixed(2)}</span>
                  <span class="bill-status-badge ${statusCls}">${statusLabel}</span>
                  <button class="bill-paid-btn${b.paid ? ' paid' : ''}" data-toggle-bill="${i}" type="button" title="${b.paid ? 'Mark unpaid' : 'Mark paid'}">${b.paid ? '✓' : '○'}</button>
                  <button class="del-sm" data-del-bill="${i}" type="button" aria-label="Delete">×</button>
                </div>
              </div>`;
            }).join('')}
      </div>
      <button class="add-txn-btn" id="add-bill-btn" type="button" style="background:var(--nv-red);color:#7a0000">+ Add Bill</button>
      `}

      <!-- DIALOGS -->
      <dialog class="event-dialog" id="bill-dialog">
        <form class="dialog-card" id="bill-form">
          <button class="close-btn" type="button" id="bill-close">×</button>
          <p class="eyebrow">New Bill</p>
          <label>Name <input required name="name" placeholder="Electric bill"></label>
          <label>Emoji <input name="emoji" maxlength="2" placeholder="💡" value="📄"></label>
          <label>Amount ($) <input required name="amount" type="number" step="0.01" min="0" placeholder="120.00"></label>
          <label>Due date <input required name="dueDate" type="date"></label>
          <label style="flex-direction:row;align-items:center;gap:10px;font-size:0.9rem">
            <input type="checkbox" name="autopay" value="1" style="width:18px;height:18px;accent-color:var(--lavender-acc)">
            <span>🔄 Autopay</span>
          </label>
          <label style="flex-direction:row;align-items:center;gap:10px;font-size:0.9rem">
            <input type="checkbox" name="reminder" value="1" checked style="width:18px;height:18px;accent-color:var(--lavender-acc)">
            <span>🔔 Remind me 3 days before due</span>
          </label>
          <button class="primary-btn full" type="submit">Save Bill</button>
        </form>
      </dialog>

      <dialog class="event-dialog" id="edit-period-dialog">
        <form class="dialog-card" id="edit-period-form">
          <button class="close-btn" type="button" id="edit-period-close">×</button>
          <p class="eyebrow">${periodType === 'bi-weekly' ? 'Bi-weekly' : 'Monthly'} Budget Limit</p>
          <label>Amount ($) <input required name="periodAmount" type="number" min="0" step="1" placeholder="3500"></label>
          <button class="primary-btn full" type="submit">Save</button>
        </form>
      </dialog>

      <dialog class="event-dialog" id="budget-settings-dialog">
        <form class="dialog-card" id="budget-settings-form">
          <button class="close-btn" type="button" id="budget-settings-close">×</button>
          <p class="eyebrow">Budget Settings</p>
          <fieldset style="border:none;padding:0;margin:0">
            <legend style="margin-bottom:12px;font-weight:600">Budget Period</legend>
            <label style="flex-direction:row;align-items:center;gap:10px;margin-bottom:12px">
              <input type="radio" name="periodType" value="monthly"${periodType === 'monthly' ? ' checked' : ''} style="width:18px;height:18px;accent-color:var(--lavender-acc)">
              <span>Monthly</span>
            </label>
            <label style="flex-direction:row;align-items:center;gap:10px">
              <input type="radio" name="periodType" value="bi-weekly"${periodType === 'bi-weekly' ? ' checked' : ''} style="width:18px;height:18px;accent-color:var(--lavender-acc)">
              <span>Bi-weekly</span>
            </label>
          </fieldset>
          <button class="primary-btn full" type="submit">Save</button>
        </form>
      </dialog>

      <dialog class="event-dialog" id="edit-cat-dialog">
        <form class="dialog-card" id="edit-cat-form">
          <button class="close-btn" type="button" id="edit-cat-close">×</button>
          <p class="eyebrow">Edit Category</p>
          <input type="hidden" name="ci">
          <label>Name    <input required name="name" placeholder="Groceries"></label>
          <label>Emoji   <input name="icon" maxlength="2" placeholder="🛒"></label>
          <label>Budget  <input required name="budgeted" type="number" min="0" step="1" placeholder="500"></label>
          <label>Spent   <input required name="spent" type="number" min="0" step="0.01" placeholder="0"></label>
          <button class="primary-btn full" type="submit">Save</button>
        </form>
      </dialog>

      <dialog class="event-dialog" id="add-cat-dialog">
        <form class="dialog-card" id="add-cat-form">
          <button class="close-btn" type="button" id="add-cat-close">×</button>
          <p class="eyebrow">New Category</p>
          <label>Name    <input required name="name" placeholder="Entertainment"></label>
          <label>Emoji   <input name="icon" maxlength="2" placeholder="🎸"></label>
          <label>Budget  <input required name="budgeted" type="number" min="0" step="1" placeholder="200"></label>
          <button class="primary-btn full" type="submit">Add Category</button>
        </form>
      </dialog>

      <dialog class="event-dialog" id="txn-dialog">
        <form class="dialog-card" id="txn-form">
          <button class="close-btn" type="button" id="txn-close">×</button>
          <p class="eyebrow">New Transaction</p>
          <label>Description <input required name="desc" placeholder="Coffee shop"></label>
          <label>Amount ($) <input required name="amount" type="number" step="0.01" min="0" placeholder="12.50"></label>
          <label>Category
            <select name="category">
              ${categories.map(c => `<option>${c.name}</option>`).join('')}
            </select>
          </label>
          <button class="primary-btn full" type="submit">Save</button>
        </form>
      </dialog>

      <dialog class="event-dialog" id="edit-txn-dialog">
        <form class="dialog-card" id="edit-txn-form">
          <button class="close-btn" type="button" id="edit-txn-close">×</button>
          <p class="eyebrow">Edit Transaction</p>
          <input type="hidden" name="txn-idx">
          <label>Description <input required name="desc" placeholder="Coffee shop"></label>
          <label>Amount ($) <input required name="amount" type="number" step="0.01" min="0" placeholder="12.50"></label>
          <label>Category
            <select name="category">
              ${categories.map(c => `<option>${c.name}</option>`).join('')}
            </select>
          </label>
          <button class="primary-btn full" type="submit">Update</button>
        </form>
      </dialog>
    </div>`;

  return budgetContent;
}
