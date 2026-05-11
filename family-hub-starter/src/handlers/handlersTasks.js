// Task handlers
export function setupTasks(state, render) {
  document.querySelectorAll('[data-task-toggle]').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const task = state.tasks.find(t => t.id === Number(btn.dataset.taskToggle));
      if (task) { task.done = !task.done; render(); }
    }));

  document.querySelectorAll('[data-del-task]').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      state.tasks = state.tasks.filter(t => t.id !== Number(btn.dataset.delTask));
      render();
    }));

  const taskDialog = document.querySelector('#task-dialog');
  document.querySelector('#open-task-dialog')?.addEventListener('click', () => taskDialog.showModal());
  document.querySelector('#task-close')?.addEventListener('click', () => taskDialog.close());
  document.querySelector('#task-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
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
    taskDialog.close();
    e.currentTarget.reset();
    render();
  });
}
