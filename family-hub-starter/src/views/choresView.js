import { state } from '../main.js';
import { isDueToday, isCompletedToday, dayLabel, dayPickerHtml } from '../utils/constants.js';

export function renderChores() {
  const kids = state.profiles.filter(p => p.type === 'child');
  const all  = state.profiles;

  // group chores due today by assignee
  const dueToday = state.chores.filter(c => isDueToday(c));

  const byPerson = all.reduce((acc, p) => { acc[p.name] = []; return acc; }, {});
  byPerson['Unassigned'] = [];
  dueToday.forEach(c => {
    if (byPerson[c.assignedTo] !== undefined) byPerson[c.assignedTo].push(c);
    else byPerson['Unassigned'].push(c);
  });

  const sections = Object.entries(byPerson)
    .filter(([, list]) => list.length > 0)
    .map(([person, list]) => {
      const profile = all.find(p => p.name === person);
      const earnedPts = list.filter(c => isCompletedToday(c)).reduce((s, c) => s + (c.points || 0), 0);
      const totalPts  = list.reduce((s, c) => s + (c.points || 0), 0);
      return `
        <div class="chores-section">
          <div class="chores-section-title">
            ${profile ? `<span>${profile.emoji}</span>` : ''}
            <span>${person}</span>
            <span class="points-pill">⭐ ${earnedPts} / ${totalPts} pts</span>
          </div>
          ${list.map(c => {
            const done = isCompletedToday(c);
            return `
            <div class="chore-row${done ? ' chore-done' : ''}">
              <span class="chore-emoji">${c.emoji || '🧹'}</span>
              <div class="chore-info">
                <div class="chore-title">${c.title}</div>
                <div class="chore-meta">${dayLabel(c.days)}</div>
              </div>
              ${c.points ? `<span class="chore-pts">+${c.points}⭐</span>` : ''}
              <button class="chore-complete-btn${done ? ' done' : ''}" data-complete-chore="${c.id}" type="button" aria-label="${done ? 'Undo' : 'Complete'}">
                ${done ? '✓' : ''}
              </button>
              <button class="del-sm" data-del-chore="${c.id}" type="button" aria-label="Delete">×</button>
            </div>`;
          }).join('')}
        </div>`;
    }).join('');

  return `
    <div class="page">
      <header class="tasks-header">
        <button class="back-btn" type="button" data-nav="home">←</button>
        <h1 class="tasks-date">Chores</h1>
        <div class="tasks-nav"></div>
      </header>
      ${state.chores.length === 0 && kids.length === 0
        ? `<p style="color:var(--muted);text-align:center;padding:48px 0">Add child profiles first, then create chores 🧹</p>`
        : sections || `<p style="color:var(--muted);text-align:center;padding:48px 0">No chores due today 🎉</p>`}

      <button class="add-txn-btn" id="add-chore-btn" type="button" style="background:var(--nv-orange);color:#7a3800">+ Add Chore</button>

      <dialog class="event-dialog" id="chore-dialog">
        <form class="dialog-card" id="chore-form">
          <button class="close-btn" type="button" id="chore-close">×</button>
          <p class="eyebrow">New Chore</p>
          <label>Title <input required name="title" placeholder="Clean room"></label>
          <label>Emoji <input name="emoji" placeholder="🧹" maxlength="2" value="🧹"></label>
          <label>Assign to
            <select name="assignedTo">
              ${state.profiles.map(p => `<option value="${p.name}">${p.emoji} ${p.name}${p.type === 'child' ? ' 👶' : ''}</option>`).join('')}
            </select>
          </label>
          <label>Points reward <input name="points" type="number" min="0" max="999" placeholder="10" value="10"></label>
          <label>Days due</label>
          ${dayPickerHtml('days')}
          <button class="primary-btn full" type="submit">Save Chore</button>
        </form>
      </dialog>
    </div>`;
}
