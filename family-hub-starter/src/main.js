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
  document.querySelectorAll('[data-nav]').forEach(btn =>
    btn.addEventListener('click', () => { state.view = btn.dataset.nav; render(); }));

  document.querySelectorAll('[data-task-toggle]').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const task = state.tasks.find(t => t.id === Number(btn.dataset.taskToggle));
      if (task) { task.done = !task.done; render(); }
    }));

  document.querySelector('#prev-day')?.addEventListener('click', () => {
    state.currentDate.setDate(state.currentDate.getDate() - 1); render();
  });
  document.querySelector('#next-day')?.addEventListener('click', () => {
    state.currentDate.setDate(state.currentDate.getDate() + 1); render();
  });
  document.querySelector('#today-btn')?.addEventListener('click', () => {
    state.currentDate = new Date(); render();
  });
  document.querySelector('#cal-prev')?.addEventListener('click', () => {
    state.currentDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() - 1, 1);
    render();
  });
  document.querySelector('#cal-next')?.addEventListener('click', () => {
    state.currentDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() + 1, 1);
    render();
  });

  // ── Tasks ──────────────────────────────────────────────────────────────
  document.querySelectorAll('[data-del-task]').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      state.tasks = state.tasks.filter(t => t.id !== Number(btn.dataset.delTask));
      render();
    }));
  const taskDialog = document.querySelector('#task-dialog');
  document.querySelector('#open-task-dialog')?.addEventListener('click', () => taskDialog.showModal());
  document.querySelector('#task-close')?.addEventListener('click', () => taskDialog.close());
  document.querySelector('#task-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    state.tasks.push({
      id: state.nextTaskId++,
      person: data.get('person'),
      timeOfDay: data.get('timeOfDay'),
      emoji: data.get('emoji') || '📌',
      title: data.get('title'),
      done: false,
      reminder: data.get('reminder') === '1',
      reminderTime: data.get('reminderTime') || null,
    });
    taskDialog.close();
    e.currentTarget.reset();
    render();
  });

  // ── Meals ──────────────────────────────────────────────────────────────
  document.querySelectorAll('[data-edit-meal]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.editingMealIdx = Number(btn.dataset.editMeal);
      render();
    }));
  document.querySelectorAll('.meal-edit-form').forEach(form =>
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      state.meals[Number(form.dataset.mealIdx)].meal = data.get('meal');
      state.editingMealIdx = null;
      render();
    }));

  // ── Recipes ────────────────────────────────────────────────────────────
  // Drag-and-drop on recipe cards
  document.querySelectorAll('[data-recipe-id]').forEach(card => {
    card.addEventListener('dragstart', e => {
      e.dataTransfer.setData('recipeId', card.dataset.recipeId);
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
  });

  // Drop zones on day rows
  document.querySelectorAll('.meal-drop-zone').forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const recipeId = Number(e.dataTransfer.getData('recipeId'));
      assignRecipeToDay(recipeId, Number(zone.dataset.dropDay));
    });
    // Tap-to-assign (mobile): tap a day while a recipe is selected
    zone.addEventListener('click', e => {
      if (e.target.closest('[data-edit-meal]')) return;
      if (state.selectedRecipeId !== null) {
        assignRecipeToDay(state.selectedRecipeId, Number(zone.dataset.dropDay));
      }
    });
  });

  // Tap a recipe card to select / deselect it
  document.querySelectorAll('[data-select-recipe]').forEach(card =>
    card.addEventListener('click', e => {
      if (e.target.closest('[data-del-recipe]')) return;
      const id = Number(card.dataset.selectRecipe);
      state.selectedRecipeId = state.selectedRecipeId === id ? null : id;
      render();
    }));

  // Delete recipe
  document.querySelectorAll('[data-del-recipe]').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = Number(btn.dataset.delRecipe);
      state.recipes = state.recipes.filter(r => r.id !== id);
      if (state.selectedRecipeId === id) state.selectedRecipeId = null;
      render();
    }));

  // Add / Edit recipe dialog
  const recipeDialog = document.querySelector('#recipe-dialog');
  document.querySelector('#add-recipe-btn')?.addEventListener('click', () => {
    const f = document.querySelector('#recipe-form');
    f.querySelector('[name=recipe-id]').value = '';
    document.querySelector('#recipe-dialog-title').textContent = 'New Recipe';
    f.reset();
    f.querySelector('[name=emoji]').value = '🍽️';
    recipeDialog.showModal();
  });
  document.querySelectorAll('[data-edit-recipe]').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const recipe = state.recipes.find(r => r.id === Number(btn.dataset.editRecipe));
      if (!recipe) return;
      const f = document.querySelector('#recipe-form');
      f.querySelector('[name=recipe-id]').value = recipe.id;
      f.querySelector('[name=name]').value = recipe.name;
      f.querySelector('[name=emoji]').value = recipe.emoji;
      f.querySelector('[name=ingredients]').value = recipe.ingredients.join('\n');
      document.querySelector('#recipe-dialog-title').textContent = 'Edit Recipe';
      recipeDialog.showModal();
    }));
  document.querySelector('#recipe-close')?.addEventListener('click', () => { recipeDialog.close(); });
  document.querySelector('#recipe-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const ingredients = (data.get('ingredients') || '').split('\n').map(s => s.trim()).filter(Boolean);
    const existingId = data.get('recipe-id');
    if (existingId) {
      const r = state.recipes.find(r => r.id === Number(existingId));
      if (r) { r.name = data.get('name'); r.emoji = data.get('emoji') || '🍽️'; r.ingredients = ingredients; }
    } else {
      state.recipes.push({ id: state.nextRecipeId++, name: data.get('name'), emoji: data.get('emoji') || '🍽️', ingredients });
    }
    recipeDialog.close();
    e.currentTarget.reset();
    render();
  });

  // ── Groceries (categorised) ─────────────────────────────────────────────────────
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

  // ── Lists ─────────────────────────────────────────────────────────────────
  document.querySelectorAll('[data-check-list]').forEach(btn =>
    btn.addEventListener('click', () => {
      const list = state.lists.find(l => l.id === Number(btn.dataset.checkList));
      if (list) { list.items[Number(btn.dataset.itemIdx)].checked = !list.items[Number(btn.dataset.itemIdx)].checked; render(); }
    }));
  document.querySelectorAll('[data-del-list-item]').forEach(btn =>
    btn.addEventListener('click', () => {
      const list = state.lists.find(l => l.id === Number(btn.dataset.delListItem));
      if (list) { list.items.splice(Number(btn.dataset.itemIdx), 1); render(); }
    }));
  document.querySelectorAll('[data-del-list]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.lists = state.lists.filter(l => l.id !== Number(btn.dataset.delList));
      render();
    }));
  const renameListDialog = document.querySelector('#rename-list-dialog');
  document.querySelectorAll('[data-rename-list]').forEach(btn =>
    btn.addEventListener('click', () => {
      const list = state.lists.find(l => l.id === Number(btn.dataset.renameList));
      if (!list) return;
      const f = document.querySelector('#rename-list-form');
      f.querySelector('[name=id]').value = list.id;
      f.querySelector('[name=name]').value = list.name;
      renameListDialog.showModal();
    }));
  document.querySelector('#rename-list-close')?.addEventListener('click', () => renameListDialog.close());
  document.querySelector('#rename-list-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const list = state.lists.find(l => l.id === Number(data.get('id')));
    if (list) list.name = data.get('name');
    renameListDialog.close();
    render();
  });
  document.querySelectorAll('[data-add-list]').forEach(form =>
    form.addEventListener('submit', e => {
      e.preventDefault();
      const list = state.lists.find(l => l.id === Number(form.dataset.addList));
      const item = new FormData(e.currentTarget).get('item').trim();
      if (list && item) { list.items.push({ text: item, checked: false }); e.currentTarget.reset(); render(); }
    }));
  const newListDialog = document.querySelector('#new-list-dialog');
  document.querySelector('#add-list-btn')?.addEventListener('click', () => newListDialog.showModal());
  document.querySelector('#new-list-close')?.addEventListener('click', () => newListDialog.close());
  document.querySelector('#new-list-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = new FormData(e.currentTarget).get('name').trim();
    if (name) { state.lists.push({ id: state.nextListId++, name, items: [] }); newListDialog.close(); e.currentTarget.reset(); render(); }
  });

  // ── Calendar ─────────────────────────────────────────────────────────────
  const calDialog = document.querySelector('#cal-dialog');
  document.querySelectorAll('[data-cal-date]').forEach(cell =>
    cell.addEventListener('click', e => {
      if (e.target.closest('[data-del-event]')) return;
      const dateInput = document.querySelector('#cal-date-input');
      if (dateInput) dateInput.value = cell.dataset.calDate;
      calDialog.showModal();
    }));
  document.querySelector('#cal-close')?.addEventListener('click', () => calDialog.close());
  document.querySelector('#cal-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    state.events.push({ id: state.nextEventId++, title: data.get('title'), date: data.get('date'), time: data.get('time') || 'Anytime', person: data.get('person') || 'Family' });
    calDialog.close();
    e.currentTarget.reset();
    render();
  });
  document.querySelectorAll('[data-del-event]').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      state.events = state.events.filter(ev => ev.id !== Number(btn.dataset.delEvent));
      render();
    }));

  // ── Budget ──────────────────────────────────────────────────────────────
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

  // delete category
  document.querySelectorAll('[data-del-cat]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.budget.categories.splice(Number(btn.dataset.delCat), 1);
      render();
    }));

  // edit category
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

  // add category
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

  // ── Bills ──────────────────────────────────────────────────────────────
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
    // default due date to today
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

  // ── Notifications ─────────────────────────────────────────────────────────
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
    // set datetime-local default to now+1h
    const dt = document.querySelector('#notif-dialog [name=time]');
    if (dt) { const d = new Date(Date.now()+3600000); dt.value = d.toISOString().slice(0,16); }
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
    // fire browser notification if permitted and time is now/past
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
  // ── Profiles ─────────────────────────────────────────────────────────────
  document.querySelectorAll('[data-del-profile]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.profiles.splice(Number(btn.dataset.delProfile), 1);
      render();
    }));
  const profileDialog = document.querySelector('#profile-dialog');
  document.querySelector('#add-profile-btn')?.addEventListener('click', () => profileDialog.showModal());
  document.querySelector('#profile-close')?.addEventListener('click', () => profileDialog.close());
  document.querySelector('#profile-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    state.profiles.push({
      name: data.get('name'),
      emoji: data.get('emoji') || '🧑',
      color: data.get('color'),
      type: data.get('type') || 'adult',
      points: 0,
    });
    profileDialog.close();
    e.currentTarget.reset();
    render();
  });

  // ── Chores ────────────────────────────────────────────────────────────────
  document.querySelectorAll('[data-complete-chore]').forEach(btn =>
    btn.addEventListener('click', () => {
      const chore = state.chores.find(c => c.id === Number(btn.dataset.completeChore));
      if (!chore) return;
      if (!Array.isArray(chore.completedDates)) chore.completedDates = [];
      const today = todayStr();
      if (chore.completedDates.includes(today)) {
        // undo
        chore.completedDates = chore.completedDates.filter(d => d !== today);
        // deduct points
        const profile = state.profiles.find(p => p.name === chore.assignedTo);
        if (profile && profile.type === 'child') profile.points = Math.max(0, (profile.points || 0) - (chore.points || 0));
      } else {
        chore.completedDates.push(today);
        // award points
        const profile = state.profiles.find(p => p.name === chore.assignedTo);
        if (profile && profile.type === 'child') profile.points = (profile.points || 0) + (chore.points || 0);
      }
      render();
    }));
  document.querySelectorAll('[data-del-chore]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.chores = state.chores.filter(c => c.id !== Number(btn.dataset.delChore));
      render();
    }));
  const choreDialog = document.querySelector('#chore-dialog');
  document.querySelector('#add-chore-btn')?.addEventListener('click', () => choreDialog?.showModal());
  document.querySelector('#chore-close')?.addEventListener('click', () => choreDialog?.close());
  document.querySelector('#chore-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const days = data.getAll('days');
    state.chores.push({
      id: state.nextChoreId++,
      title: data.get('title'),
      emoji: data.get('emoji') || '🧹',
      assignedTo: data.get('assignedTo'),
      points: parseInt(data.get('points') || '0', 10),
      days: days.length > 0 ? days : ALL_DAYS,
      completedDates: [],
    });
    choreDialog?.close();
    e.currentTarget.reset();
    render();
  });

  // ── Rewards ───────────────────────────────────────────────────────────────
  document.querySelectorAll('[data-del-reward]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.rewards.splice(Number(btn.dataset.delReward), 1);
      render();
    }));
  document.querySelectorAll('[data-redeem-reward]').forEach(btn =>
    btn.addEventListener('click', () => {
      const reward = state.rewards[Number(btn.dataset.redeemReward)];
      const profile = state.profiles.find(p => p.name === btn.dataset.redeemFor);
      if (!reward || !profile) return;
      if ((profile.points || 0) < reward.cost) return;
      profile.points = (profile.points || 0) - reward.cost;
      render();
    }));
  const rewardDialog = document.querySelector('#reward-dialog');
  document.querySelector('#add-reward-btn')?.addEventListener('click', () => rewardDialog?.showModal());
  document.querySelector('#reward-close')?.addEventListener('click', () => rewardDialog?.close());
  document.querySelector('#reward-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    state.rewards.push({
      id: state.nextRewardId++,
      title: data.get('title'),
      emoji: data.get('emoji') || '🎁',
      cost: parseInt(data.get('cost') || '10', 10),
    });
    rewardDialog?.close();
    e.currentTarget.reset();
    render();
  });

  // ── Routines ──────────────────────────────────────────────────────────────
  document.querySelectorAll('[data-complete-routine]').forEach(btn =>
    btn.addEventListener('click', () => {
      const routine = state.routines.find(r => r.id === Number(btn.dataset.completeRoutine));
      if (!routine) return;
      if (!Array.isArray(routine.completedDates)) routine.completedDates = [];
      const today = todayStr();
      if (routine.completedDates.includes(today)) {
        routine.completedDates = routine.completedDates.filter(d => d !== today);
      } else {
        routine.completedDates.push(today);
      }
      render();
    }));
  document.querySelectorAll('[data-del-routine]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.routines = state.routines.filter(r => r.id !== Number(btn.dataset.delRoutine));
      render();
    }));
  const routineDialog = document.querySelector('#routine-dialog');
  document.querySelector('#add-routine-btn')?.addEventListener('click', () => routineDialog?.showModal());
  document.querySelector('#routine-close')?.addEventListener('click', () => routineDialog?.close());
  document.querySelector('#routine-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const days = data.getAll('days');
    state.routines.push({
      id: state.nextRoutineId++,
      title: data.get('title'),
      emoji: data.get('emoji') || '🔁',
      assignedTo: data.get('assignedTo') || 'Everyone',
      timeOfDay: data.get('timeOfDay') || 'morning',
      days: days.length > 0 ? days : ALL_DAYS,
      reminder: data.get('reminder') === '1',
      reminderTime: data.get('reminderTime') || null,
      completedDates: [],
    });
    routineDialog?.close();
    e.currentTarget.reset();
    render();
  });
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
