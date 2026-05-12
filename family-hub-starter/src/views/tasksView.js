import { state } from '../main.js';
import { TIME_ICONS, TIME_LABELS } from '../utils/constants.js';

function renderTaskCard(task) {
  return `
    <div class="task-card${task.done ? ' done' : ''}">
      <div class="task-emoji-area"><span class="task-emoji">${task.emoji}</span></div>
      <div class="task-footer">
        <div style="flex:1;min-width:0">
          <span class="task-title">${task.title}</span>
          ${task.reminderTime ? `<div style="font-size:0.68rem;color:var(--muted);font-weight:700;margin-top:2px">🔔 ${task.reminderTime}</div>` : ''}
        </div>
        <div class="task-actions">
          <button class="check-circle${task.done ? ' done' : ''}"
                  data-check-task="${task.id}" type="button"
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

export function renderTasks() {
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
              ${state.profiles.length === 0
                ? '<option value="Family">Family</option>'
                : state.profiles.map(p => `<option>${p.name}</option>`).join('')}
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
          <label style="flex-direction:row;align-items:center;gap:10px;font-size:0.9rem">
            <input type="checkbox" name="reminder" value="1" checked style="width:18px;height:18px;accent-color:var(--lavender-acc)">
            <span>🔔 Enable reminder</span>
          </label>
          <label>Reminder time <small style="font-weight:500;color:var(--muted)">(optional — leave blank to use time-of-day)</small>
            <input name="reminderTime" type="time">
          </label>
          <button class="primary-btn full" type="submit">Save Task</button>
        </form>
      </dialog>
    </div>`;
}
