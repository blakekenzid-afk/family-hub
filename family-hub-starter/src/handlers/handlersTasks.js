// Task handlers
import { createDialogSetup } from '../utils/dialogFactory.js';

export function setupTasks(state, render) {
  document.querySelectorAll('[data-check-task]').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const task = state.tasks.find(t => t.id === Number(btn.dataset.checkTask));
      if (task) { task.done = !task.done; render(); }
    }));

  document.querySelectorAll('[data-del-task]').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      state.tasks = state.tasks.filter(t => t.id !== Number(btn.dataset.delTask));
      render();
    }));

  const addTaskSetup = createDialogSetup({
    dialogId: 'task-dialog',
    openBtnId: 'open-task-dialog',
    closeBtnId: 'task-close',
    formId: 'task-form',
    onSubmit: (data) => {
      state.tasks.push({
        id: state.nextTaskId++,
        person: data.get('person'),
        timeOfDay: data.get('timeOfDay'),
        emoji: data.get('emoji') || '📌',
        title: data.get('title'),
        done: false,
        reminder: data.get('reminder') === '1',
        reminderTime: data.get('reminderTime') || null,
      });
    },
  });
  addTaskSetup(state, render);
}
