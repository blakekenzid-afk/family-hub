// Notifications handlers
export function setupNotifications(state, render) {
  document.querySelector('#mark-all-read')?.addEventListener('click', () => {
    state.notifications.forEach(n => n.read = true); render();
  });

  document.querySelectorAll('[data-read-notif]').forEach(btn =>
    btn.addEventListener('click', () => {
      const n = state.notifications.find(n => n.id === Number(btn.dataset.readNotif));
      if (n) { n.read = true; render(); }
    }));

  document.querySelectorAll('[data-del-notif]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.notifications = state.notifications.filter(n => n.id !== Number(btn.dataset.delNotif));
      render();
    }));

  const notifDialog = document.querySelector('#notif-dialog');
  document.querySelector('#add-notif-btn')?.addEventListener('click', () => {
    const dt = document.querySelector('#notif-dialog [name=time]');
    if (dt) { const d = new Date(Date.now() + 3600000); dt.value = d.toISOString().slice(0, 16); }
    notifDialog.showModal();
  });

  document.querySelector('#notif-close')?.addEventListener('click', () => notifDialog.close());
  document.querySelector('#notif-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const timeVal = data.get('time');
    const notif = {
      id:    state.nextNotifId++,
      title: data.get('title'),
      body:  data.get('body') || '',
      read:  false,
      time:  timeVal ? new Date(timeVal).toISOString() : new Date().toISOString(),
    };
    state.notifications.unshift(notif);
    if (timeVal && new Date(timeVal) <= new Date()) {
      if (Notification.permission === 'granted') {
        new Notification(notif.title, { body: notif.body });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(p => { if (p === 'granted') new Notification(notif.title, { body: notif.body }); });
      }
    }
    notifDialog.close();
    e.currentTarget.reset();
    render();
  });
}
