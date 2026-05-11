// Routines handlers
import { todayStr } from '../utils/constants.js';
import { ALL_DAYS } from '../utils/constants.js';

export function setupRoutines(state, render) {
  document.querySelectorAll('[data-complete-routine]').forEach(btn =>
    btn.addEventListener('click', () => {
      const routine = state.routines.find(r => r.id === Number(btn.dataset.completeRoutine));
      if (!routine) return;
      if (!Array.isArray(routine.completedDates)) routine.completedDates = [];
      const today = todayStr();
      if (routine.completedDates.includes(today)) {
        routine.completedDates = routine.completedDates.filter(d => d !== today);
      } else {
        routine.completedDates.push(today);
      }
      render();
    }));

  document.querySelectorAll('[data-del-routine]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.routines = state.routines.filter(r => r.id !== Number(btn.dataset.delRoutine));
      render();
    }));

  const routineDialog = document.querySelector('#routine-dialog');
  document.querySelector('#add-routine-btn')?.addEventListener('click', () => routineDialog?.showModal());
  document.querySelector('#routine-close')?.addEventListener('click', () => routineDialog?.close());
  document.querySelector('#routine-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const days = data.getAll('days');
    state.routines.push({
      id: state.nextRoutineId++,
      title: data.get('title'),
      emoji: data.get('emoji') || '🔁',
      assignedTo: data.get('assignedTo') || 'Everyone',
      timeOfDay: data.get('timeOfDay') || 'morning',
      days: days.length > 0 ? days : ALL_DAYS,
      reminder: data.get('reminder') === '1',
      reminderTime: data.get('reminderTime') || null,
      completedDates: [],
    });
    routineDialog?.close();
    e.currentTarget.reset();
    render();
  });
}
