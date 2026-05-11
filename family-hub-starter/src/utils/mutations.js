/**
 * State Mutations Utility
 * Provides reusable helpers for common state mutation patterns
 */

/**
 * Toggles a date in a completedDates array
 * Used for recurring tasks like tasks, chores, routines
 * @param {Array} completedDates - Array of date strings (YYYY-MM-DD format)
 * @param {string} dateStr - Date to toggle
 * @returns {Array} Updated completedDates array
 */
export function toggleCompletedDate(completedDates, dateStr) {
  if (!Array.isArray(completedDates)) {
    completedDates = [];
  }

  if (completedDates.includes(dateStr)) {
    return completedDates.filter(d => d !== dateStr);
  } else {
    completedDates.push(dateStr);
    return completedDates;
  }
}

/**
 * Awards or deducts points from a profile
 * @param {Object} profile - Profile object with points
 * @param {number} pointsToAward - Positive or negative points
 * @returns {number} Updated points (clamped to minimum 0)
 */
export function updateProfilePoints(profile, pointsToAward) {
  if (!profile) return 0;
  profile.points = Math.max(0, (profile.points || 0) + pointsToAward);
  return profile.points;
}

/**
 * Finds profile by name
 * @param {Array} profiles - Array of profile objects
 * @param {string} name - Profile name to find
 * @returns {Object|undefined} The matching profile or undefined
 */
export function findProfileByName(profiles, name) {
  return profiles?.find(p => p.name === name);
}

/**
 * Finds item by ID in array
 * @param {Array} items - Array of items with id property
 * @param {number} id - ID to find
 * @returns {Object|undefined} The matching item or undefined
 */
export function findItemById(items, id) {
  return items?.find(item => item.id === id);
}

/**
 * Removes item by ID from array
 * @param {Array} items - Array of items with id property
 * @param {number} id - ID to remove
 * @returns {Array} New array without the item
 */
export function removeItemById(items, id) {
  return items?.filter(item => item.id !== id) || [];
}
