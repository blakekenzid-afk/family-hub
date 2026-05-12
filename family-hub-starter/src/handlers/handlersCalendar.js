// Calendar handlers
import { getEmojiForCategory, EVENT_CATEGORY_EMOJIS } from '../utils/constants.js';

export function setupCalendar(state, render) {
  const calDialog = document.querySelector('#cal-dialog');
  const dayDetailDialog = document.querySelector('#cal-day-detail-dialog');

  // Helper to render day detail events
  function renderDayDetailEvents(iso) {
    const evts = state.events.filter(e => e.date === iso);
    const dateFormatter = new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
    document.querySelector('#cal-day-detail-date').textContent = dateFormatter;

    const eventsHtml = evts.map(e => {
      const person = state.profiles.find(p => p.id === e.personId);
      const personName = person?.name || 'Family';
      return `
        <div class="day-detail-event">
          <span class="event-emoji">${e.emoji || '📅'}</span>
          <div class="event-info">
            <div class="event-title">${e.title}</div>
            <div class="event-meta">${e.time || 'Anytime'} • ${personName} • ${e.category || 'other'}</div>
          </div>
          <button class="day-detail-edit" data-edit-detail-event="${e.id}" type="button" style="padding:4px 8px;font-size:0.9rem">✏️</button>
          <button class="day-detail-delete" data-del-detail-event="${e.id}" type="button" style="padding:4px 6px;font-size:0.9rem">×</button>
        </div>`;
    }).join('');

    document.querySelector('#cal-day-detail-events').innerHTML = eventsHtml || '<p style="color:var(--muted);text-align:center;padding:20px">No events</p>';
  }

  // Day detail dialog handlers
  document.querySelectorAll('[data-day-detail]').forEach(el =>
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const iso = el.dataset.dayDetail;
      renderDayDetailEvents(iso);
      dayDetailDialog.showModal();
    }));

  document.querySelector('#cal-day-detail-close')?.addEventListener('click', () => dayDetailDialog.close());

  // Edit event from day detail
  document.addEventListener('click', (e) => {
    if (e.target.matches('[data-edit-detail-event]')) {
      e.stopPropagation();
      const eventId = Number(e.target.dataset.editDetailEvent);
      const event = state.events.find(ev => ev.id === eventId);
      if (!event) return;

      // Pre-fill form with event data
      const dateInput = document.querySelector('#cal-date-input');
      if (dateInput) dateInput.value = event.date;
      document.querySelector('#cal-form [name=title]').value = event.title;
      document.querySelector('#cal-form [name=category]').value = event.category || 'other';
      document.querySelector('#cal-form [name=emoji]').value = event.emoji || getEmojiForCategory(event.category || 'other');
      document.querySelector('#cal-form [name=time]').value = event.time || '';
      document.querySelector('#cal-form [name=personId]').value = event.personId || '';

      // Mark form for update instead of create
      document.querySelector('#cal-form').dataset.editEventId = eventId;

      dayDetailDialog.close();
      calDialog.showModal();
    }
  });

  // Delete event from day detail
  document.addEventListener('click', (e) => {
    if (e.target.matches('[data-del-detail-event]')) {
      e.stopPropagation();
      const eventId = Number(e.target.dataset.delDetailEvent);
      state.events = state.events.filter(ev => ev.id !== eventId);
      const iso = document.querySelector('#cal-day-detail-date').parentElement.dataset.dayDetail;
      renderDayDetailEvents(iso);
      render();
    }
  });

  // Category change handler - update emoji suggestion
  document.querySelector('#cal-form [name=category]')?.addEventListener('change', function() {
    const emojiInput = document.querySelector('#cal-form [name=emoji]');
    if (emojiInput && !emojiInput.value) {
      emojiInput.placeholder = getEmojiForCategory(this.value);
    }
  });

  // Calendar cell click handler
  document.querySelectorAll('[data-cal-date]').forEach(cell =>
    cell.addEventListener('click', e => {
      if (e.target.closest('[data-del-event]')) return;
      if (e.target.closest('[data-day-detail]')) return;

      const evts = state.events.filter(ev => ev.date === cell.dataset.calDate);

      // If multiple events, open day detail; if one or zero, open new event form
      if (evts.length > 1) {
        renderDayDetailEvents(cell.dataset.calDate);
        dayDetailDialog.showModal();
      } else {
        document.querySelector('#cal-form').dataset.editEventId = '';
        const dateInput = document.querySelector('#cal-date-input');
        if (dateInput) dateInput.value = cell.dataset.calDate;
        document.querySelector('#cal-form').reset();
        calDialog.showModal();
      }
    }));

  document.querySelector('#cal-close')?.addEventListener('click', () => calDialog.close());

  document.querySelector('#cal-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const editEventId = e.currentTarget.dataset.editEventId;

    const eventData = {
      title: data.get('title'),
      date: data.get('date'),
      time: data.get('time') || 'Anytime',
      person: data.get('person') || 'Family', // Keep for backward compat
      category: data.get('category') || 'other',
      emoji: data.get('emoji') || getEmojiForCategory(data.get('category') || 'other'),
      personId: data.get('personId') || null
    };

    if (editEventId) {
      // Update existing event
      const event = state.events.find(ev => ev.id === Number(editEventId));
      if (event) Object.assign(event, eventData);
      e.currentTarget.dataset.editEventId = '';
    } else {
      // Create new event
      state.events.push({ id: state.nextEventId++, ...eventData });
    }

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
}
