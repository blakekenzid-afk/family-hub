export const TIME_ICONS = { morning: '🌤️', afternoon: '☀️', evening: '🌙' };
export const TIME_LABELS = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' };

export const EVENT_CATEGORIES = ['birthday', 'appointment', 'holiday', 'vacation', 'other'];
export const EVENT_CATEGORY_EMOJIS = {
  'birthday': '🎂',
  'appointment': '🏥',
  'holiday': '🎉',
  'vacation': '✈️',
  'other': '📅'
};

export const NAV_ITEMS = [
  { label: 'Tasks', icon: '✅', view: 'tasks', cls: 'nv-green' },
  { label: 'Calendar', icon: '📅', view: 'calendar', cls: 'nv-red' },
  { label: 'Meals', icon: '🍽️', view: 'meals', cls: 'nv-tan' },
  { label: 'Lists', icon: '📋', view: 'lists', cls: 'nv-yellow' },
  { label: 'Groceries', icon: '🛒', view: 'groceries', cls: 'nv-blue' },
  { label: 'Budget', icon: '💰', view: 'budget', cls: 'nv-mint' },
  { label: 'Chores', icon: '🧹', view: 'chores', cls: 'nv-orange' },
  { label: 'Rewards', icon: '⭐', view: 'rewards', cls: 'nv-purple' },
  { label: 'Routines', icon: '🔁', view: 'routines', cls: 'nv-teal' },
  { label: 'Profiles', icon: '👥', view: 'profiles', cls: 'nv-gray' },
];

export const GROCERY_PALETTE = [
  { bg: '#d5f0dd', text: '#22703d' },
  { bg: '#d5e8ff', text: '#1554a0' },
  { bg: '#fff0c0', text: '#8a6300' },
  { bg: '#ffdde8', text: '#a82d60' },
  { bg: '#ead5ff', text: '#592fa0' },
  { bg: '#ffe0cc', text: '#a04010' },
  { bg: '#d5f5f5', text: '#1a7070' },
];

export const ALL_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function fmtShort(date) {
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function fmtLong(date) {
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

export function todayDayShort() {
  return ALL_DAYS[new Date().getDay()];
}

export function isDueToday(item) {
  const d = todayDayShort();
  if (!item.days || item.days.length === 0) return true;
  return item.days.includes(d);
}

export function isCompletedToday(item) {
  return Array.isArray(item.completedDates) && item.completedDates.includes(todayStr());
}

export function dayLabel(days) {
  if (!days || days.length === 7) return 'Daily';
  if (days.length === 5 && !days.includes('Sat') && !days.includes('Sun')) return 'Weekdays';
  if (days.length === 2 && days.includes('Sat') && days.includes('Sun')) return 'Weekends';
  return days.join(', ');
}

export function dayPickerHtml(name, selected = ALL_DAYS) {
  return `<div class="days-picker">${ALL_DAYS.map(d => `
    <label>
      <input type="checkbox" name="${name}" value="${d}"${selected.includes(d) ? ' checked' : ''}>
      <span>${d}</span>
    </label>`).join('')}</div>`;
}

export function getEmojiForCategory(cat) {
  return EVENT_CATEGORY_EMOJIS[cat] || EVENT_CATEGORY_EMOJIS['other'];
}
