import './styles.css';
import { initialState } from './state/initialState.js';
import { saveState, loadState, getFirebaseReady } from './state/persistence.js';
import {
  NAV_ITEMS, GROCERY_PALETTE, ALL_DAYS,
  todayStr, fmtShort, fmtLong, todayDayShort, isDueToday, isCompletedToday, dayLabel, dayPickerHtml
} from './utils/constants.js';
import { scheduleNotifs, requestNotifPermission } from './utils/notificationScheduler.js';
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
  saveState(state);
  scheduleNotifs(state);
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

// ── boot ──────────────────────────────────────────────────────────────────────

render(); // render immediately with default state
loadState(state).then(() => { render(); scheduleNotifs(state); }).catch(() => render());
requestNotifPermission(state);
