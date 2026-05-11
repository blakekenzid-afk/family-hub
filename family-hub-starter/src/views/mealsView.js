import { state } from '../main.js';

export function renderMeals() {
  const hasSelected = state.selectedRecipeId !== null;
  const selRecipe = state.recipes.find(r => r.id === state.selectedRecipeId);
  return `
    <div class="page">
      <header class="tasks-header">
        <button class="back-btn" type="button" data-nav="home">←</button>
        <h1 class="tasks-date">Meals & Recipes</h1>
        <div class="tasks-nav"></div>
      </header>

      <h3 class="section-label">This Week</h3>
      ${hasSelected ? `<div class="assign-hint">Tap a day to assign <strong>${selRecipe ? selRecipe.emoji + ' ' + selRecipe.name : ''}</strong></div>` : '<p class="meals-hint">Drag a recipe onto a day — or tap a recipe, then tap a day</p>'}
      <div class="simple-list meal-week">
        ${state.meals.map((m, i) => state.editingMealIdx === i
          ? `<div class="simple-row meal-drop-zone" data-drop-day="${i}">
               <span class="simple-day">${m.day}</span>
               <form class="meal-edit-form" data-meal-idx="${i}">
                 <input class="meal-edit-input" name="meal" value="${m.meal}" required autofocus>
                 <button class="icon-btn" type="submit">✓</button>
               </form>
             </div>`
          : `<div class="simple-row meal-drop-zone${hasSelected ? ' droppable' : ''}" data-drop-day="${i}">
               <span class="simple-day">${m.day}</span>
               <span class="simple-meal">${m.meal || '<span class="meal-empty">drag a recipe here</span>'}</span>
               <button class="edit-icon-btn" data-edit-meal="${i}" type="button">✏️</button>
             </div>`
        ).join('')}
      </div>

      <h3 class="section-label" style="margin-top:26px">Recipes</h3>
      <div class="recipe-grid">
        ${state.recipes.map(r => `
          <div class="recipe-card${state.selectedRecipeId === r.id ? ' selected' : ''}"
               draggable="true" data-recipe-id="${r.id}" data-select-recipe="${r.id}">
            <button class="del-sm recipe-del-btn" data-del-recipe="${r.id}" type="button" aria-label="Delete">×</button>
            <div class="recipe-emoji">${r.emoji}</div>
            <div class="recipe-name">${r.name}</div>
            <div class="recipe-ing-count">${r.ingredients.length} ingredient${r.ingredients.length !== 1 ? 's' : ''}</div>
            ${r.ingredients.length ? `<div class="recipe-ing-preview">${r.ingredients.slice(0,3).join(', ')}${r.ingredients.length > 3 ? '…' : ''}</div>` : ''}
          </div>`).join('')}
        <button class="recipe-add-card" id="add-recipe-btn" type="button">
          <span class="recipe-add-icon">+</span>
          <span>New Recipe</span>
        </button>
      </div>

      <dialog class="event-dialog" id="recipe-dialog">
        <form class="dialog-card" id="recipe-form">
          <button class="close-btn" type="button" id="recipe-close">×</button>
          <p class="eyebrow" id="recipe-dialog-title">New Recipe</p>
          <input type="hidden" name="recipe-id" value="">
          <label>Name        <input required name="name" placeholder="Chicken Tacos"></label>
          <label>Emoji       <input name="emoji" maxlength="2" placeholder="🍽️" value="🍽️"></label>
          <label>Ingredients
            <textarea name="ingredients" class="recipe-textarea"
              placeholder="One per line:&#10;Chicken breast&#10;Tortillas&#10;Salsa" rows="5"></textarea>
          </label>
          <button class="primary-btn full" type="submit">Save Recipe</button>
        </form>
      </dialog>
    </div>`;
}
