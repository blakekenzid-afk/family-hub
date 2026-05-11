// Meals and Recipes handlers
export function setupMeals(state, render, assignRecipeToDay) {
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
    // Tap-to-assign (mobile)
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
}
