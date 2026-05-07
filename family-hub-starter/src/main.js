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
  groceries: ['Milk', 'Strawberries', 'Bread', 'Granola bars', 'Apples', 'Yogurt'],
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
        <button class="task-toggle${task.done ? ' checked' : ''}"
                data-task-toggle="${task.id}" type="button"
                aria-label="${task.done ? 'Mark incomplete' : 'Mark complete'}"></button>
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
      <button class="fab" type="button" aria-label="Add task">+</button>
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
        ${state.meals.map(m => `
          <div class="simple-row">
            <span class="simple-day">${m.day}</span>
            <span class="simple-meal">${m.meal}</span>
          </div>`).join('')}
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
      <div class="grocery-grid">
        ${state.groceries.map(item => `<div class="grocery-item">🛒 ${item}</div>`).join('')}
      </div>
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
              <div class="cal-cell${inMonth ? '' : ' out'}${isToday ? ' today' : ''}">
                <span class="cal-num">${day.getDate()}</span>
                ${evts.map(e => `<div class="cal-evt">${e.title}</div>`).join('')}
              </div>`;
          }).join('')}
        </div>
      </div>
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
      <div class="lists-placeholder">
        <div class="placeholder-card">📋 School supplies</div>
        <div class="placeholder-card">🎁 Birthday wish list</div>
        <div class="placeholder-card">🏕️ Camping packing list</div>
      </div>
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
        ${FAMILY.map(p => `
          <div class="profile-card ${p.color}">
            <div class="profile-avatar">${p.emoji}</div>
            <span class="profile-name">${p.name}</span>
          </div>`).join('')}
      </div>
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
}

// ── boot ──────────────────────────────────────────────────────────────────────

render();
