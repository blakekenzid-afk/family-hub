// Groceries handlers
export function setupGroceries(state, render) {
  document.querySelectorAll('[data-check-grocery]').forEach(btn =>
    btn.addEventListener('click', () => {
      const ci = Number(btn.dataset.ci), ii = Number(btn.dataset.ii);
      state.groceries[ci].items[ii].checked = !state.groceries[ci].items[ii].checked;
      render();
    }));

  document.querySelectorAll('[data-del-grocery-item]').forEach(btn =>
    btn.addEventListener('click', () => {
      const ci = Number(btn.dataset.ci), ii = Number(btn.dataset.ii);
      state.groceries[ci].items.splice(ii, 1);
      render();
    }));

  document.querySelectorAll('[data-del-grocery-cat]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.groceries.splice(Number(btn.dataset.delGroceryCat), 1);
      render();
    }));

  const renameGroceryCatDialog = document.querySelector('#rename-grocery-cat-dialog');
  document.querySelectorAll('[data-rename-grocery-cat]').forEach(btn =>
    btn.addEventListener('click', () => {
      const ci = Number(btn.dataset.renameGroceryCat);
      const f = document.querySelector('#rename-grocery-cat-form');
      f.querySelector('[name=ci]').value = ci;
      f.querySelector('[name=name]').value = state.groceries[ci].category;
      renameGroceryCatDialog.showModal();
    }));

  document.querySelector('#rename-grocery-cat-close')?.addEventListener('click', () => renameGroceryCatDialog.close());
  document.querySelector('#rename-grocery-cat-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    state.groceries[Number(data.get('ci'))].category = data.get('name');
    renameGroceryCatDialog.close();
    render();
  });

  document.querySelectorAll('[data-add-grocery]').forEach(form =>
    form.addEventListener('submit', e => {
      e.preventDefault();
      const ci = Number(form.dataset.addGrocery);
      const item = new FormData(e.currentTarget).get('item').trim();
      if (item) { state.groceries[ci].items.push({ text: item, checked: false }); e.currentTarget.reset(); render(); }
    }));

  document.querySelector('#add-grocery-cat-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = new FormData(e.currentTarget).get('cat').trim();
    if (name) { state.groceries.push({ category: name, items: [] }); e.currentTarget.reset(); render(); }
  });
}
