/**
 * Notification Scheduling Utility
 * Handles browser notification scheduling for calendar events, tasks, routines, and bills
 */

import { TIME_ICONS, TIME_LABELS, isDueToday, isCompletedToday, dayLabel } from './constants.js';

const scheduledNotifIds = [];

/**
 * Clears all scheduled notifications
 */
export function clearScheduledNotifs() {
  while (scheduledNotifIds.length) clearTimeout(scheduledNotifIds.pop());
}

/**
 * Schedules notifications for all relevant items
 * @param {Object} state - Application state
 */
export function scheduleNotifs(state) {
  if (Notification.permission !== 'granted') return;
  clearScheduledNotifs();
  const now = new Date();
  const todayStr2 = now.toISOString().slice(0, 10);

  // Calendar events — fire 5 min before their time
  state.events
    .filter(e => e.date === todayStr2 && e.time && e.time !== 'Anytime')
    .forEach(e => {
      const [rawTime, ampm] = [e.time.slice(0, -3), e.time.slice(-2)];
      let [h, m] = rawTime.split(':').map(Number);
      if (ampm === 'PM' && h !== 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      const fireAt = new Date(now);
      fireAt.setHours(h, m - 5, 0, 0);
      const ms = fireAt - now;
      if (ms > 0) {
        scheduledNotifIds.push(setTimeout(() => {
          new Notification('📅 Upcoming: ' + e.title, {
            body: `${e.time}${e.person ? ' · ' + e.person : ''}`,
            icon: '/icons/icon-192.png',
          });
        }, ms));
      }
    });

  // helper: schedule a single exact-time notification
  function scheduleAt(hhmm, title, body) {
    const [h, m] = hhmm.split(':').map(Number);
    const fireAt = new Date(now);
    fireAt.setHours(h, m, 0, 0);
    const ms = fireAt - now;
    if (ms > 0) scheduledNotifIds.push(setTimeout(() =>
      new Notification(title, { body, icon: '/icons/icon-192.png' }), ms));
  }

  // Tasks & routines with a specific reminderTime — fire individually
  state.tasks
    .filter(t => t.reminder !== false && t.reminderTime && !t.done)
    .forEach(t => scheduleAt(t.reminderTime, t.emoji + ' ' + t.title,
      `${TIME_LABELS[t.timeOfDay] || ''} · ${t.person || ''}`.trim().replace(/^·\s*|\s*·\s*$/, '')));

  state.routines
    .filter(r => r.reminder && r.reminderTime && isDueToday(r) && !isCompletedToday(r))
    .forEach(r => scheduleAt(r.reminderTime, (r.emoji || '🔁') + ' ' + r.title,
      `${dayLabel(r.days)} · ${r.assignedTo || 'Everyone'}`.trim()));

  // Tasks & routines WITHOUT a specific time — group by period (8am / 12pm / 6pm)
  const timeFire = { morning: [8, 0], afternoon: [12, 0], evening: [18, 0] };
  ['morning', 'afternoon', 'evening'].forEach(period => {
    const pendingTasks    = state.tasks.filter(t => t.timeOfDay === period && !t.done && t.reminder !== false && !t.reminderTime);
    const pendingRoutines = state.routines.filter(r =>
      r.timeOfDay === period && r.reminder && !r.reminderTime && isDueToday(r) && !isCompletedToday(r)
    );
    if (!pendingTasks.length && !pendingRoutines.length) return;
    const [h, m] = timeFire[period];
    const fireAt = new Date(now);
    fireAt.setHours(h, m, 0, 0);
    const ms = fireAt - now;
    if (ms > 0) {
      scheduledNotifIds.push(setTimeout(() => {
        const items = [
          ...pendingTasks.map(t => t.emoji + ' ' + t.title),
          ...pendingRoutines.map(r => (r.emoji || '🔁') + ' ' + r.title),
        ];
        new Notification(`${TIME_ICONS[period]} ${TIME_LABELS[period]}`, {
          body: items.join('\n'),
          icon: '/icons/icon-192.png',
        });
      }, ms));
    }
  });

  // Bills — fire at 9am when due today, 1 day before, or 3 days before
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  (state.bills || [])
    .filter(b => b.reminder && !b.paid && b.dueDate)
    .forEach(b => {
      const due = new Date(b.dueDate + 'T00:00:00');
      const daysUntil = Math.round((due - todayMidnight) / 86400000);
      if (daysUntil === 3 || daysUntil === 1 || daysUntil === 0) {
        const fireAt = new Date(now);
        fireAt.setHours(9, 0, 0, 0);
        const ms = fireAt - now;
        if (ms > 0) {
          scheduledNotifIds.push(setTimeout(() => {
            const label = daysUntil === 0 ? 'due TODAY' : `due in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`;
            new Notification(`💳 ${b.name} ${label}`, {
              body: `$${Number(b.amount).toFixed(2)}${b.autopay ? ' · Autopay' : ''}`,
              icon: '/icons/icon-192.png',
            });
          }, ms));
        }
      }
    });
}

/**
 * Requests notification permission and schedules initial notifications
 * @param {Object} state - Application state
 */
export async function requestNotifPermission(state) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  scheduleNotifs(state);
}
