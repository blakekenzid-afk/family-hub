import { state } from '../main.js';
import { todayStr, fmtLong, NAV_ITEMS } from '../utils/constants.js';

export function renderHome() {
  const today = todayStr();
  const in7 = new Date(); in7.setDate(in7.getDate() + 7);
  const in7str = in7.toISOString().slice(0, 10);

  // Upcoming events — today + next 7 days, sorted by date+time
  const upcomingEvents = state.events
    .filter(e => e.date >= today && e.date <= in7str)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));

  // Upcoming bills — unpaid, due within 14 days
  const in14 = new Date(); in14.setDate(in14.getDate() + 14);
  const in14str = in14.toISOString().slice(0, 10);
  const upcomingBills = state.bills
    .filter(b => !b.paid && b.dueDate <= in14str)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

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
        ${upcomingEvents.length === 0
          ? '<p class="no-events">No upcoming events this week 😌</p>'
          : `<ul class="event-list">
              ${upcomingEvents.map(e => {
                const isToday = e.date === today;
                const dateLabel = isToday ? 'Today' : new Date(e.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                return `
                <li class="event-row">
                  <span class="event-dot"></span>
                  <span class="event-time">${dateLabel}${e.time && e.time !== 'Anytime' ? ' · ' + e.time : ''}</span>
                  <span class="event-title">${e.title}</span>
                  <span class="event-person">${e.person || ''}</span>
                </li>`;
              }).join('')}
            </ul>`}
      </div>

      ${upcomingBills.length > 0 ? `
      <div class="today-card" style="margin-top:14px">
        <h2 class="today-date" style="font-size:1.1rem;margin-bottom:10px">💳 Upcoming Bills</h2>
        <ul class="event-list">
          ${upcomingBills.map(b => {
            const daysUntil = Math.ceil((new Date(b.dueDate) - new Date(today)) / 86400000);
            const overdue  = daysUntil < 0;
            const label    = overdue ? `${Math.abs(daysUntil)}d overdue` : daysUntil === 0 ? 'Due today' : `Due in ${daysUntil}d`;
            const color    = overdue ? '#e05c5c' : daysUntil <= 3 ? '#e07830' : 'var(--muted)';
            return `
            <li class="event-row">
              <span style="font-size:1.1rem">${b.emoji || '📄'}</span>
              <span class="event-title">${b.name}</span>
              <span style="margin-left:auto;font-weight:800;font-size:0.85rem;color:${color}">${label}</span>
              <span style="font-weight:800;font-size:0.92rem">$${Number(b.amount).toFixed(2)}</span>
            </li>`;
          }).join('')}
        </ul>
      </div>` : ''}
    </div>`;
}
