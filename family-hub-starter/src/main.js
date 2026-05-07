import './styles.css';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const FAMILY = [
  { name: 'Mom',  emoji: '👩', color: 'lavender' },
  { name: 'Dad',  emoji: '👨', color: 'blue' },
  { name: 'Ava',  emoji: '👧', color: 'pink' },
  { name: 'Leo',  emoji: '👦', color: 'green' },
];

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
  tasks: [
    { id: 1,  person: 'Mom', timeOfDay: 'morning',   emoji: '☕', title: 'Morning planning',   done: false },
    { id: 2,  person: 'Mom', timeOfDay: 'afternoon',  emoji: '🧺', title: 'Do laundry',         done: false },
    { id: 3,  person: 'Mom', timeOfDay: 'evening',    emoji: '🍳', title: 'Cook dinner',         done: false },
    { id: 4,  person: 'Dad', timeOfDay: 'morning',   emoji: '🚗', title: 'School drop-off',     done: false },
    { id: 5,  person: 'Dad', timeOfDay: 'evening',    emoji: '🗑️', title: 'Take out trash',      done: false },
    { id: 6,  person: 'Ava', timeOfDay: 'morning',   emoji: '🪥', title: 'Brush teeth',         done: false },
    { id: 7,  person: 'Ava', timeOfDay: 'afternoon',  emoji: '🎹', title: 'Piano practice',      done: false },
    { id: 8,  person: 'Leo', timeOfDay: 'morning',   emoji: '🪥', title: 'Brush teeth',         done: false },
    { id: 9,  person: 'Leo', timeOfDay: 'evening',    emoji: '🛁', title: 'Bath time',           done: false },
  ],
  events: [
    { date: todayStr(), title: 'Piano lesson',   time: '4:00 PM', person: 'Ava' },
    { date: todayStr(), title: 'Soccer practice', time: '5:30 PM', person: 'Leo' },
  ],
  meals: [
    { day: 'Mon', meal: 'Chicken bowls' },
    { day: 'Tue', meal: 'Pasta night' },
    { day: 'Wed', meal: 'Breakfast for dinner' },
    { day: 'Thu', meal: 'Slow cooker soup' },
    { day: 'Fri', meal: 'Pizza + movie night' },
  ],
  groceries: [
    { category: 'Produce',    items: ['Strawberries', 'Apples'] },
    { category: 'Dairy',      items: ['Milk', 'Yogurt'] },
    { category: 'Pantry',     items: ['Bread', 'Granola bars'] },
  ],
  lists: [
    { id: 1, name: 'School supplies', items: ['Pencils', 'Notebook', 'Backpack'] },
    { id: 2, name: 'Birthday wish list', items: ['Legos', 'Art supplies'] },
    { id: 3, name: 'Camping packing', items: ['Tent', 'Sleeping bags', 'Flashlight'] },
  ],
  nextTaskId: 10,
  nextListId: 4,
  editingMealIdx: null,
  profiles: [
    { name: 'Mom',  emoji: '👩', color: 'lavender' },
    { name: 'Dad',  emoji: '👨', color: 'blue' },
    { name: 'Ava',  emoji: '👧', color: 'pink' },
    { name: 'Leo',  emoji: '👦', color: 'green' },
  ],
  budget: {
    monthly: 3500,
    categories: [
      { name: 'Groceries',   icon: '🛒', budgeted: 600,  spent: 312 },
      { name: 'Dining out',  icon: '🍕', budgeted: 200,  spent: 87  },
      { name: 'Activities',  icon: '🎨', budgeted: 150,  spent: 60  },
      { name: 'Household',   icon: '🏠', budgeted: 400,  spent: 220 },
      { name: 'Transport',   icon: '🚗', budgeted: 300,  spent: 145 },
    ],
    transactions: [
      { date: todayStr(), desc: 'Trader Joe\'s', amount: 78.42,  category: 'Groceries'  },
      { date: todayStr(), desc: 'Soccer cleats',  amount: 45.00,  category: 'Activities' },
      { date: todayStr(), desc: 'Pizza Friday',   amount: 32.50,  category: 'Dining out' },
    ],
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
  return `
    <div class="page home-page">
      <header class="app-header">
        <span class="header-spacer"></span>
        <button class="family-name-btn" type="button">diskey <span class="chevron">⌄</span></button>
        <button class="account-btn" type="button" aria-label="Account">👤</button>
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
      <header class="tasks-header">
        <button class="back-btn" type="button" data-nav="home">←</button>
        <h1 class="tasks-date">${fmtShort(state.currentDate)}</h1>
        <div class="tasks-nav">
          <button class="icon-btn" id="prev-day">‹</button>
          <button class="icon-btn" id="today-btn">Today</button>
          <button class="icon-btn" id="next-day">›</button>
        </div>
      </header>
      <div class="persons-grid">
        ${FAMILY.map(renderPersonCard).join('')}
      </div>
      <button class="fab" id="open-task-dialog" type="button" aria-label="Add task">+</button>
      <dialog class="event-dialog" id="task-dialog">
        <form class="dialog-card" id="task-form">
          <button class="close-btn" type="button" id="task-close">×</button>
          <p class="eyebrow">New Task</p>
          <label>Person
            <select name="person">
              ${FAMILY.map(p => `<option>${p.name}</option>`).join('')}
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
  return `
    <div class="page">
      <header class="tasks-header">
        <button class="back-btn" type="button" data-nav="home">←</button>
        <h1 class="tasks-date">Meals This Week</h1>
        <div class="tasks-nav"></div>
      </header>
      <div class="simple-list">
        ${state.meals.map((m, i) => state.editingMealIdx === i
          ? `<div class="simple-row">
               <span class="simple-day">${m.day}</span>
               <form class="meal-edit-form" data-meal-idx="${i}">
                 <input class="meal-edit-input" name="meal" value="${m.meal}" required autofocus>
                 <button class="icon-btn" type="submit">✓</button>
               </form>
             </div>`
          : `<div class="simple-row">
               <span class="simple-day">${m.day}</span>
               <span class="simple-meal">${m.meal}</span>
               <button class="edit-icon-btn" data-edit-meal="${i}" type="button">✏️</button>
             </div>`
        ).join('')}
      </div>
    </div>`;
}

function renderGroceries() {
  return `
    <div class="page">
      <header class="tasks-header">
        <button class="back-btn" type="button" data-nav="home">←</button>
        <h1 class="tasks-date">Grocery List</h1>
        <div class="tasks-nav"></div>
      </header>
      ${state.groceries.map((cat, ci) => `
        <div class="grocery-cat-block">
          <h3 class="section-label">${cat.category}</h3>
          <div class="item-list">
            ${cat.items.map((item, ii) => `
              <div class="item-row">
                <span>🛒 ${item}</span>
                <button class="del-sm" data-del-grocery-item data-ci="${ci}" data-ii="${ii}" type="button" aria-label="Remove">×</button>
              </div>`).join('')}
          </div>
          <form class="add-item-form" data-add-grocery="${ci}">
            <input name="item" placeholder="Add to ${cat.category}..." required>
            <button type="submit" class="add-item-submit">Add</button>
          </form>
        </div>`).join('')}
      <form class="add-item-form" id="add-grocery-cat-form" style="margin-top:8px">
        <input name="cat" placeholder="New category name..." required>
        <button type="submit" class="add-item-submit">+ Category</button>
      </form>
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
                    <button class="cal-evt-del" data-del-event="${state.events.indexOf(e)}" type="button" aria-label="Remove">×</button>
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
        ${state.lists.map(list => `
          <div class="list-card">
            <h3 class="list-card-title">${list.name}</h3>
            <div class="list-items">
              ${list.items.map((item, i) => `
                <div class="list-item-row">
                  <span>${item}</span>
                  <button class="del-sm" data-del-list-item="${list.id}" data-item-idx="${i}" type="button" aria-label="Remove">×</button>
                </div>`).join('')}
            </div>
            <form class="add-item-form" data-add-list="${list.id}">
              <input name="item" placeholder="Add item..." required>
              <button type="submit" class="add-item-submit">Add</button>
            </form>
          </div>`).join('')}
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
    </div>`;
}

function renderBudget() {
  const { monthly, categories, transactions } = state.budget;
  const totalSpent = categories.reduce((s, c) => s + c.spent, 0);
  const totalBudgeted = categories.reduce((s, c) => s + c.budgeted, 0);
  const overallPct = Math.min(100, Math.round((totalSpent / totalBudgeted) * 100));

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
      </div>

      <h3 class="section-label">Categories</h3>
      <div class="budget-cats">
        ${categories.map(cat => {
          const pct = Math.min(100, Math.round((cat.spent / cat.budgeted) * 100));
          const over = cat.spent > cat.budgeted;
          return `
            <div class="budget-cat">
              <div class="budget-cat-icon">${cat.icon}</div>
              <div class="budget-cat-info">
                <div class="budget-cat-top">
                  <span class="budget-cat-name">${cat.name}</span>
                  <span class="budget-cat-amt${over ? ' over' : ''}">$${cat.spent} / $${cat.budgeted}</span>
                </div>
                <div class="budget-bar-wrap sm">
                  <div class="budget-bar-fill${over ? ' over' : ''}" style="width:${pct}%"></div>
                </div>
              </div>
            </div>`;
        }).join('')}
      </div>

      <h3 class="section-label">Recent Transactions</h3>
      <div class="txn-list">
        ${transactions.slice().reverse().map((t, ri) => {
          const realIdx = transactions.length - 1 - ri;
          return `
          <div class="txn-row">
            <div class="txn-left">
              <span class="txn-desc">${t.desc}</span>
              <span class="txn-cat">${t.category}</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
              <span class="txn-amt">-$${t.amount.toFixed(2)}</span>
              <button class="del-sm" data-del-txn="${realIdx}" type="button" aria-label="Delete">×</button>
            </div>
          </div>`;}).join('')}
      </div>

      <button class="add-txn-btn" id="add-txn-btn" type="button">+ Add Transaction</button>

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
            </select>
          </label>
          <button class="primary-btn full" type="submit">Add Person</button>
        </form>
      </dialog>
    </div>`;
}

