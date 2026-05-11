import { state } from '../main.js';
import { isDueToday, isCompletedToday, dayLabel, dayPickerHtml, TIME_LABELS } from '../utils/constants.js';

export function renderRoutines() {
  const dueToday = state.routines.filter(r => isDueToday(r));

  const byPerson = {};
  state.profiles.forEach(p => { byPerson[p.name] = []; });
  byPerson['Everyone'] = [];
  dueToday.forEach(r => {
    if (r.assignedTo === 'Everyone' || !r.assignedTo) byPerson['Everyone'].push(r);
    else if (byPerson[r.assignedTo] !== undefined) byPerson[r.assignedTo].push(r);
    else byPerson['Everyone'].push(r);
  });

  const sections = Object.entries(byPerson)
    .filter(([, list]) => list.length > 0)
    .map(([person, list]) => {
      const profile = state.profiles.find(p => p.name === person);
      return `
        <div class="routines-section">
          <h3 class="section-label">${profile ? profile.emoji + ' ' : ''}${person}</h3>
          ${list.map(r => {
            const done = isCompletedToday(r);
            return `
            <div class="routine-row${done ? ' routine-done' : ''}">
              <span class="routine-emoji">${r.emoji || '🔁'}</span>
              <div class="routine-info">
                <div class="routine-title">${r.title}</div>
                <div class="routine-meta">${dayLabel(r.days)} · ${r.reminderTime ? r.reminderTime : (TIME_LABELS[r.timeOfDay] || r.timeOfDay || 'Any time')}${r.reminder ? ' 🔔' : ''}</div>
              </div>
              <button class="chore-complete-btn${done ? ' done' : ''}" data-complete-routine="${r.id}" type="button" aria-label="${done ? 'Undo' : 'Done'}">
                ${done ? '✓' : ''}
              </button>
              <button class="del-sm" data-del-routine="${r.id}" type="button" aria-label="Delete">×</button>
            </div>`;
          }).join('')}
        </div>`;
    }).join('');

  return `
    <div class="page">
      <header class="tasks-header">
        <button class="back-btn" type="button" data-nav="home">←</button>
        <h1 class="tasks-date">Routines</h1>
        <div class="tasks-nav"></div>
      </header>
      ${dueToday.length === 0
        ? `<p style="color:var(--muted);text-align:center;padding:48px 0">No routines due today 🎉</p>`
        : sections}

      <button class="add-txn-btn" id="add-routine-btn" type="button" style="background:var(--nv-teal);color:#0a5a4e">+ Add Routine</button>

      <dialog class="event-dialog" id="routine-dialog">
        <form class="dialog-card" id="routine-form">
          <button class="close-btn" type="button" id="routine-close">×</button>
          <p class="eyebrow">New Routine</p>
          <label>Title <input required name="title" placeholder="Brush teeth"></label>
          <label>Emoji <input name="emoji" placeholder="🦷" maxlength="2" value="🔁"></label>
          <label>Assign to
            <select name="assignedTo">
              <option value="Everyone">Everyone</option>
              ${state.profiles.map(p => `<option value="${p.name}">${p.emoji} ${p.name}</option>`).join('')}
            </select>
          </label>
          <label>Time of day
            <select name="timeOfDay">
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </label>
          <label>Days</label>
          ${dayPickerHtml('days')}
          <label style="flex-direction:row;align-items:center;gap:10px;font-size:0.9rem">
            <input type="checkbox" name="reminder" value="1" style="width:18px;height:18px;accent-color:var(--lavender-acc)">
            <span>🔔 Enable reminder</span>
          </label>
          <label>Specific reminder time <small style="font-weight:500;color:var(--muted)">(optional)</small>
            <input name="reminderTime" type="time">
          </label>
          <button class="primary-btn full" type="submit">Save Routine</button>
        </form>
      </dialog>
    </div>`;
}
