import './styles.css';

const state = {
  currentDate: new Date(),
  selectedDate: new Date(),
  family: [
    { name: 'Mom', initial: 'M', color: 'rose' },
    { name: 'Dad', initial: 'D', color: 'blue' },
    { name: 'Ava', initial: 'A', color: 'yellow' },
    { name: 'Leo', initial: 'L', color: 'green' }
  ],
  events: [
    { date: todayOffset(0), title: 'Piano lesson', time: '4:00 PM', person: 'Ava', type: 'activity' },
    { date: todayOffset(0), title: 'Taco night', time: '6:00 PM', person: 'Family', type: 'meal' },
    { date: todayOffset(1), title: 'Library books due', time: 'All day', person: 'Family', type: 'reminder' },
    { date: todayOffset(2), title: 'Soccer practice', time: '5:30 PM', person: 'Leo', type: 'activity' }
  ],
  chores: [
    { title: 'Feed the dog', assignee: 'Leo', done: false },
    { title: 'Clear table', assignee: 'Ava', done: true },
    { title: 'Pack lunches', assignee: 'Mom', done: false }
  ],
  meals: [
    { day: 'Mon', meal: 'Chicken bowls' },
    { day: 'Tue', meal: 'Pasta night' },
    { day: 'Wed', meal: 'Breakfast for dinner' },
    { day: 'Thu', meal: 'Slow cooker soup' },
    { day: 'Fri', meal: 'Pizza + movie' }
  ],
  groceries: ['Milk', 'Strawberries', 'Bread', 'Granola bars']
};

function todayOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function sameDay(a, b) {
  return toISODate(a) === toISODate(b);
}

