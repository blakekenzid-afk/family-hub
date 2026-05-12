import { state } from '../main.js';
import { todayStr, getEmojiForCategory } from '../utils/constants.js';

export function renderCalendar() {
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

  // Helper to get person color class
  const getPersonColor = (personId) => {
    if (!personId) return 'lavender';
    const person = state.profiles.find(p => p.id === personId);
    return person?.color || 'lavender';
  };

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

            let eventHtml = '';
            if (evts.length === 0) {
              eventHtml = '';
            } else if (evts.length === 1) {
              const e = evts[0];
              const color = getPersonColor(e.personId);
              eventHtml = `
                <div class="cal-evt ${color}" data-cal-date="${iso}">
                  ${e.emoji || '📅'} ${e.title}
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
      </div>

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
