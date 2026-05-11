// Chores handlers
import { todayStr } from '../utils/constants.js';
import { ALL_DAYS } from '../utils/constants.js';
import { createDialogSetup } from '../utils/dialogFactory.js';
import { toggleCompletedDate, isCompletedToday, findProfileByName, updateProfilePoints } from '../utils/mutations.js';

export function setupChores(state, render) {
  document.querySelectorAll('[data-complete-chore]').forEach(btn =>
    btn.addEventListener('click', () => {
      const chore = state.chores.find(c => c.id === Number(btn.dataset.completeChore));
      if (!chore) return;
      const today = todayStr();
      const wasCompleted = isCompletedToday(chore, today);
      chore.completedDates = toggleCompletedDate(chore.completedDates, today);

      const profile = findProfileByName(state.profiles, chore.assignedTo);
      if (profile && profile.type === 'child') {
        const pointsDelta = wasCompleted ? -(chore.points || 0) : (chore.points || 0);
        updateProfilePoints(profile, pointsDelta);
      }
      render();
    }));

  document.querySelectorAll('[data-del-chore]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.chores = state.chores.filter(c => c.id !== Number(btn.dataset.delChore));
      render();
    }));

  const addChoreSetup = createDialogSetup({
    dialogId: 'chore-dialog',
    openBtnId: 'add-chore-btn',
    closeBtnId: 'chore-close',
    formId: 'chore-form',
    onSubmit: (data) => {
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
    },
  });
  addChoreSetup(state, render);
}
