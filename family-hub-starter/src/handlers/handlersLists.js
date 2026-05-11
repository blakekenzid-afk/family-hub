// Lists handlers
export function setupLists(state, render) {
  document.querySelectorAll('[data-check-list]').forEach(btn =>
    btn.addEventListener('click', () => {
      const list = state.lists.find(l => l.id === Number(btn.dataset.checkList));
      if (list) { list.items[Number(btn.dataset.itemIdx)].checked = !list.items[Number(btn.dataset.itemIdx)].checked; render(); }
    }));

  document.querySelectorAll('[data-del-list-item]').forEach(btn =>
    btn.addEventListener('click', () => {
      const list = state.lists.find(l => l.id === Number(btn.dataset.delListItem));
      if (list) { list.items.splice(Number(btn.dataset.itemIdx), 1); render(); }
    }));

  document.querySelectorAll('[data-del-list]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.lists = state.lists.filter(l => l.id !== Number(btn.dataset.delList));
      render();
    }));

  const renameListDialog = document.querySelector('#rename-list-dialog');
  document.querySelectorAll('[data-rename-list]').forEach(btn =>
    btn.addEventListener('click', () => {
      const list = state.lists.find(l => l.id === Number(btn.dataset.renameList));
      if (!list) return;
      const f = document.querySelector('#rename-list-form');
      f.querySelector('[name=id]').value = list.id;
      f.querySelector('[name=name]').value = list.name;
      renameListDialog.showModal();
    }));

  document.querySelector('#rename-list-close')?.addEventListener('click', () => renameListDialog.close());
  document.querySelector('#rename-list-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const list = state.lists.find(l => l.id === Number(data.get('id')));
    if (list) list.name = data.get('name');
    renameListDialog.close();
    render();
  });

  document.querySelectorAll('[data-add-list]').forEach(form =>
    form.addEventListener('submit', e => {
      e.preventDefault();
      const list = state.lists.find(l => l.id === Number(form.dataset.addList));
      const item = new FormData(e.currentTarget).get('item').trim();
      if (list && item) { list.items.push({ text: item, checked: false }); e.currentTarget.reset(); render(); }
    }));

  const newListDialog = document.querySelector('#new-list-dialog');
  document.querySelector('#add-list-btn')?.addEventListener('click', () => newListDialog.showModal());
  document.querySelector('#new-list-close')?.addEventListener('click', () => newListDialog.close());
  document.querySelector('#new-list-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = new FormData(e.currentTarget).get('name').trim();
    if (name) { state.lists.push({ id: state.nextListId++, name, items: [] }); newListDialog.close(); e.currentTarget.reset(); render(); }
  });
}
