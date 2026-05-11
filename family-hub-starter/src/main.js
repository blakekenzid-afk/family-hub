import './styles.css';
import { initialState } from './state/initialState.js';
import { saveState, loadState, getFirebaseReady } from './state/persistence.js';
import {
  TIME_ICONS, TIME_LABELS, NAV_ITEMS, GROCERY_PALETTE, ALL_DAYS,
  todayStr, fmtShort, fmtLong, todayDayShort, isDueToday, isCompletedToday, dayLabel, dayPickerHtml
} from './utils/constants.js';
import { renderHome } from './views/homeView.js';
import { renderTasks } from './views/tasksView.js';
import { renderMeals } from './views/mealsView.js';
import { renderGroceries } from './views/groceriesView.js';
import { renderCalendar } from './views/calendarView.js';
import { renderLists } from './views/listsView.js';
import { renderBudget } from './views/budgetView.js';
import { renderNotifications } from './views/notificationsView.js';
import { renderChores } from './views/choresView.js';
import { renderRewards } from './views/rewardsView.js';
import { renderRoutines } from './views/routinesView.js';
import { renderProfiles } from './views/profilesView.js';
import { setupNav } from './handlers/handlersNav.js';
import { setupTasks } from './handlers/handlersTasks.js';
import { setupMeals } from './handlers/handlersMeals.js';
import { setupGroceries } from './handlers/handlersGroceries.js';
import { setupLists } from './handlers/handlersLists.js';
import { setupCalendar } from './handlers/handlersCalendar.js';
import { setupBudget } from './handlers/handlersBudget.js';
import { setupBills } from './handlers/handlersBills.js';
import { setupNotifications } from './handlers/handlersNotifications.js';
import { setupProfiles } from './handlers/handlersProfiles.js';
import { setupChores } from './handlers/handlersChores.js';
import { setupRewards } from './handlers/handlersRewards.js';
import { setupRoutines } from './handlers/handlersRoutines.js';

export const state = { ...initialState };

// ── helpers ───────────────────────────────────────────────────────────────────

// ── assign recipe helper ──────────────────────────────────────────────────────

function assignRecipeToDay(recipeId, dayIdx) {
  const recipe = state.recipes.find(r => r.id === recipeId);
  if (!recipe || dayIdx < 0 || dayIdx >= state.meals.length) return;
  state.meals[dayIdx].meal = recipe.name;
  if (recipe.ingredients.length > 0) {
    const catName = `${recipe.emoji} ${recipe.name}`;
    let cat = state.groceries.find(c => c.category === catName);
    if (!cat) {
      cat = { category: catName, items: [] };
      state.groceries.push(cat);
    }
    recipe.ingredients.forEach(ing => {
      if (!cat.items.some(i => i.text === ing)) cat.items.push({ text: ing, checked: false });
    });
  }
  state.selectedRecipeId = null;
  render();
}

// ── render + bind ─────────────────────────────────────────────────────────────

function render() {
  saveState();
  if (typeof scheduleNotifs === 'function') scheduleNotifs();
  const app = document.querySelector('#app');
  switch (state.view) {
    case 'tasks':     app.innerHTML = renderTasks();     break;
    case 'meals':     app.innerHTML = renderMeals();     break;
    case 'groceries': app.innerHTML = renderGroceries(); break;
    case 'calendar':  app.innerHTML = renderCalendar();  break;
    case 'lists':     app.innerHTML = renderLists();      break;
    case 'budget':    app.innerHTML = renderBudget();        break;
    case 'notifications': app.innerHTML = renderNotifications(); break;
    case 'profiles':  app.innerHTML = renderProfiles();     break;
    case 'chores':    app.innerHTML = renderChores();     break;
    case 'rewards':   app.innerHTML = renderRewards();    break;
    case 'routines':  app.innerHTML = renderRoutines();   break;
    default:          app.innerHTML = renderHome();
  }
  bind();
}

function bind() {
  setupNav(state, render);
  setupTasks(state, render);
  setupMeals(state, render, assignRecipeToDay);
  setupGroceries(state, render);
  setupLists(state, render);
  setupCalendar(state, render);
  setupBudget(state, render);
  setupBills(state, render);
  setupNotifications(state, render);
  setupProfiles(state, render);
  setupChores(state, render);
  setupRewards(state, render);
  setupRoutines(state, render);
}

// ── notifications ─────────────────────────────────────────────────────────────

const scheduledNotifIds = [];

function clearScheduledNotifs() {
  while (scheduledNotifIds.length) clearTimeout(scheduledNotifIds.pop());
}

function scheduleNotifs() {
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

async function requestNotifPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  scheduleNotifs();
}

// ── boot ──────────────────────────────────────────────────────────────────────

render(); // render immediately with default state
loadState().then(() => { render(); scheduleNotifs(); }).catch(() => render());
requestNotifPermission();
