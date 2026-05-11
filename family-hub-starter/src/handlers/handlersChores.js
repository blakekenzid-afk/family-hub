// Chores handlers
import { todayStr } from '../utils/constants.js';
import { ALL_DAYS } from '../utils/constants.js';

export function setupChores(state, render) {
  document.querySelectorAll('[data-complete-chore]').forEach(btn =>
    btn.addEventListener('click', () => {
      const chore = state.chores.find(c => c.id === Number(btn.dataset.completeChore));
      if (!chore) return;
      if (!Array.isArray(chore.completedDates)) chore.completedDates = [];
      const today = todayStr();
      if (chore.completedDates.includes(today)) {
        chore.completedDates = chore.completedDates.filter(d => d !== today);
        const profile = state.profiles.find(p => p.name === chore.assignedTo);
        if (profile && profile.type === 'child') profile.points = Math.max(0, (profile.points || 0) - (chore.points || 0));
      } else {
        chore.completedDates.push(today);
        const profile = state.profiles.find(p => p.name === chore.assignedTo);
        if (profile && profile.type === 'child') profile.points = (profile.points || 0) + (chore.points || 0);
      }
      render();
    }));

  document.querySelectorAll('[data-del-chore]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.chores = state.chores.filter(c => c.id !== Number(btn.dataset.delChore));
      render();
    }));

  const choreDialog = document.querySelector('#chore-dialog');
  document.querySelector('#add-chore-btn')?.addEventListener('click', () => choreDialog?.showModal());
  document.querySelector('#chore-close')?.addEventListener('click', () => choreDialog?.close());
  document.querySelector('#chore-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const days = data.getAll('days');
    state.chores.push({
      id: state.nextChoreId++,
      title: data.get('title'),
      emoji: data.get('emoji') || '🧹',
      assignedTo: data.get('assignedTo'),
      points: parseInt(data.get('points') || '0', 10),
      days: days.length > 0 ? days : ALL_DAYS,
      completedDates: [],
    });
    choreDialog?.close();
    e.currentTarget.reset();
    render();
  });
}