// ── render + bind ─────────────────────────────────────────────────────────────

function render() {
  const app = document.querySelector('#app');
  switch (state.view) {
    case 'tasks':     app.innerHTML = renderTasks();     break;
    case 'meals':     app.innerHTML = renderMeals();     break;
    case 'groceries': app.innerHTML = renderGroceries(); break;
    case 'calendar':  app.innerHTML = renderCalendar();  break;
    case 'lists':     app.innerHTML = renderLists();      break;
    case 'budget':    app.innerHTML = renderBudget();     break;
    case 'profiles':  app.innerHTML = renderProfiles();   break;
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

  // ── Groceries (categorised) ─────────────────────────────────────────────────────
  document.querySelectorAll('[data-del-grocery-item]').forEach(btn =>
    btn.addEventListener('click', () => {
      const ci = Number(btn.dataset.ci), ii = Number(btn.dataset.ii);
      state.groceries[ci].items.splice(ii, 1);
      render();
    }));
  document.querySelectorAll('[data-add-grocery]').forEach(form =>
    form.addEventListener('submit', e => {
      e.preventDefault();
      const ci = Number(form.dataset.addGrocery);
      const item = new FormData(e.currentTarget).get('item').trim();
      if (item) { state.groceries[ci].items.push(item); render(); }
    }));
  document.querySelector('#add-grocery-cat-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = new FormData(e.currentTarget).get('cat').trim();
    if (name) { state.groceries.push({ category: name, items: [] }); render(); }
  });

  // ── Lists ─────────────────────────────────────────────────────────────────
  document.querySelectorAll('[data-del-list-item]').forEach(btn =>
    btn.addEventListener('click', () => {
      const list = state.lists.find(l => l.id === Number(btn.dataset.delListItem));
      if (list) { list.items.splice(Number(btn.dataset.itemIdx), 1); render(); }
    }));
  document.querySelectorAll('[data-add-list]').forEach(form =>
    form.addEventListener('submit', e => {
      e.preventDefault();
      const list = state.lists.find(l => l.id === Number(form.dataset.addList));
      const item = new FormData(e.currentTarget).get('item').trim();
      if (list && item) { list.items.push(item); render(); }
    }));
  const newListDialog = document.querySelector('#new-list-dialog');
  document.querySelector('#add-list-btn')?.addEventListener('click', () => newListDialog.showModal());
  document.querySelector('#new-list-close')?.addEventListener('click', () => newListDialog.close());
  document.querySelector('#new-list-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = new FormData(e.currentTarget).get('name').trim();
    if (name) { state.lists.push({ id: state.nextListId++, name, items: [] }); newListDialog.close(); render(); }
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
    state.events.push({ title: data.get('title'), date: data.get('date'), time: data.get('time') || 'Anytime', person: data.get('person') || 'Family' });
    calDialog.close();
    render();
  });
  document.querySelectorAll('[data-del-event]').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      state.events.splice(Number(btn.dataset.delEvent), 1);
      render();
    }));

  // ── Budget ──────────────────────────────────────────────────────────────
  document.querySelectorAll('[data-del-txn]').forEach(btn =>
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.delTxn);
      const txn = state.budget.transactions[idx];
      const cat = state.budget.categories.find(c => c.name === txn.category);
      if (cat) cat.spent = Math.max(0, Math.round((cat.spent - txn.amount) * 100) / 100);
      state.budget.transactions.splice(idx, 1);
      render();
    }));
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
    txnDialog.close();
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
    render();
  });
}

// ── boot ──────────────────────────────────────────────────────────────────────

render();
