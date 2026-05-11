// Bills handlers
import { todayStr } from '../utils/constants.js';

export function setupBills(state, render) {
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

  const billDialog = document.querySelector('#bill-dialog');
  document.querySelector('#add-bill-btn')?.addEventListener('click', () => {
    const dd = document.querySelector('#bill-form [name=dueDate]');
    if (dd && !dd.value) dd.value = todayStr();
    billDialog?.showModal();
  });

  document.querySelector('#bill-close')?.addEventListener('click', () => billDialog?.close());
  document.querySelector('#bill-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
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
    billDialog?.close();
    e.currentTarget.reset();
    render();
  });
}
