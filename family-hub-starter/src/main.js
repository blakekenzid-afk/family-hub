import './styles.css';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const TIME_ICONS  = { morning: '🌤️', afternoon: '☀️', evening: '🌙' };
const TIME_LABELS = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' };

const NAV_ITEMS = [
  { label: 'Tasks',     icon: '✅', view: 'tasks',     cls: 'nv-green'  },
  { label: 'Calendar',  icon: '📅', view: 'calendar',  cls: 'nv-red'    },
  { label: 'Meals',     icon: '🍽️', view: 'meals',     cls: 'nv-tan'    },
  { label: 'Lists',     icon: '📋', view: 'lists',     cls: 'nv-yellow' },
  { label: 'Groceries', icon: '🛒', view: 'groceries', cls: 'nv-blue'   },
  { label: 'Budget',    icon: '💰', view: 'budget',    cls: 'nv-mint'   },
  { label: 'Profiles',  icon: '👥', view: 'profiles',  cls: 'nv-gray'   },
];

const state = {
  view: 'home',
  currentDate: new Date(),
  tasks: [],
  events: [],
  meals: [
    { day: 'Mon', meal: '' },
    { day: 'Tue', meal: '' },
    { day: 'Wed', meal: '' },
    { day: 'Thu', meal: '' },
    { day: 'Fri', meal: '' },
    { day: 'Sat', meal: '' },
    { day: 'Sun', meal: '' },
  ],
  groceries: [],
  lists: [],
  nextTaskId: 1,
  nextListId: 1,
  nextNotifId: 1,
  nextRecipeId: 1,
  nextEventId: 1,
  editingMealIdx: null,
  selectedRecipeId: null,
  recipes: [],
  profiles: [],
  notifications: [],
  budget: {
    monthly: 0,
    categories: [],
    transactions: [],
  },
};

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtShort(date) {
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function fmtLong(date) {
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

// ── views ─────────────────────────────────────────────────────────────────────

function renderHome() {
  const todayEvents = state.events.filter(e => e.date === todayStr());
  const unread = state.notifications.filter(n => !n.read).length;
  return `
    <div class="page home-page">
      <header class="app-header">
        <button class="bell-btn" type="button" data-nav="notifications" aria-label="Notifications">
          🔔
          ${unread > 0 ? `<span class="notif-badge">${unread}</span>` : ''}
        </button>
        <button class="family-name-btn" type="button">diskey <span class="chevron">⌄</span></button>
        <button class="account-btn" type="button" data-nav="profiles" aria-label="Account">👤</button>
      </header>

      <nav class="nav-grid" aria-label="Navigation">
        ${NAV_ITEMS.map(n => `
          <button class="nav-item" type="button" data-nav="${n.view}">
            <div class="nav-circle ${n.cls}">${n.icon}</div>
            <span class="nav-label">${n.label}</span>
          </button>`).join('')}
      </nav>

      <div class="today-card">
        <h2 class="today-date">${fmtLong(new Date())}</h2>
        ${todayEvents.length === 0
          ? '<p class="no-events">No upcoming events today 😌</p>'
          : `<ul class="event-list">${todayEvents.map(e => `
              <li class="event-row">
                <span class="event-dot"></span>
                <span class="event-time">${e.time}</span>
                <span class="event-title">${e.title}</span>
                <span class="event-person">${e.person}</span>
              </li>`).join('')}</ul>`}
      </div>
    </div>`;
}

function renderTaskCard(task) {
  return `
    <div class="task-card${task.done ? ' done' : ''}">
      <div class="task-emoji-area"><span class="task-emoji">${task.emoji}</span></div>
      <div class="task-footer">
        <span class="task-title">${task.title}</span>
        <div class="task-actions">
          <button class="task-toggle${task.done ? ' checked' : ''}"
                  data-task-toggle="${task.id}" type="button"
                  aria-label="${task.done ? 'Mark incomplete' : 'Mark complete'}"></button>
          <button class="del-sm" data-del-task="${task.id}" type="button" aria-label="Delete task">×</button>
        </div>
      </div>
    </div>`;
}

function renderPersonCard(person) {
  const allTasks = state.tasks.filter(t => t.person === person.name);
  const done = allTasks.filter(t => t.done).length;
  const pct  = allTasks.length ? Math.round((done / allTasks.length) * 100) : 0;

  const periods = ['morning', 'afternoon', 'evening']
    .filter(tp => allTasks.some(t => t.timeOfDay === tp));

  const timeIndicators = periods.map(tp => `
    <div class="time-indicator">
      <div class="time-tab-icon">${TIME_ICONS[tp]}</div>
      <span class="time-tab-label">${TIME_LABELS[tp]}</span>
    </div>`).join('');

  const sections = periods.map(tp => {
    const tasks = allTasks.filter(t => t.timeOfDay === tp);
    return `
      <div class="time-section">
        <h4 class="section-heading">${TIME_LABELS[tp]}</h4>
        <div class="task-list">${tasks.map(renderTaskCard).join('')}</div>
      </div>`;
  }).join('');

  return `
    <div class="person-card ${person.color}">
      <div class="person-header">
        <div class="person-avatar">${person.emoji}</div>
        <div class="person-meta">
          <h2 class="person-name">${person.name}</h2>
          <div class="progress-wrap">
            <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
            <span class="progress-text">${done}/${allTasks.length}</span>
          </div>
        </div>
      </div>
      <div class="time-indicators">${timeIndicators}</div>
      ${sections}
    </div>`;
}

function renderTasks() {
  return `
    <div class="page tasks-page">
      <div class="tasks-header" style="margin-bottom:0">
        <button class="back-btn" type="button" data-nav="home">←</button>
        <h1 class="tasks-date">Tasks</h1>
        <div class="tasks-nav"></div>
      </div>
      <div class="persons-grid">
        ${state.profiles.map(renderPersonCard).join('')}
      </div>
      <button class="fab" id="open-task-dialog" type="button" aria-label="Add task">+</button>
      <dialog class="event-dialog" id="task-dialog">
        <form class="dialog-card" id="task-form">
          <button class="close-btn" type="button" id="task-close">×</button>
          <p class="eyebrow">New Task</p>
          <label>Person
            <select name="person">
              ${state.profiles.map(p => `<option>${p.name}</option>`).join('')}
            </select>
          </label>
          <label>Time of Day
            <select name="timeOfDay">
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </label>
          <label>Emoji <input name="emoji" placeholder="📌" maxlength="2" value="📌"></label>
          <label>Task <input required name="title" placeholder="Pack school bag"></label>
          <button class="primary-btn full" type="submit">Save Task</button>
        </form>
      </dialog>
    </div>`;
}

function renderMeals() {
  const hasSelected = state.selectedRecipeId !== null;
  const selRecipe = state.recipes.find(r => r.id === state.selectedRecipeId);
  return `
    <div class="page">
      <header class="tasks-header">
        <button class="back-btn" type="button" data-nav="home">←</button>
        <h1 class="tasks-date">Meals & Recipes</h1>
        <div class="tasks-nav"></div>
      </header>

      <h3 class="section-label">This Week</h3>
      ${hasSelected ? `<div class="assign-hint">Tap a day to assign <strong>${selRecipe ? selRecipe.emoji + ' ' + selRecipe.name : ''}</strong></div>` : '<p class="meals-hint">Drag a recipe onto a day — or tap a recipe, then tap a day</p>'}
      <div class="simple-list meal-week">
        ${state.meals.map((m, i) => state.editingMealIdx === i
          ? `<div class="simple-row meal-drop-zone" data-drop-day="${i}">
               <span class="simple-day">${m.day}</span>
               <form class="meal-edit-form" data-meal-idx="${i}">
                 <input class="meal-edit-input" name="meal" value="${m.meal}" required autofocus>
                 <button class="icon-btn" type="submit">✓</button>
               </form>
             </div>`
          : `<div class="simple-row meal-drop-zone${hasSelected ? ' droppable' : ''}" data-drop-day="${i}">
               <span class="simple-day">${m.day}</span>
               <span class="simple-meal">${m.meal || '<span class="meal-empty">drag a recipe here</span>'}</span>
               <button class="edit-icon-btn" data-edit-meal="${i}" type="button">✏️</button>
             </div>`
        ).join('')}
      </div>

      <h3 class="section-label" style="margin-top:26px">Recipes</h3>
      <div class="recipe-grid">
        ${state.recipes.map(r => `
          <div class="recipe-card${state.selectedRecipeId === r.id ? ' selected' : ''}"
               draggable="true" data-recipe-id="${r.id}" data-select-recipe="${r.id}">
            <button class="del-sm recipe-del-btn" data-del-recipe="${r.id}" type="button" aria-label="Delete">×</button>
            <div class="recipe-emoji">${r.emoji}</div>
            <div class="recipe-name">${r.name}</div>
            <div class="recipe-ing-count">${r.ingredients.length} ingredient${r.ingredients.length !== 1 ? 's' : ''}</div>
            ${r.ingredients.length ? `<div class="recipe-ing-preview">${r.ingredients.slice(0,3).join(', ')}${r.ingredients.length > 3 ? '…' : ''}</div>` : ''}
          </div>`).join('')}
        <button class="recipe-add-card" id="add-recipe-btn" type="button">
          <span class="recipe-add-icon">+</span>
          <span>New Recipe</span>
        </button>
      </div>

      <dialog class="event-dialog" id="recipe-dialog">
        <form class="dialog-card" id="recipe-form">
          <button class="close-btn" type="button" id="recipe-close">×</button>
          <p class="eyebrow" id="recipe-dialog-title">New Recipe</p>
          <input type="hidden" name="recipe-id" value="">
          <label>Name        <input required name="name" placeholder="Chicken Tacos"></label>
          <label>Emoji       <input name="emoji" maxlength="2" placeholder="🍽️" value="🍽️"></label>
          <label>Ingredients
            <textarea name="ingredients" class="recipe-textarea"
              placeholder="One per line:&#10;Chicken breast&#10;Tortillas&#10;Salsa" rows="5"></textarea>
          </label>
          <button class="primary-btn full" type="submit">Save Recipe</button>
        </form>
      </dialog>
    </div>`;
}

const GROCERY_PALETTE = [
  { bg: '#d5f0dd', text: '#22703d' },  // green
  { bg: '#d5e8ff', text: '#1554a0' },  // blue
  { bg: '#fff0c0', text: '#8a6300' },  // yellow
  { bg: '#ffdde8', text: '#a82d60' },  // pink
  { bg: '#ead5ff', text: '#592fa0' },  // purple
  { bg: '#ffe0cc', text: '#a04010' },  // orange
  { bg: '#d5f5f5', text: '#1a7070' },  // teal
];

function renderGroceries() {
  return `
    <div class="page">
      <header class="tasks-header">
        <button class="back-btn" type="button" data-nav="home">←</button>
        <h1 class="tasks-date">Grocery List</h1>
        <div class="tasks-nav"></div>
      </header>
      ${state.groceries.map((cat, ci) => {
        const pal = GROCERY_PALETTE[ci % GROCERY_PALETTE.length];
        const doneCount = cat.items.filter(i => i.checked).length;
        return `
        <div class="grocery-cat-block">
          <div class="grocery-cat-row">
            <div class="grocery-cat-header" style="background:${pal.bg};color:${pal.text}">${cat.category}</div>
            <span class="cat-count">${doneCount}/${cat.items.length}</span>
            <button class="icon-btn" data-rename-grocery-cat="${ci}" type="button" style="font-size:0.8rem">✏️</button>
            <button class="del-sm" data-del-grocery-cat="${ci}" type="button" aria-label="Delete category">×</button>
          </div>
          <div class="item-list">
            ${cat.items.map((item, ii) => `
              <div class="item-row${item.checked ? ' item-checked' : ''}">
                <button class="check-circle${item.checked ? ' done' : ''}" data-check-grocery data-ci="${ci}" data-ii="${ii}" type="button" aria-label="Toggle"></button>
                <span class="item-text">${item.text}</span>
                <button class="del-sm" data-del-grocery-item data-ci="${ci}" data-ii="${ii}" type="button" aria-label="Remove">×</button>
              </div>`).join('')}
          </div>
          <form class="add-item-form" data-add-grocery="${ci}">
            <input name="item" placeholder="Add to ${cat.category}..." required>
            <button type="submit" class="add-item-submit">Add</button>
          </form>
        </div>`;
      }).join('')}
      <form class="add-item-form" id="add-grocery-cat-form" style="margin-top:8px">
        <input name="cat" placeholder="New category name..." required>
        <button type="submit" class="add-item-submit">+ Category</button>
      </form>
      <dialog class="event-dialog" id="rename-grocery-cat-dialog">
        <form class="dialog-card" id="rename-grocery-cat-form">
          <button class="close-btn" type="button" id="rename-grocery-cat-close">×</button>
          <p class="eyebrow">Rename Category</p>
          <input type="hidden" name="ci">
          <label>Name <input required name="name" placeholder="Produce"></label>
          <button class="primary-btn full" type="submit">Save</button>
        </form>
      </dialog>
    </div>`;
}

function renderCalendar() {
  const year  = state.currentDate.getFullYear();
  const month = state.currentDate.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const days  = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i); return d;
  });
  const todayISO = todayStr();
  const monthLabel = state.currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return `
    <div class="page">
      <header class="tasks-header">
        <button class="back-btn" type="button" data-nav="home">←</button>
        <h1 class="tasks-date">${monthLabel}</h1>
        <div class="tasks-nav">
          <button class="icon-btn" id="cal-prev">‹</button>
          <button class="icon-btn" id="cal-next">›</button>
        </div>
      </header>
      <div class="cal-grid-wrap">
        <div class="cal-weekdays">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<span>${d}</span>`).join('')}</div>
        <div class="cal-grid">
          ${days.map(day => {
            const iso = day.toISOString().slice(0,10);
            const inMonth = day.getMonth() === month;
            const isToday = iso === todayISO;
            const evts = state.events.filter(e => e.date === iso);
            return `
              <div class="cal-cell${inMonth ? '' : ' out'}${isToday ? ' today' : ''}" data-cal-date="${iso}">
                <span class="cal-num">${day.getDate()}</span>
                ${evts.map(e => `
                  <div class="cal-evt">
                    ${e.title}
                    <button class="cal-evt-del" data-del-event="${e.id}" type="button" aria-label="Remove">×</button>
                  </div>`).join('')}
              </div>`;
          }).join('')}
        </div>
      </div>
      <dialog class="event-dialog" id="cal-dialog">
        <form class="dialog-card" id="cal-form">
          <button class="close-btn" type="button" id="cal-close">×</button>
          <p class="eyebrow">New Event</p>
          <label>Title <input required name="title" placeholder="Dentist appointment"></label>
          <label>Date <input required name="date" type="date" id="cal-date-input"></label>
          <label>Time <input name="time" placeholder="3:30 PM"></label>
          <label>Person <input name="person" placeholder="Family"></label>
          <button class="primary-btn full" type="submit">Save Event</button>
        </form>
      </dialog>
    </div>`;
}

function renderLists() {
  return `
    <div class="page">
      <header class="tasks-header">
        <button class="back-btn" type="button" data-nav="home">←</button>
        <h1 class="tasks-date">Lists</h1>
        <div class="tasks-nav"></div>
      </header>
      <div class="lists-wrap">
        ${state.lists.map(list => {
          const doneCount = list.items.filter(i => i.checked).length;
          return `
          <div class="list-card">
            <div class="list-card-header">
              <h3 class="list-card-title">${list.name}</h3>
              <span class="cat-count">${doneCount}/${list.items.length}</span>
              <button class="icon-btn" data-rename-list="${list.id}" type="button" style="font-size:0.8rem">✏️</button>
              <button class="del-sm" data-del-list="${list.id}" type="button" aria-label="Delete list">×</button>
            </div>
            <div class="list-items">
              ${list.items.map((item, i) => `
                <div class="list-item-row${item.checked ? ' item-checked' : ''}">
                  <button class="check-circle${item.checked ? ' done' : ''}" data-check-list="${list.id}" data-item-idx="${i}" type="button" aria-label="Toggle"></button>
                  <span class="item-text">${item.text}</span>
                  <button class="del-sm" data-del-list-item="${list.id}" data-item-idx="${i}" type="button" aria-label="Remove">×</button>
                </div>`).join('')}
            </div>
            <form class="add-item-form" data-add-list="${list.id}">
              <input name="item" placeholder="Add item..." required>
              <button type="submit" class="add-item-submit">Add</button>
            </form>
          </div>`;
        }).join('')}
      </div>
      <button class="add-list-btn" id="add-list-btn" type="button">+ New List</button>
      <dialog class="event-dialog" id="new-list-dialog">
        <form class="dialog-card" id="new-list-form">
          <button class="close-btn" type="button" id="new-list-close">×</button>
          <p class="eyebrow">New List</p>
          <label>List name <input required name="name" placeholder="Vacation packing"></label>
          <button class="primary-btn full" type="submit">Create List</button>
        </form>
      </dialog>
      <dialog class="event-dialog" id="rename-list-dialog">
        <form class="dialog-card" id="rename-list-form">
          <button class="close-btn" type="button" id="rename-list-close">×</button>
          <p class="eyebrow">Rename List</p>
          <input type="hidden" name="id">
          <label>Name <input required name="name" placeholder="Shopping list"></label>
          <button class="primary-btn full" type="submit">Save</button>
        </form>
      </dialog>
    </div>`;
}

function renderBudget() {
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
          <p class="budget-amount">$${totalSpent.toFixed(2)} <span>/ $${totalBudgeted}</span></p>
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

      <dialog class="event-dialog" id="edit-monthly-dialog">
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

function renderNotifications() {
  function timeAgo(iso) {
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 0) {
      const abs = Math.abs(diff);
      if (abs < 3600)  return `Due in ${Math.ceil(abs/60)}m`;
      if (abs < 86400) return `Due in ${Math.ceil(abs/3600)}h`;
      return `Due in ${Math.ceil(abs/86400)}d`;
    }
    if (diff < 60)    return 'Just now';
    if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  }
  const unread = state.notifications.filter(n => !n.read);
  const read   = state.notifications.filter(n =>  n.read);
  return `
    <div class="page">
      <header class="tasks-header">
        <button class="back-btn" type="button" data-nav="home">←</button>
        <h1 class="tasks-date">Notifications</h1>
        <div class="tasks-nav">
          ${unread.length ? `<button class="icon-btn" id="mark-all-read">Mark all read</button>` : ''}
        </div>
      </header>
      ${unread.length === 0 && read.length === 0 ? `
        <div class="notif-empty">🔔 No notifications yet</div>` : ''}
      ${unread.length ? `
        <h3 class="section-label">New</h3>
        <div class="notif-list">
          ${unread.map(n => `
            <div class="notif-card unread">
              <div class="notif-dot"></div>
              <div class="notif-body">
                <p class="notif-title">${n.title}</p>
                <p class="notif-sub">${n.body}</p>
                <p class="notif-time">${timeAgo(n.time)}</p>
              </div>
              <div class="notif-actions">
                <button class="icon-btn" data-read-notif="${n.id}" type="button">✓</button>
                <button class="del-sm" data-del-notif="${n.id}" type="button">×</button>
              </div>
            </div>`).join('')}
        </div>` : ''}
      ${read.length ? `
        <h3 class="section-label" style="margin-top:18px">Earlier</h3>
        <div class="notif-list">
          ${read.map(n => `
            <div class="notif-card">
              <div class="notif-body">
                <p class="notif-title">${n.title}</p>
                <p class="notif-sub">${n.body}</p>
                <p class="notif-time">${timeAgo(n.time)}</p>
              </div>
              <button class="del-sm" data-del-notif="${n.id}" type="button">×</button>
            </div>`).join('')}
        </div>` : ''}
      <button class="add-txn-btn" id="add-notif-btn" type="button" style="margin-top:16px">+ Add Reminder</button>
      <dialog class="event-dialog" id="notif-dialog">
        <form class="dialog-card" id="notif-form">
          <button class="close-btn" type="button" id="notif-close">×</button>
          <p class="eyebrow">New Reminder</p>
          <label>Title   <input required name="title" placeholder="Soccer practice"></label>
          <label>Message <input name="body" placeholder="Don\'t forget cleats!"></label>
          <label>When    <input name="time" type="datetime-local"></label>
          <button class="primary-btn full" type="submit">Save Reminder</button>
        </form>
      </dialog>
    </div>`;
}

function renderProfiles() {
  return `
    <div class="page">
      <header class="tasks-header">
        <button class="back-btn" type="button" data-nav="home">←</button>
        <h1 class="tasks-date">Profiles</h1>
        <div class="tasks-nav"></div>
      </header>
      <div class="profiles-grid">
        ${state.profiles.map((p, i) => `
          <div class="profile-card ${p.color}">
            <button class="del-sm profile-del" data-del-profile="${i}" type="button" aria-label="Remove">×</button>
            <div class="profile-avatar">${p.emoji}</div>
            <span class="profile-name">${p.name}</span>
          </div>`).join('')}
      </div>
      <button class="add-list-btn" id="add-profile-btn" type="button" style="margin-top:16px">+ Add Person</button>
      <dialog class="event-dialog" id="profile-dialog">
        <form class="dialog-card" id="profile-form">
          <button class="close-btn" type="button" id="profile-close">×</button>
          <p class="eyebrow">New Profile</p>
          <label>Name <input required name="name" placeholder="Sam"></label>
          <label>Emoji <input name="emoji" placeholder="🧑" maxlength="2" value="🧑"></label>
          <label>Color
            <select name="color">
              <option value="lavender">Lavender</option>
              <option value="blue">Blue</option>
              <option value="pink">Pink</option>
              <option value="green">Green</option>
              <option value="orange">Orange</option>
              <option value="teal">Teal</option>
              <option value="yellow">Yellow</option>
              <option value="red">Red</option>
            </select>
          </label>
          <button class="primary-btn full" type="submit">Add Person</button>
        </form>
      </dialog>
    </div>`;
}

// ── persistence ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'family-hub-v1';

function saveState() {
  try {
    const s = { ...state, currentDate: state.currentDate.toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    Object.assign(state, saved);
    state.currentDate = saved.currentDate ? new Date(saved.currentDate) : new Date();
    state.editingMealIdx = null;
    state.selectedRecipeId = null;
  } catch {}
}

// ── assign recipe helper ──────────────────────────────────────────────────────

function assignRecipeToDay(recipeId, dayIdx) {
  const recipe = state.recipes.find(r => r.id === recipeId);
  if (!recipe || dayIdx < 0 || dayIdx >= state.meals.length) return;
  state.meals[dayIdx].meal = recipe.name;
  if (recipe.ingredients.length > 0) {
    const catName = `${recipe.emoji} ${recipe.name}`;
    let cat = state.groceries.find(c => c.category === catName);
    if (!cat) {
      cat = { category: catName, items: [] };
      state.groceries.push(cat);
    }
    recipe.ingredients.forEach(ing => {
      if (!cat.items.some(i => i.text === ing)) cat.items.push({ text: ing, checked: false });
    });
  }
  state.selectedRecipeId = null;
  render();
}

// ── render + bind ─────────────────────────────────────────────────────────────

function render() {
  saveState();
  const app = document.querySelector('#app');
  switch (state.view) {
    case 'tasks':     app.innerHTML = renderTasks();     break;
    case 'meals':     app.innerHTML = renderMeals();     break;
    case 'groceries': app.innerHTML = renderGroceries(); break;
    case 'calendar':  app.innerHTML = renderCalendar();  break;
    case 'lists':     app.innerHTML = renderLists();      break;
    case 'budget':    app.innerHTML = renderBudget();        break;
    case 'notifications': app.innerHTML = renderNotifications(); break;
    case 'profiles':  app.innerHTML = renderProfiles();     break;
    default:          app.innerHTML = renderHome();
  }
  bind();
}

function bind() {
  document.querySelectorAll('[data-nav]').forEach(btn =>
    btn.addEventListener('click', () => { state.view = btn.dataset.nav; render(); }));

  document.querySelectorAll('[data-task-toggle]').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const task = state.tasks.find(t => t.id === Number(btn.dataset.taskToggle));
      if (task) { task.done = !task.done; render(); }
    }));

  document.querySelector('#prev-day')?.addEventListener('click', () => {
    state.currentDate.setDate(state.currentDate.getDate() - 1); render();
  });
  document.querySelector('#next-day')?.addEventListener('click', () => {
    state.currentDate.setDate(state.currentDate.getDate() + 1); render();
  });
  document.querySelector('#today-btn')?.addEventListener('click', () => {
    state.currentDate = new Date(); render();
  });
  document.querySelector('#cal-prev')?.addEventListener('click', () => {
    state.currentDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() - 1, 1);
    render();
  });
  document.querySelector('#cal-next')?.addEventListener('click', () => {
    state.currentDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() + 1, 1);
    render();
  });

  // ── Tasks ──────────────────────────────────────────────────────────────
  document.querySelectorAll('[data-del-task]').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      state.tasks = state.tasks.filter(t => t.id !== Number(btn.dataset.delTask));
      render();
    }));
  const taskDialog = document.querySelector('#task-dialog');
  document.querySelector('#open-task-dialog')?.addEventListener('click', () => taskDialog.showModal());
  document.querySelector('#task-close')?.addEventListener('click', () => taskDialog.close());
  document.querySelector('#task-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    state.tasks.push({
      id: state.nextTaskId++,
      person: data.get('person'),
      timeOfDay: data.get('timeOfDay'),
      emoji: data.get('emoji') || '📌',
      title: data.get('title'),
      done: false,
    });
    taskDialog.close();
    e.currentTarget.reset();
    render();
  });

  // ── Meals ──────────────────────────────────────────────────────────────
  document.querySelectorAll('[data-edit-meal]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.editingMealIdx = Number(btn.dataset.editMeal);
      render();
    }));
  document.querySelectorAll('.meal-edit-form').forEach(form =>
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      state.meals[Number(form.dataset.mealIdx)].meal = data.get('meal');
      state.editingMealIdx = null;
      render();
    }));

  // ── Recipes ────────────────────────────────────────────────────────────
  // Drag-and-drop on recipe cards
  document.querySelectorAll('[data-recipe-id]').forEach(card => {
    card.addEventListener('dragstart', e => {
      e.dataTransfer.setData('recipeId', card.dataset.recipeId);
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
  });

  // Drop zones on day rows
  document.querySelectorAll('.meal-drop-zone').forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const recipeId = Number(e.dataTransfer.getData('recipeId'));
      assignRecipeToDay(recipeId, Number(zone.dataset.dropDay));
    });
    // Tap-to-assign (mobile): tap a day while a recipe is selected
    zone.addEventListener('click', e => {
      if (e.target.closest('[data-edit-meal]')) return;
      if (state.selectedRecipeId !== null) {
        assignRecipeToDay(state.selectedRecipeId, Number(zone.dataset.dropDay));
      }
    });
  });

  // Tap a recipe card to select / deselect it
  document.querySelectorAll('[data-select-recipe]').forEach(card =>
    card.addEventListener('click', e => {
      if (e.target.closest('[data-del-recipe]')) return;
      const id = Number(card.dataset.selectRecipe);
      state.selectedRecipeId = state.selectedRecipeId === id ? null : id;
      render();
    }));

  // Delete recipe
  document.querySelectorAll('[data-del-recipe]').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = Number(btn.dataset.delRecipe);
      state.recipes = state.recipes.filter(r => r.id !== id);
      if (state.selectedRecipeId === id) state.selectedRecipeId = null;
      render();
    }));

  // Add / Edit recipe dialog
  const recipeDialog = document.querySelector('#recipe-dialog');
  document.querySelector('#add-recipe-btn')?.addEventListener('click', () => {
    const f = document.querySelector('#recipe-form');
    f.querySelector('[name=recipe-id]').value = '';
    document.querySelector('#recipe-dialog-title').textContent = 'New Recipe';
    f.reset();
    f.querySelector('[name=emoji]').value = '🍽️';
    recipeDialog.showModal();
  });
  document.querySelectorAll('[data-edit-recipe]').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const recipe = state.recipes.find(r => r.id === Number(btn.dataset.editRecipe));
      if (!recipe) return;
      const f = document.querySelector('#recipe-form');
      f.querySelector('[name=recipe-id]').value = recipe.id;
      f.querySelector('[name=name]').value = recipe.name;
      f.querySelector('[name=emoji]').value = recipe.emoji;
      f.querySelector('[name=ingredients]').value = recipe.ingredients.join('\n');
      document.querySelector('#recipe-dialog-title').textContent = 'Edit Recipe';
      recipeDialog.showModal();
    }));
  document.querySelector('#recipe-close')?.addEventListener('click', () => { recipeDialog.close(); });
  document.querySelector('#recipe-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const ingredients = (data.get('ingredients') || '').split('\n').map(s => s.trim()).filter(Boolean);
    const existingId = data.get('recipe-id');
    if (existingId) {
      const r = state.recipes.find(r => r.id === Number(existingId));
      if (r) { r.name = data.get('name'); r.emoji = data.get('emoji') || '🍽️'; r.ingredients = ingredients; }
    } else {
      state.recipes.push({ id: state.nextRecipeId++, name: data.get('name'), emoji: data.get('emoji') || '🍽️', ingredients });
    }
    recipeDialog.close();
    e.currentTarget.reset();
    render();
  });

  // ── Groceries (categorised) ─────────────────────────────────────────────────────
  document.querySelectorAll('[data-check-grocery]').forEach(btn =>
    btn.addEventListener('click', () => {
      const ci = Number(btn.dataset.ci), ii = Number(btn.dataset.ii);
      state.groceries[ci].items[ii].checked = !state.groceries[ci].items[ii].checked;
      render();
    }));
  document.querySelectorAll('[data-del-grocery-item]').forEach(btn =>
    btn.addEventListener('click', () => {
      const ci = Number(btn.dataset.ci), ii = Number(btn.dataset.ii);
      state.groceries[ci].items.splice(ii, 1);
      render();
    }));
  document.querySelectorAll('[data-del-grocery-cat]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.groceries.splice(Number(btn.dataset.delGroceryCat), 1);
      render();
    }));
  const renameGroceryCatDialog = document.querySelector('#rename-grocery-cat-dialog');
  document.querySelectorAll('[data-rename-grocery-cat]').forEach(btn =>
    btn.addEventListener('click', () => {
      const ci = Number(btn.dataset.renameGroceryCat);
      const f = document.querySelector('#rename-grocery-cat-form');
      f.querySelector('[name=ci]').value = ci;
      f.querySelector('[name=name]').value = state.groceries[ci].category;
      renameGroceryCatDialog.showModal();
    }));
  document.querySelector('#rename-grocery-cat-close')?.addEventListener('click', () => renameGroceryCatDialog.close());
  document.querySelector('#rename-grocery-cat-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    state.groceries[Number(data.get('ci'))].category = data.get('name');
    renameGroceryCatDialog.close();
    render();
  });
  document.querySelectorAll('[data-add-grocery]').forEach(form =>
    form.addEventListener('submit', e => {
      e.preventDefault();
      const ci = Number(form.dataset.addGrocery);
      const item = new FormData(e.currentTarget).get('item').trim();
      if (item) { state.groceries[ci].items.push({ text: item, checked: false }); e.currentTarget.reset(); render(); }
    }));
  document.querySelector('#add-grocery-cat-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = new FormData(e.currentTarget).get('cat').trim();
    if (name) { state.groceries.push({ category: name, items: [] }); e.currentTarget.reset(); render(); }
  });

  // ── Lists ─────────────────────────────────────────────────────────────────
  document.querySelectorAll('[data-check-list]').forEach(btn =>
    btn.addEventListener('click', () => {
      const list = state.lists.find(l => l.id === Number(btn.dataset.checkList));
      if (list) { list.items[Number(btn.dataset.itemIdx)].checked = !list.items[Number(btn.dataset.itemIdx)].checked; render(); }
    }));
  document.querySelectorAll('[data-del-list-item]').forEach(btn =>
    btn.addEventListener('click', () => {
      const list = state.lists.find(l => l.id === Number(btn.dataset.delListItem));
      if (list) { list.items.splice(Number(btn.dataset.itemIdx), 1); render(); }
    }));
  document.querySelectorAll('[data-del-list]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.lists = state.lists.filter(l => l.id !== Number(btn.dataset.delList));
      render();
    }));
  const renameListDialog = document.querySelector('#rename-list-dialog');
  document.querySelectorAll('[data-rename-list]').forEach(btn =>
    btn.addEventListener('click', () => {
      const list = state.lists.find(l => l.id === Number(btn.dataset.renameList));
      if (!list) return;
      const f = document.querySelector('#rename-list-form');
      f.querySelector('[name=id]').value = list.id;
      f.querySelector('[name=name]').value = list.name;
      renameListDialog.showModal();
    }));
  document.querySelector('#rename-list-close')?.addEventListener('click', () => renameListDialog.close());
  document.querySelector('#rename-list-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const list = state.lists.find(l => l.id === Number(data.get('id')));
    if (list) list.name = data.get('name');
    renameListDialog.close();
    render();
  });
  document.querySelectorAll('[data-add-list]').forEach(form =>
    form.addEventListener('submit', e => {
      e.preventDefault();
      const list = state.lists.find(l => l.id === Number(form.dataset.addList));
      const item = new FormData(e.currentTarget).get('item').trim();
      if (list && item) { list.items.push({ text: item, checked: false }); e.currentTarget.reset(); render(); }
    }));
  const newListDialog = document.querySelector('#new-list-dialog');
  document.querySelector('#add-list-btn')?.addEventListener('click', () => newListDialog.showModal());
  document.querySelector('#new-list-close')?.addEventListener('click', () => newListDialog.close());
  document.querySelector('#new-list-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = new FormData(e.currentTarget).get('name').trim();
    if (name) { state.lists.push({ id: state.nextListId++, name, items: [] }); newListDialog.close(); e.currentTarget.reset(); render(); }
  });

  // ── Calendar ─────────────────────────────────────────────────────────────
  const calDialog = document.querySelector('#cal-dialog');
  document.querySelectorAll('[data-cal-date]').forEach(cell =>
    cell.addEventListener('click', e => {
      if (e.target.closest('[data-del-event]')) return;
      const dateInput = document.querySelector('#cal-date-input');
      if (dateInput) dateInput.value = cell.dataset.calDate;
      calDialog.showModal();
    }));
  document.querySelector('#cal-close')?.addEventListener('click', () => calDialog.close());
  document.querySelector('#cal-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    state.events.push({ id: state.nextEventId++, title: data.get('title'), date: data.get('date'), time: data.get('time') || 'Anytime', person: data.get('person') || 'Family' });
    calDialog.close();
    e.currentTarget.reset();
    render();
  });
  document.querySelectorAll('[data-del-event]').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      state.events = state.events.filter(ev => ev.id !== Number(btn.dataset.delEvent));
      render();
    }));

  // ── Budget ──────────────────────────────────────────────────────────────
  const editMonthlyDialog = document.querySelector('#edit-monthly-dialog');
  document.querySelector('#edit-monthly-btn')?.addEventListener('click', () => {
    document.querySelector('#edit-monthly-form [name=monthly]').value = state.budget.monthly;
    editMonthlyDialog.showModal();
  });
  document.querySelector('#edit-monthly-close')?.addEventListener('click', () => editMonthlyDialog.close());
  document.querySelector('#edit-monthly-form')?.addEventListener('submit', e => {
    e.preventDefault();
    state.budget.monthly = parseFloat(new FormData(e.currentTarget).get('monthly'));
    editMonthlyDialog.close();
    render();
  });
  document.querySelectorAll('[data-del-txn]').forEach(btn =>
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.delTxn);
      const txn = state.budget.transactions[idx];
      const cat = state.budget.categories.find(c => c.name === txn.category);
      if (cat) cat.spent = Math.max(0, Math.round((cat.spent - txn.amount) * 100) / 100);
      state.budget.transactions.splice(idx, 1);
      render();
    }));

  // delete category
  document.querySelectorAll('[data-del-cat]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.budget.categories.splice(Number(btn.dataset.delCat), 1);
      render();
    }));

  // edit category
  const editCatDialog = document.querySelector('#edit-cat-dialog');
  document.querySelectorAll('[data-edit-cat]').forEach(btn =>
    btn.addEventListener('click', () => {
      const ci = Number(btn.dataset.editCat);
      const cat = state.budget.categories[ci];
      const f = document.querySelector('#edit-cat-form');
      f.querySelector('[name=ci]').value = ci;
      f.querySelector('[name=name]').value = cat.name;
      f.querySelector('[name=icon]').value = cat.icon;
      f.querySelector('[name=budgeted]').value = cat.budgeted;
      f.querySelector('[name=spent]').value = cat.spent;
      editCatDialog.showModal();
    }));
  document.querySelector('#edit-cat-close')?.addEventListener('click', () => editCatDialog.close());
  document.querySelector('#edit-cat-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const ci = Number(data.get('ci'));
    state.budget.categories[ci] = {
      ...state.budget.categories[ci],
      name:     data.get('name'),
      icon:     data.get('icon') || state.budget.categories[ci].icon,
      budgeted: parseFloat(data.get('budgeted')),
      spent:    parseFloat(data.get('spent')),
    };
    editCatDialog.close();
    render();
  });

  // add category
  const addCatDialog = document.querySelector('#add-cat-dialog');
  document.querySelector('#add-cat-btn')?.addEventListener('click', () => addCatDialog.showModal());
  document.querySelector('#add-cat-close')?.addEventListener('click', () => addCatDialog.close());
  document.querySelector('#add-cat-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    state.budget.categories.push({
      name:     data.get('name'),
      icon:     data.get('icon') || '📦',
      budgeted: parseFloat(data.get('budgeted')),
      spent:    0,
    });
    addCatDialog.close();
    e.currentTarget.reset();
    render();
  });

  const txnDialog = document.querySelector('#txn-dialog');
  document.querySelector('#add-txn-btn')?.addEventListener('click', () => txnDialog?.showModal());
  document.querySelector('#txn-close')?.addEventListener('click', () => txnDialog?.close());
  document.querySelector('#txn-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const cat = state.budget.categories.find(c => c.name === data.get('category'));
    const amount = parseFloat(data.get('amount'));
    if (cat) cat.spent = Math.round((cat.spent + amount) * 100) / 100;
    state.budget.transactions.push({
      date: todayStr(),
      desc: data.get('desc'),
      amount,
      category: data.get('category'),
    });
    txnDialog?.close();
    e.currentTarget.reset();
    render();
  });  // ── Notifications ─────────────────────────────────────────────────────────
  document.querySelector('#mark-all-read')?.addEventListener('click', () => {
    state.notifications.forEach(n => n.read = true); render();
  });
  document.querySelectorAll('[data-read-notif]').forEach(btn =>
    btn.addEventListener('click', () => {
      const n = state.notifications.find(n => n.id === Number(btn.dataset.readNotif));
      if (n) { n.read = true; render(); }
    }));
  document.querySelectorAll('[data-del-notif]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.notifications = state.notifications.filter(n => n.id !== Number(btn.dataset.delNotif));
      render();
    }));
  const notifDialog = document.querySelector('#notif-dialog');
  document.querySelector('#add-notif-btn')?.addEventListener('click', () => {
    // set datetime-local default to now+1h
    const dt = document.querySelector('#notif-dialog [name=time]');
    if (dt) { const d = new Date(Date.now()+3600000); dt.value = d.toISOString().slice(0,16); }
    notifDialog.showModal();
  });
  document.querySelector('#notif-close')?.addEventListener('click', () => notifDialog.close());
  document.querySelector('#notif-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const timeVal = data.get('time');
    const notif = {
      id:    state.nextNotifId++,
      title: data.get('title'),
      body:  data.get('body') || '',
      read:  false,
      time:  timeVal ? new Date(timeVal).toISOString() : new Date().toISOString(),
    };
    state.notifications.unshift(notif);
    // fire browser notification if permitted and time is now/past
    if (timeVal && new Date(timeVal) <= new Date()) {
      if (Notification.permission === 'granted') {
        new Notification(notif.title, { body: notif.body });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(p => { if (p === 'granted') new Notification(notif.title, { body: notif.body }); });
      }
    }
    notifDialog.close();
    e.currentTarget.reset();
    render();
  });
  // ── Profiles ─────────────────────────────────────────────────────────────
  document.querySelectorAll('[data-del-profile]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.profiles.splice(Number(btn.dataset.delProfile), 1);
      render();
    }));
  const profileDialog = document.querySelector('#profile-dialog');
  document.querySelector('#add-profile-btn')?.addEventListener('click', () => profileDialog.showModal());
  document.querySelector('#profile-close')?.addEventListener('click', () => profileDialog.close());
  document.querySelector('#profile-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    state.profiles.push({ name: data.get('name'), emoji: data.get('emoji') || '🧑', color: data.get('color') });
    profileDialog.close();
    e.currentTarget.reset();
    render();
  });
}

// ── boot ──────────────────────────────────────────────────────────────────────

loadState();
render();
