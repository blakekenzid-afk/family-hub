import { state } from '../main.js';
import { todayStr } from '../utils/constants.js';

export function renderNotifications() {
  function timeAgo(iso) {
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 0) {
      const abs = Math.abs(diff);
      if (abs < 3600)  return `Due in ${Math.ceil(abs/60)}m`;
      if (abs < 86400) return `Due in ${Math.ceil(abs/3600)}h`;
      return `Due in ${Math.ceil(abs/86400)}d`;
    }
    if (diff < 60)    return 'Just now';
    if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  }
  const unread = state.notifications.filter(n => !n.read);
  const read   = state.notifications.filter(n =>  n.read);
  return `
    <div class="page">
      <header class="tasks-header">
        <button class="back-btn" type="button" data-nav="home">←</button>
        <h1 class="tasks-date">Notifications</h1>
        <div class="tasks-nav">
          ${unread.length ? `<button class="icon-btn" id="mark-all-read">Mark all read</button>` : ''}
        </div>
      </header>
      ${unread.length === 0 && read.length === 0 ? `
        <div class="notif-empty">🔔 No notifications yet</div>` : ''}
      ${unread.length ? `
        <h3 class="section-label">New</h3>
        <div class="notif-list">
          ${unread.map(n => `
            <div class="notif-card unread">
              <div class="notif-dot"></div>
              <div class="notif-body">
                <p class="notif-title">${n.title}</p>
                <p class="notif-sub">${n.body}</p>
                <p class="notif-time">${timeAgo(n.time)}</p>
              </div>
              <div class="notif-actions">
                <button class="icon-btn" data-read-notif="${n.id}" type="button">✓</button>
                <button class="del-sm" data-del-notif="${n.id}" type="button">×</button>
              </div>
            </div>`).join('')}
        </div>` : ''}
      ${read.length ? `
        <h3 class="section-label" style="margin-top:18px">Earlier</h3>
        <div class="notif-list">
          ${read.map(n => `
            <div class="notif-card">
              <div class="notif-body">
                <p class="notif-title">${n.title}</p>
                <p class="notif-sub">${n.body}</p>
                <p class="notif-time">${timeAgo(n.time)}</p>
              </div>
              <button class="del-sm" data-del-notif="${n.id}" type="button">×</button>
            </div>`).join('')}
        </div>` : ''}
      <button class="add-txn-btn" id="add-notif-btn" type="button" style="margin-top:16px">+ Add Reminder</button>
      <dialog class="event-dialog" id="notif-dialog">
        <form class="dialog-card" id="notif-form">
          <button class="close-btn" type="button" id="notif-close">×</button>
          <p class="eyebrow">New Reminder</p>
          <label>Title   <input required name="title" placeholder="Soccer practice"></label>
          <label>Message <input name="body" placeholder="Don\'t forget cleats!"></label>
          <label>When    <input name="time" type="datetime-local"></label>
          <button class="primary-btn full" type="submit">Save Reminder</button>
        </form>
      </dialog>
    </div>`;
}
