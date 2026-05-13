// Meals and Recipes handlers
export function setupMeals(state, render, assignRecipeToDay) {
  // Unified click delegation handler for meal interactions
  const pageEl = document.querySelector('.page');
  if (pageEl) {
    pageEl.addEventListener('click', (e) => {
      // Edit meal button
      if (e.target.closest('[data-edit-meal]')) {
        const btn = e.target.closest('[data-edit-meal]');
        state.editingMealIdx = Number(btn.dataset.editMeal);
        render();
        return;
      }

      // Select recipe card
      if (e.target.closest('[data-select-recipe]')) {
        if (e.target.closest('[data-del-recipe]')) return;
        const card = e.target.closest('[data-select-recipe]');
        const id = Number(card.dataset.selectRecipe);
        state.selectedRecipeId = state.selectedRecipeId === id ? null : id;
        render();
        return;
      }

      // Delete recipe
      if (e.target.closest('[data-del-recipe]')) {
        e.stopPropagation();
        const btn = e.target.closest('[data-del-recipe]');
        const id = Number(btn.dataset.delRecipe);
        state.recipes = state.recipes.filter(r => r.id !== id);
        if (state.selectedRecipeId === id) state.selectedRecipeId = null;
        render();
        return;
      }

      // Tap-to-assign on drop zone (mobile)
      if (e.target.closest('.meal-drop-zone')) {
        const zone = e.target.closest('.meal-drop-zone');
        if (e.target.closest('[data-edit-meal]')) return;
        if (state.selectedRecipeId !== null) {
          assignRecipeToDay(state.selectedRecipeId, Number(zone.dataset.dropDay));
        }
        return;
      }
    });

    // Drag-and-drop on recipe cards
    pageEl.addEventListener('dragstart', (e) => {
      if (e.target.closest('[data-recipe-id]')) {
        const card = e.target.closest('[data-recipe-id]');
        e.dataTransfer.setData('recipeId', card.dataset.recipeId);
        card.classList.add('dragging');
      }
    });

    pageEl.addEventListener('dragend', (e) => {
      if (e.target.closest('[data-recipe-id]')) {
        const card = e.target.closest('[data-recipe-id]');
        card.classList.remove('dragging');
      }
    });

    // Drop zones on day rows
    pageEl.addEventListener('dragover', (e) => {
      const zone = e.target.closest('.meal-drop-zone');
      if (!zone) return;
      e.preventDefault();
      zone.classList.add('drag-over');
    });

    pageEl.addEventListener('dragleave', (e) => {
      const zone = e.target.closest('.meal-drop-zone');
      if (!zone) return;
      zone.classList.remove('drag-over');
    });

    pageEl.addEventListener('drop', (e) => {
      const zone = e.target.closest('.meal-drop-zone');
      if (!zone) return;
      e.preventDefault();
      zone.classList.remove('drag-over');
      const recipeId = Number(e.dataTransfer.getData('recipeId'));
      assignRecipeToDay(recipeId, Number(zone.dataset.dropDay));
    });
  }

  // Meal edit form submission - use delegated handler since form gets re-rendered
  const appEl = document.querySelector('#app');
  if (appEl) {
    appEl.addEventListener('submit', (e) => {
      if (e.target.closest('.meal-edit-form')) {
        e.preventDefault();
        const form = e.target.closest('.meal-edit-form');
        const data = new FormData(form);
        state.meals[Number(form.dataset.mealIdx)].meal = data.get('meal');
        state.editingMealIdx = null;
        render();
      }
    }, true); // Use capture phase for form submission
  }

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
}
