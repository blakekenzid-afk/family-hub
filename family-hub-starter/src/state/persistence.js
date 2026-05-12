import { get, set, stateRef } from '../firebase.js';

let firebaseReady = false;
let syncStatus = 'idle';
let lastSyncTime = null;
let savePending = false;
let saveTimeout = null;

const DEBOUNCE_MS = 2000;
const STORAGE_KEY = 'family-hub-backup';

export function getFirebaseReady() {
  return firebaseReady;
}

export function getSyncStatus() {
  return syncStatus;
}

export function getLastSyncTime() {
  return lastSyncTime;
}

export function saveToLocalStorage(state) {
  try {
    const s = { ...state, currentDate: state.currentDate.toISOString() };
    delete s.editingMealIdx;
    delete s.selectedRecipeId;
    delete s.budgetViewMonth;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('localStorage save failed:', e.message);
  }
}

export function saveState(state) {
  if (!firebaseReady) return;

  saveToLocalStorage(state);

  savePending = true;
  clearTimeout(saveTimeout);

  saveTimeout = setTimeout(async () => {
    if (!savePending) return;
    savePending = false;

    try {
      syncStatus = 'syncing';
      const s = { ...state, currentDate: state.currentDate.toISOString() };
      delete s.editingMealIdx;
      delete s.selectedRecipeId;
      delete s.budgetViewMonth;
      await set(stateRef, s);
      syncStatus = 'idle';
      lastSyncTime = new Date();
    } catch (err) {
      console.error('Firebase sync failed:', err.message);
      syncStatus = 'error';
    }
  }, DEBOUNCE_MS);
}

export async function loadState(state) {
  try {
    const snapshot = await get(stateRef);
    if (!snapshot.exists()) {
      firebaseReady = true;
      return;
    }
    const saved = snapshot.val();
    applyStateSnapshot(state, saved);
    saveToLocalStorage(state);
    lastSyncTime = new Date();
    firebaseReady = true;
  } catch (err) {
    console.error('Firebase load failed:', err.message);
    try {
      const backup = localStorage.getItem(STORAGE_KEY);
      if (backup) {
        const saved = JSON.parse(backup);
        applyStateSnapshot(state, saved);
        console.log('Recovered state from localStorage');
      }
    } catch (storageErr) {
      console.error('localStorage recovery failed:', storageErr.message);
    }
    firebaseReady = true;
  }
}

export function applyStateSnapshot(state, saved) {
  Object.assign(state, saved);
  state.currentDate = saved.currentDate ? new Date(saved.currentDate) : new Date();
  state.budgetViewMonth = saved.budgetViewMonth ? new Date(saved.budgetViewMonth) : new Date();
  state.editingMealIdx = null;
  state.selectedRecipeId = null;

  // Convert objects to arrays while preserving numeric key order
  // Handles Firebase's obj storage: {0: item, 1: item, 2: item}
  const toArr = v => {
    if (Array.isArray(v)) return v;
    if (!v || typeof v !== 'object') return [];
    // Sort numeric keys to preserve intended array order
    return Object.keys(v)
      .filter(k => !isNaN(k))
      .sort((a, b) => Number(a) - Number(b))
      .map(k => v[k]);
  };
  state.tasks = toArr(state.tasks);
  state.events = toArr(state.events);
  state.groceries = toArr(state.groceries).map(c => ({ ...c, items: toArr(c.items) }));
  state.lists = toArr(state.lists).map(l => ({ ...l, items: toArr(l.items) }));
  state.profiles = toArr(state.profiles).map(p => ({ type: 'adult', points: 0, ...p }));
  state.notifications = toArr(state.notifications);
  state.recipes = toArr(state.recipes).map(r => ({ ...r, ingredients: toArr(r.ingredients) }));
  state.chores = toArr(state.chores).map(c => ({ ...c, days: toArr(c.days), completedDates: toArr(c.completedDates) }));
  state.rewards = toArr(state.rewards);
  state.routines = toArr(state.routines).map(r => ({ ...r, days: toArr(r.days), completedDates: toArr(r.completedDates) }));
  state.bills = toArr(state.bills);

  const mealsArr = toArr(state.meals);
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  if (mealsArr.length > 0) {
    // Preserve day order; restore missing days
    const mealsByDay = {};
    mealsArr.forEach(m => { if (m && m.day) mealsByDay[m.day] = m; });
    state.meals = DAYS.map(day => mealsByDay[day] || { day, meal: '' });
  } else {
    state.meals = DAYS.map(day => ({ day, meal: '' }));
  }

  if (!state.budget || typeof state.budget !== 'object') {
    state.budget = { periodAmount: 0, periodType: 'monthly', categories: [], transactions: [] };
  } else {
    // Backward compatibility: migrate budget.monthly → budget.periodAmount
    const periodAmount = typeof state.budget.periodAmount === 'number' ? state.budget.periodAmount :
                        (typeof state.budget.monthly === 'number' ? state.budget.monthly : 0);
    state.budget.periodAmount = periodAmount;
    state.budget.periodType = state.budget.periodType || 'monthly';
    state.budget.categories = toArr(state.budget.categories);
    state.budget.transactions = toArr(state.budget.transactions);
  }
}
