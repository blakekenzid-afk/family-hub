// Routines handlers
import { todayStr } from '../utils/constants.js';
import { ALL_DAYS } from '../utils/constants.js';
import { createDialogSetup } from '../utils/dialogFactory.js';
import { toggleCompletedDate, isCompletedToday } from '../utils/mutations.js';

export function setupRoutines(state, render) {
  document.querySelectorAll('[data-complete-routine]').forEach(btn =>
    btn.addEventListener('click', () => {
      const routine = state.routines.find(r => r.id === Number(btn.dataset.completeRoutine));
      if (!routine) return;
      const today = todayStr();
      routine.completedDates = toggleCompletedDate(routine.completedDates, today);
      render();
    }));

  document.querySelectorAll('[data-del-routine]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.routines = state.routines.filter(r => r.id !== Number(btn.dataset.delRoutine));
      render();
    }));

  const addRoutineSetup = createDialogSetup({
    dialogId: 'routine-dialog',
    openBtnId: 'add-routine-btn',
    closeBtnId: 'routine-close',
    formId: 'routine-form',
    onSubmit: (data) => {
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
    },
  });
  addRoutineSetup(state, render);
}
