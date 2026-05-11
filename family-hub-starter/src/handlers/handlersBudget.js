// Budget handlers (monthly income, transactions, categories)
import { todayStr } from '../utils/constants.js';

export function setupBudget(state, render) {
  const editMonthlyDialog = document.querySelector('#edit-monthly-dialog');
  document.querySelector('#edit-monthly-btn')?.addEventListener('click', () => {
    document.querySelector('#edit-monthly-form [name=monthly]').value = state.budget.monthly;
    editMonthlyDialog.showModal();
  });

  document.querySelector('#edit-monthly-close')?.addEventListener('click', () => editMonthlyDialog.close());
  document.querySelector('#edit-monthly-form')?.addEventListener('submit', e => {
    e.preventDefault();
    state.budget.monthly = parseFloat(new FormData(e.currentTarget).get('monthly'));
    editMonthlyDialog.close();
    render();
  });

  document.querySelectorAll('[data-del-txn]').forEach(btn =>
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.delTxn);
      const txn = state.budget.transactions[idx];
      const cat = state.budget.categories.find(c => c.name === txn.category);
      if (cat) cat.spent = Math.max(0, Math.round((cat.spent - txn.amount) * 100) / 100);
      state.budget.transactions.splice(idx, 1);
      render();
    }));

  document.querySelectorAll('[data-del-cat]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.budget.categories.splice(Number(btn.dataset.delCat), 1);
      render();
    }));

  const editCatDialog = document.querySelector('#edit-cat-dialog');
  document.querySelectorAll('[data-edit-cat]').forEach(btn =>
    btn.addEventListener('click', () => {
      const ci = Number(btn.dataset.editCat);
      const cat = state.budget.categories[ci];
      const f = document.querySelector('#edit-cat-form');
      f.querySelector('[name=ci]').value = ci;
      f.querySelector('[name=name]').value = cat.name;
      f.querySelector('[name=icon]').value = cat.icon;
      f.querySelector('[name=budgeted]').value = cat.budgeted;
      f.querySelector('[name=spent]').value = cat.spent;
      editCatDialog.showModal();
    }));

  document.querySelector('#edit-cat-close')?.addEventListener('click', () => editCatDialog.close());
  document.querySelector('#edit-cat-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const ci = Number(data.get('ci'));
    state.budget.categories[ci] = {
      ...state.budget.categories[ci],
      name:     data.get('name'),
      icon:     data.get('icon') || state.budget.categories[ci].icon,
      budgeted: parseFloat(data.get('budgeted')),
      spent:    parseFloat(data.get('spent')),
    };
    editCatDialog.close();
    render();
  });

  const addCatDialog = document.querySelector('#add-cat-dialog');
  document.querySelector('#add-cat-btn')?.addEventListener('click', () => addCatDialog.showModal());
  document.querySelector('#add-cat-close')?.addEventListener('click', () => addCatDialog.close());
  document.querySelector('#add-cat-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    state.budget.categories.push({
      name:     data.get('name'),
      icon:     data.get('icon') || '📦',
      budgeted: parseFloat(data.get('budgeted')),
      spent:    0,
    });
    addCatDialog.close();
    e.currentTarget.reset();
    render();
  });

  const txnDialog = document.querySelector('#txn-dialog');
  document.querySelector('#add-txn-btn')?.addEventListener('click', () => txnDialog?.showModal());
  document.querySelector('#txn-close')?.addEventListener('click', () => txnDialog?.close());
  document.querySelector('#txn-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const cat = state.budget.categories.find(c => c.name === data.get('category'));
    const amount = parseFloat(data.get('amount'));
    if (cat) cat.spent = Math.round((cat.spent + amount) * 100) / 100;
    state.budget.transactions.push({
      date: todayStr(),
      desc: data.get('desc'),
      amount,
      category: data.get('category'),
    });
    txnDialog?.close();
    e.currentTarget.reset();
    render();
  });
}