function formatMonth(date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function getMonthDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function eventsForDate(date) {
  return state.events.filter(event => event.date === toISODate(date));
}

function renderAgenda() {
  const items = eventsForDate(state.selectedDate);
  if (!items.length) {
    return '<div class="empty-state">🌤️ Nothing planned yet.<br><span>Add something cozy.</span></div>';
  }

  return items.map(event => `
    <div class="agenda-card ${event.type}">
      <div class="time-badge">${event.time || 'Anytime'}</div>
      <div>
        <strong>${event.title}</strong>
        <small>${event.person}</small>
      </div>
    </div>
  `).join('');
}

function render() {
  document.querySelector('#app').innerHTML = `
    <main class="shell">
      <aside class="sidebar">
        <div class="brand-card">
          <div class="brand-icon">🏡</div>
          <div>
            <p class="eyebrow">Family Hub</p>
            <h1>Today at Home</h1>
          </div>
        </div>

        <nav class="nav-stack" aria-label="Main navigation">
          ${['Dashboard', 'Calendar', 'Meals', 'Chores', 'Lists'].map((item, i) => `
            <button class="nav-pill ${i === 0 ? 'active' : ''}" type="button">
              <span>${['✨','📅','🍽️','🧺','🛒'][i]}</span>${item}
            </button>
          `).join('')}
        </nav>

        <section class="mini-card">
          <p class="eyebrow">Family</p>
          <div class="avatar-row">
            ${state.family.map(person => `<div class="avatar ${person.color}" title="${person.name}">${person.initial}</div>`).join('')}
          </div>
        </section>
      </aside>

      <section class="content">
        <header class="hero">
          <div>
            <p class="eyebrow">${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h2>Everything your family needs, all in one cozy place.</h2>
          </div>
          <button class="primary-btn" type="button" id="add-event-btn">+ Add Event</button>
        </header>

        <section class="dashboard-grid">
          <article class="panel calendar-panel">
            <div class="panel-header">
              <button class="circle-btn" id="prev-month" aria-label="Previous month">‹</button>
              <h3>${formatMonth(state.currentDate)}</h3>
              <button class="circle-btn" id="next-month" aria-label="Next month">›</button>
            </div>
            <div class="weekdays">
              ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => `<span>${day}</span>`).join('')}
            </div>
            <div class="calendar-grid">
              ${getMonthDays(state.currentDate).map(day => {
                const inMonth = day.getMonth() === state.currentDate.getMonth();
                const selected = sameDay(day, state.selectedDate);
                const today = sameDay(day, new Date());
                const dots = eventsForDate(day).slice(0, 3).map(() => '<i></i>').join('');
                return `
                  <button class="day-cell ${inMonth ? '' : 'muted'} ${selected ? 'selected' : ''} ${today ? 'today' : ''}" data-date="${toISODate(day)}">
                    <span>${day.getDate()}</span>
                    <div class="event-dots">${dots}</div>
                  </button>
                `;
              }).join('')}
            </div>
          </article>

          <article class="panel agenda-panel">
            <div class="panel-header left">
              <div><p class="eyebrow">Agenda</p><h3>${state.selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h3></div>
            </div>
            <div class="agenda-list">${renderAgenda()}</div>
          </article>

          <article class="panel chore-panel">
            <div class="panel-header left"><div><p class="eyebrow">Chores</p><h3>Household Helpers</h3></div></div>
            <div class="task-list">
              ${state.chores.map((chore, index) => `
                <label class="task-card">
                  <input type="checkbox" data-chore="${index}" ${chore.done ? 'checked' : ''}>
                  <span class="checkmark"></span>
                  <div><strong>${chore.title}</strong><small>${chore.assignee}</small></div>
                </label>
              `).join('')}
            </div>
          </article>

          <article class="panel meals-panel">
            <div class="panel-header left"><div><p class="eyebrow">Meals</p><h3>This Week</h3></div></div>
            <div class="meal-list">
              ${state.meals.map(item => `<div class="meal-row"><span>${item.day}</span><strong>${item.meal}</strong></div>`).join('')}
            </div>
          </article>

          <article class="panel grocery-panel">
            <div class="panel-header left"><div><p class="eyebrow">Groceries</p><h3>Quick List</h3></div></div>
            <ul class="grocery-list">${state.groceries.map(item => `<li>${item}</li>`).join('')}</ul>
          </article>
        </section>
      </section>
    </main>

    <dialog class="event-dialog" id="event-dialog">
      <form method="dialog" class="dialog-card" id="event-form">
        <button class="close-btn" value="cancel" aria-label="Close">×</button>
        <p class="eyebrow">New Event</p>
        <h3>Add something to the family calendar</h3>
        <label>Title <input required name="title" placeholder="Dentist appointment"></label>
        <label>Date <input required name="date" type="date" value="${toISODate(state.selectedDate)}"></label>
        <label>Time <input name="time" placeholder="3:30 PM"></label>
        <label>Person <input name="person" placeholder="Family"></label>
        <button class="primary-btn full" value="default">Save Event</button>
      </form>
    </dialog>
  `;

  bindEvents();
}

function bindEvents() {
  document.querySelector('#prev-month').addEventListener('click', () => {
    state.currentDate.setMonth(state.currentDate.getMonth() - 1);
    render();
  });

  document.querySelector('#next-month').addEventListener('click', () => {
    state.currentDate.setMonth(state.currentDate.getMonth() + 1);
    render();
  });

  document.querySelectorAll('.day-cell').forEach(button => {
    button.addEventListener('click', () => {
      state.selectedDate = new Date(button.dataset.date + 'T12:00:00');
      render();
    });
  });

  document.querySelectorAll('[data-chore]').forEach(input => {
    input.addEventListener('change', () => {
      state.chores[Number(input.dataset.chore)].done = input.checked;
      render();
    });
  });

  const dialog = document.querySelector('#event-dialog');
  document.querySelector('#add-event-btn').addEventListener('click', () => dialog.showModal());

  document.querySelector('#event-form').addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.events.push({
      title: data.get('title'),
      date: data.get('date'),
      time: data.get('time') || 'Anytime',
      person: data.get('person') || 'Family',
      type: 'reminder'
    });
    dialog.close();
    render();
  });
}

render();
