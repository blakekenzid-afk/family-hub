import { state } from '../main.js';
import { todayStr, getEmojiForCategory, escapeHtml } from '../utils/constants.js';

// Helper to get person color class
const getPersonColor = (personId) => {
  if (!personId) return 'lavender';
  const person = state.profiles.find(p => p.id === personId);
  return person?.color || 'lavender';
};

// Helper: Get Monday of week containing date
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
};

// Helper: Parse time string to hour (0-23)
const parseTimeToHour = (timeStr) => {
  if (!timeStr || timeStr === 'Anytime') return null;
  const match = timeStr.match(/(\d+):?(\d+)?\s*([AP]M)?/i);
  if (!match) return null;
  let hour = parseInt(match[1]);
  if (match[3]?.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (match[3]?.toUpperCase() === 'AM' && hour === 12) hour = 0;
  return hour;
};

// Helper: Format week label
const formatWeekLabel = (date) => {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const startStr = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startStr} - ${endStr}`;
};

// Helper: Format day label
const formatDayLabel = (date) => {
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};

function renderMonthView() {
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

  const headersHtml = `
    <header class="tasks-header">
      <button class="back-btn" type="button" data-nav="home">←</button>
      <h1 class="tasks-date">${monthLabel}</h1>
      <div class="tasks-nav">
        <button class="icon-btn" id="cal-today" title="Today">◉</button>
        <button class="icon-btn" id="cal-prev">‹</button>
        <button class="icon-btn" id="cal-next">›</button>
      </div>
    </header>`;

  const gridHtml = `
    <div class="cal-grid-wrap">
      <div class="cal-weekdays">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<span>${d}</span>`).join('')}</div>
      <div class="cal-grid">
        ${days.map(day => {
          const iso = day.toISOString().slice(0,10);
          const inMonth = day.getMonth() === month;
          const isToday = iso === todayISO;
          const evts = state.events.filter(e => e.date === iso);

          let eventHtml = '';
          if (evts.length === 0) {
            eventHtml = '';
          } else if (evts.length === 1) {
            const e = evts[0];
            const color = getPersonColor(e.personId);
            eventHtml = `
              <div class="cal-evt ${color}" data-cal-date="${iso}">
                ${e.emoji || '📅'} ${escapeHtml(e.title)}
                <button class="cal-evt-del" data-del-event="${e.id}" type="button" aria-label="Remove">×</button>
              </div>`;
          } else {
            const firstEmoji = evts[0].emoji || '📅';
            eventHtml = `<div class="cal-evt-badge" data-day-detail="${iso}" title="Click to see ${evts.length} events">${firstEmoji} ${evts.length}</div>`;
          }

          return `
            <div class="cal-cell${inMonth ? '' : ' out'}${isToday ? ' today' : ''}" data-cal-date="${iso}">
              <span class="cal-num">${day.getDate()}</span>
              ${eventHtml}
            </div>`;
        }).join('')}
      </div>
    </div>`;

  return { headersHtml, gridHtml };
}

