// Budget handlers (income, transactions, categories, period settings)
import { todayStr } from '../utils/constants.js';
import { createDialogSetup } from '../utils/dialogFactory.js';

export function setupBudget(state, render) {
  // Tab switching
  document.querySelectorAll('[data-budget-tab]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.budgetTab = btn.dataset.budgetTab;
      render();
    }));

  // Month navigation
  document.querySelector('[data-prev-month]')?.addEventListener('click', () => {
    state.budgetViewMonth = new Date(state.budgetViewMonth.getFullYear(), state.budgetViewMonth.getMonth() - 1, 1);
    render();
  });
  document.querySelector('[data-next-month]')?.addEventListener('click', () => {
    state.budgetViewMonth = new Date(state.budgetViewMonth.getFullYear(), state.budgetViewMonth.getMonth() + 1, 1);
    render();
  });

  // Edit budget period (monthly vs bi-weekly)
  const budgetSettingsSetup = createDialogSetup({
    dialogId: 'budget-settings-dialog',
    openBtnId: 'budget-settings-btn',
    closeBtnId: 'budget-settings-close',
    formId: 'budget-settings-form',
    onSubmit: (data) => {
      state.budget.periodType = data.get('periodType') || 'monthly';
    },
  });
  budgetSettingsSetup(state, render);

  // Edit period amount (monthly budget/income)
  const editPeriodSetup = createDialogSetup({
    dialogId: 'edit-period-dialog',
    openBtnId: 'edit-period-btn',
    closeBtnId: 'edit-period-close',
    formId: 'edit-period-form',
    onBeforeOpen: () => {
      const input = document.querySelector('#edit-period-form [name=periodAmount]');
      if (input) input.value = state.budget.periodAmount;
    },
    onSubmit: (data) => {
      state.budget.periodAmount = parseFloat(data.get('periodAmount')) || 0;
    },
  });
  editPeriodSetup(state, render);

  // Delete transaction
  document.querySelectorAll('[data-del-txn]').forEach(btn =>
    btn.addEventListener('click', () => {
      const txnId = Number(btn.dataset.delTxn);
      const txn = state.budget.transactions.find(t => t.id === txnId);
      if (txn) {
        const cat = state.budget.categories.find(c => c.name === txn.category);
        if (cat) cat.spent = Math.max(0, Math.round((cat.spent - txn.amount) * 100) / 100);
        state.budget.transactions = state.budget.transactions.filter(t => t.id !== txnId);
      }
      render();
    }));

  // Edit transaction
  const editTxnSetup = createDialogSetup({
    dialogId: 'edit-txn-dialog',
    openBtnId: null,
    closeBtnId: 'edit-txn-close',
    formId: 'edit-txn-form',
    onBeforeOpen: () => {
      // Will be set by the edit button click handler below
    },
    onSubmit: (data) => {
      const txnId = Number(document.querySelector('#edit-txn-form [name=txn-id]')?.value || -1);
      if (txnId < 0) return;
      const txn = state.budget.transactions.find(t => t.id === txnId);
      if (!txn) return;
      const oldCat = state.budget.categories.find(c => c.name === txn.category);
      const newCat = state.budget.categories.find(c => c.name === data.get('category'));
      const oldAmount = txn.amount;
      const newAmount = parseFloat(data.get('amount')) || 0;

      // Update old category spent (remove old amount)
      if (oldCat) oldCat.spent = Math.max(0, Math.round((oldCat.spent - oldAmount) * 100) / 100);
      // Update new category spent (add new amount)
      if (newCat) newCat.spent = Math.round((newCat.spent + newAmount) * 100) / 100;

      // Update transaction
      txn.amount = newAmount;
      txn.desc = data.get('desc') || txn.desc;
      txn.category = data.get('category') || txn.category;
    },
  });
  editTxnSetup(state, render);

  // Edit transaction button click handler
  document.querySelectorAll('[data-edit-txn]').forEach(btn =>
    btn.addEventListener('click', () => {
      const txnId = Number(btn.dataset.editTxn);
      const txn = state.budget.transactions.find(t => t.id === txnId);
      if (!txn) return;

      document.querySelector('#edit-txn-form [name=txn-id]').value = txnId;
      document.querySelector('#edit-txn-form [name=amount]').value = txn.amount;
      document.querySelector('#edit-txn-form [name=desc]').value = txn.desc || '';
      document.querySelector('#edit-txn-form [name=category]').value = txn.category;
      document.querySelector('#edit-txn-dialog').showModal();
    }));

  // Delete category
  document.querySelectorAll('[data-del-cat]').forEach(btn =>
    btn.addEventListener('click', () => {
      const catId = Number(btn.dataset.delCat);
      state.budget.categories = state.budget.categories.filter(c => c.id !== catId);
      render();
    }));

  // Edit category
  const editCatSetup = createDialogSetup({
    dialogId: 'edit-cat-dialog',
    openBtnId: null,
    closeBtnId: 'edit-cat-close',
    formId: 'edit-cat-form',
    onBeforeOpen: () => {
      // Will be set by the edit button click handler below
    },
    onSubmit: (data) => {
      const catId = Number(document.querySelector('#edit-cat-form [name=cat-id]')?.value);
      const cat = state.budget.categories.find(c => c.id === catId);
      if (cat) {
        cat.name = data.get('name');
        cat.icon = data.get('icon') || cat.icon;
        cat.budgeted = parseFloat(data.get('budgeted'));
        cat.spent = parseFloat(data.get('spent'));
      }
    },
  });
  editCatSetup(state, render);

  // Edit category button click handler
  document.querySelectorAll('[data-edit-cat]').forEach(btn =>
    btn.addEventListener('click', () => {
      const catId = Number(btn.dataset.editCat);
      const cat = state.budget.categories.find(c => c.id === catId);
      if (!cat) return;
      const f = document.querySelector('#edit-cat-form');
      f.querySelector('[name=cat-id]').value = catId;
      f.querySelector('[name=name]').value = cat.name;
      f.querySelector('[name=icon]').value = cat.icon;
      f.querySelector('[name=budgeted]').value = cat.budgeted;
      f.querySelector('[name=spent]').value = cat.spent;
      document.querySelector('#edit-cat-dialog').showModal();
    }));

  // Add category
  const addCatSetup = createDialogSetup({
    dialogId: 'add-cat-dialog',
    openBtnId: 'add-cat-btn',
    closeBtnId: 'add-cat-close',
    formId: 'add-cat-form',
    onSubmit: (data) => {
      state.budget.categories.push({
        id: state.nextCategoryId++,
        name: data.get('name'),
        icon: data.get('icon') || '📦',
        budgeted: parseFloat(data.get('budgeted')) || 0,
        spent: 0,
      });
    },
  });
  addCatSetup(state, render);

  // Add transaction
  const addTxnSetup = createDialogSetup({
    dialogId: 'txn-dialog',
    openBtnId: 'add-txn-btn',
    closeBtnId: 'txn-close',
    formId: 'txn-form',
    onSubmit: (data) => {
      const cat = state.budget.categories.find(c => c.name === data.get('category'));
      const amount = parseFloat(data.get('amount')) || 0;
      if (cat) cat.spent = Math.round((cat.spent + amount) * 100) / 100;
      state.budget.transactions.push({
        id: state.nextTransactionId++,
        date: todayStr(),
        desc: data.get('desc'),
        amount,
        category: data.get('category'),
      });
    },
  });
  addTxnSetup(state, render);
}
