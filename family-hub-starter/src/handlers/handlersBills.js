// Bills handlers
import { todayStr } from '../utils/constants.js';
import { createDialogSetup } from '../utils/dialogFactory.js';

export function setupBills(state, render) {
  // Tab switching
  document.querySelectorAll('[data-budget-tab]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.budgetTab = btn.dataset.budgetTab;
      render();
    }));

  document.querySelectorAll('[data-toggle-bill]').forEach(btn =>
    btn.addEventListener('click', () => {
      const b = state.bills[Number(btn.dataset.toggleBill)];
      if (b) { b.paid = !b.paid; render(); }
    }));

  document.querySelectorAll('[data-del-bill]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.bills.splice(Number(btn.dataset.delBill), 1);
      render();
    }));

  const addBillSetup = createDialogSetup({
    dialogId: 'bill-dialog',
    openBtnId: 'add-bill-btn',
    closeBtnId: 'bill-close',
    formId: 'bill-form',
    onBeforeOpen: () => {
      const dd = document.querySelector('#bill-form [name=dueDate]');
      if (dd && !dd.value) dd.value = todayStr();
    },
    onSubmit: (data) => {
      state.bills.push({
        id: state.nextBillId++,
        name: data.get('name'),
        emoji: data.get('emoji') || '📄',
        amount: parseFloat(data.get('amount')),
        dueDate: data.get('dueDate'),
        autopay: data.get('autopay') === '1',
        reminder: data.get('reminder') === '1',
        paid: false,
      });
    },
  });
  addBillSetup(state, render);
}