function renderWeekView() {
  const weekStart = getWeekStart(state.currentDate);
  const weekLabel = formatWeekLabel(state.currentDate);
  const todayISO = todayStr();

  const headersHtml = `
    <header class="tasks-header">
      <button class="back-btn" type="button" data-nav="home">←</button>
      <h1 class="tasks-date">${weekLabel}</h1>
      <div class="tasks-nav">
        <button class="icon-btn" id="cal-today" title="Today">◉</button>
        <button class="icon-btn" id="cal-prev">‹</button>
        <button class="icon-btn" id="cal-next">›</button>
      </div>
    </header>`;

  const days = Array.from({length: 7}, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const daysCells = days.map(day => {
    const iso = day.toISOString().slice(0,10);
    const isToday = iso === todayISO;
    const evts = state.events.filter(e => e.date === iso);
    const dayName = day.toLocaleDateString(undefined, { weekday: 'short' });
    const dayNum = day.getDate();

    let eventsHtml = '';
    if (evts.length === 0) {
      eventsHtml = '';
    } else if (evts.length === 1) {
      const e = evts[0];
      const color = getPersonColor(e.personId);
      eventsHtml = `<div class="cal-evt ${color} cal-week-evt" data-cal-date="${iso}">${e.emoji || '📅'} ${escapeHtml(e.title)}</div>`;
    } else {
      const firstEmoji = evts[0].emoji || '📅';
      eventsHtml = `<div class="cal-evt-badge cal-week-evt" data-day-detail="${iso}" title="Click to see ${evts.length} events">${firstEmoji} ${evts.length}</div>`;
    }

    return `
      <div class="cal-week-day${isToday ? ' today' : ''}" data-cal-date="${iso}">
        <div class="cal-week-date">${dayName} ${dayNum}</div>
        <div class="cal-week-events">${eventsHtml}</div>
      </div>`;
  }).join('');

  const gridHtml = `
    <div class="cal-week-grid-wrap">
      <div class="cal-week-grid">${daysCells}</div>
    </div>`;

  return { headersHtml, gridHtml };
}

function renderDayView() {
  const dayLabel = formatDayLabel(state.currentDate);
  const dayISO = state.currentDate.toISOString().slice(0,10);
  const todayISO = todayStr();

  const headersHtml = `
    <header class="tasks-header">
      <button class="back-btn" type="button" data-nav="home">←</button>
      <h1 class="tasks-date">${dayLabel}</h1>
      <div class="tasks-nav">
        <button class="icon-btn" id="cal-today" title="Today">◉</button>
        <button class="icon-btn" id="cal-prev">‹</button>
        <button class="icon-btn" id="cal-next">›</button>
      </div>
    </header>`;

  const allEvts = state.events.filter(e => e.date === dayISO);
  const allDayEvts = allEvts.filter(e => !e.time || e.time === 'Anytime');
  const timedEvts = allEvts.filter(e => e.time && e.time !== 'Anytime');

  let gridHtml = '<div class="cal-day-grid-wrap"><div class="cal-day-grid">';

  // All day section
  if (allDayEvts.length > 0) {
    gridHtml += `
      <div class="cal-day-all-day">
        <div class="cal-day-all-day-label">All Day</div>
        <div class="cal-day-all-day-events">
          ${allDayEvts.map(e => `
            <div class="cal-day-event-item ${getPersonColor(e.personId)}" data-event-id="${e.id}">
              <span>${e.emoji || '📅'}</span> ${escapeHtml(e.title)}
            </div>`).join('')}
        </div>
      </div>`;
  }

  // Hourly grid (8am-8pm)
  gridHtml += '<div class="cal-day-times">';
  gridHtml += '<div class="cal-day-time-col">';
  for (let h = 8; h <= 20; h++) {
    const timeStr = h < 12 ? `${h}am` : (h === 12 ? '12pm' : `${h-12}pm`);
    gridHtml += `<div class="cal-day-hour-label">${timeStr}</div>`;
  }
  gridHtml += '</div>';

  gridHtml += '<div class="cal-day-hours">';
  for (let h = 8; h <= 20; h++) {
    const hourEvts = timedEvts.filter(e => parseTimeToHour(e.time) === h);
    gridHtml += `<div class="cal-day-hour" data-hour="${h}">`;
    if (hourEvts.length > 0) {
      gridHtml += hourEvts.map(e => `
        <div class="cal-day-event-item ${getPersonColor(e.personId)}" data-event-id="${e.id}">
          <span>${e.emoji || '📅'}</span> ${escapeHtml(e.title)}
        </div>`).join('');
    }
    gridHtml += '</div>';
  }
  gridHtml += '</div>';

  gridHtml += '</div></div></div>'; // Close cal-day-times, cal-day-grid, cal-day-grid-wrap

  return { headersHtml, gridHtml };
}

export function renderCalendar() {
  let headersHtml = '';
  let gridHtml = '';
  const todayISO = todayStr();

  switch(state.calendarViewMode) {
    case 'week': {
      const result = renderWeekView();
      headersHtml = result.headersHtml;
      gridHtml = result.gridHtml;
      break;
    }
    case 'day': {
      const result = renderDayView();
      headersHtml = result.headersHtml;
      gridHtml = result.gridHtml;
      break;
    }
    default: { // month
      const result = renderMonthView();
      headersHtml = result.headersHtml;
      gridHtml = result.gridHtml;
    }
  }

  return `
    <div class="page">
      ${headersHtml}

      <!-- View tabs -->
      <div class="cal-view-tabs">
        <button class="cal-tab${state.calendarViewMode === 'month' ? ' active' : ''}" data-cal-view="month">Month</button>
        <button class="cal-tab${state.calendarViewMode === 'week' ? ' active' : ''}" data-cal-view="week">Week</button>
        <button class="cal-tab${state.calendarViewMode === 'day' ? ' active' : ''}" data-cal-view="day">Day</button>
      </div>

      ${gridHtml}

      <!-- Day Detail Dialog -->
      <dialog class="event-dialog" id="cal-day-detail-dialog">
        <form class="dialog-card" id="cal-day-detail-card">
          <button class="close-btn" type="button" id="cal-day-detail-close">×</button>
          <h2 id="cal-day-detail-date" style="margin-bottom:16px"></h2>
          <div id="cal-day-detail-events" style="max-height:400px;overflow-y:auto"></div>
        </form>
      </dialog>

      <!-- New Event Dialog -->
      <dialog class="event-dialog" id="cal-dialog">
        <form class="dialog-card" id="cal-form">
          <button class="close-btn" type="button" id="cal-close">×</button>
          <p class="eyebrow">New Event</p>
          <label>Title <input required name="title" placeholder="Dentist appointment"></label>
          <label>Category
            <select name="category">
              <option value="other">Other</option>
              <option value="birthday">Birthday</option>
              <option value="appointment">Appointment</option>
              <option value="holiday">Holiday</option>
              <option value="vacation">Vacation</option>
            </select>
          </label>
          <label>Emoji <input name="emoji" placeholder="📅" maxlength="2"></label>
          <label>Date <input required name="date" type="date" id="cal-date-input"></label>
          <label>Time <input name="time" placeholder="3:30 PM"></label>
          <label>Person
            <select name="personId">
              <option value="">Family</option>
              ${state.profiles.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
          </label>
          <button class="primary-btn full" type="submit">Save Event</button>
        </form>
      </dialog>
    </div>`;
}
