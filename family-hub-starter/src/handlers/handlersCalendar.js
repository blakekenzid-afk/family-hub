// Calendar handlers
export function setupCalendar(state, render) {
  const calDialog = document.querySelector('#cal-dialog');
  document.querySelectorAll('[data-cal-date]').forEach(cell =>
    cell.addEventListener('click', e => {
      if (e.target.closest('[data-del-event]')) return;
      const dateInput = document.querySelector('#cal-date-input');
      if (dateInput) dateInput.value = cell.dataset.calDate;
      calDialog.showModal();
    }));

  document.querySelector('#cal-close')?.addEventListener('click', () => calDialog.close());
  document.querySelector('#cal-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    state.events.push({ id: state.nextEventId++, title: data.get('title'), date: data.get('date'), time: data.get('time') || 'Anytime', person: data.get('person') || 'Family' });
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
