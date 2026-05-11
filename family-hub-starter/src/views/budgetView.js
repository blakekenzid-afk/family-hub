import { state } from '../main.js';
import { todayStr } from '../utils/constants.js';

export function renderBudget() {
  const { monthly, categories, transactions } = state.budget;
  const totalSpent = categories.reduce((s, c) => s + c.spent, 0);
  const totalBudgeted = categories.reduce((s, c) => s + c.budgeted, 0);
  const overallPct = totalBudgeted > 0 ? Math.min(100, Math.round((totalSpent / totalBudgeted) * 100)) : 0;

  return `
    <div class="page">
      <header class="tasks-header">
        <button class="back-btn" type="button" data-nav="home">←</button>
        <h1 class="tasks-date">Budget</h1>
        <div class="tasks-nav"></div>
      </header>

      <div class="budget-summary">
        <div class="budget-total">
          <p class="budget-label">Month so far</p>
          <p class="budget-amount">$${totalSpent.toFixed(2)} <span>/ $${totalBudgeted.toFixed(2)}</span></p>
          <div class="budget-bar-wrap">
            <div class="budget-bar-fill" style="width:${overallPct}%"></div>
          </div>
          <p class="budget-pct">${overallPct}% used</p>
        </div>
        <div class="budget-monthly-row">
          <span class="budget-label">Monthly income</span>
          <span class="budget-monthly-amt" id="monthly-display">$${monthly.toLocaleString()}</span>
          <button class="icon-btn" id="edit-monthly-btn" type="button" style="font-size:0.8rem">✏️</button>
        </div>
      </div>

      <h3 class="section-label">Categories</h3>
      <div class="budget-cats">
        ${categories.map((cat, ci) => {
          const pct = cat.budgeted > 0 ? Math.min(100, Math.round((cat.spent / cat.budgeted) * 100)) : 0;
          const over = cat.spent > cat.budgeted;
          return `
            <div class="budget-cat">
              <div class="budget-cat-icon">${cat.icon}</div>
              <div class="budget-cat-info">
                <div class="budget-cat-top">
                  <span class="budget-cat-name">${cat.name}</span>
                  <span class="budget-cat-amt${over ? ' over' : ''}">$${cat.spent.toFixed(2)} / $${cat.budgeted}</span>
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

      <h3 class="section-label">Recent Transactions</h3>
      <div class="txn-list">
        ${transactions.slice().reverse().map((t, ri) => {
          const realIdx = transactions.length - 1 - ri;
          return `
          <div class="txn-row">
            <div class="txn-left">
              <span class="txn-desc">${t.desc}</span>
              <span class="txn-cat">${t.category} · ${t.date}</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
              <span class="txn-amt">-$${t.amount.toFixed(2)}</span>
              <button class="del-sm" data-del-txn="${realIdx}" type="button" aria-label="Delete">×</button>
            </div>
          </div>`;}).join('')}
      </div>

      <button class="add-txn-btn" id="add-txn-btn" type="button">+ Add Transaction</button>

      <h3 class="section-label">Bills</h3>
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
        <form class="dialog-card" id="edit-monthly-form">
          <button class="close-btn" type="button" id="edit-monthly-close">×</button>
          <p class="eyebrow">Monthly Income</p>
          <label>Amount ($) <input required name="monthly" type="number" min="0" step="1" placeholder="3500"></label>
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
    </div>`;
}
