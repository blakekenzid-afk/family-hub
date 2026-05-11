import { state } from '../main.js';
import { GROCERY_PALETTE } from '../utils/constants.js';

export function renderGroceries() {
  return `
    <div class="page">
      <header class="tasks-header">
        <button class="back-btn" type="button" data-nav="home">←</button>
        <h1 class="tasks-date">Grocery List</h1>
        <div class="tasks-nav"></div>
      </header>
      ${state.groceries.map((cat, ci) => {
        const pal = GROCERY_PALETTE[ci % GROCERY_PALETTE.length];
        const doneCount = cat.items.filter(i => i.checked).length;
        return `
        <div class="grocery-cat-block">
          <div class="grocery-cat-row">
            <div class="grocery-cat-header" style="background:${pal.bg};color:${pal.text}">${cat.category}</div>
            <span class="cat-count">${doneCount}/${cat.items.length}</span>
            <button class="icon-btn" data-rename-grocery-cat="${ci}" type="button" style="font-size:0.8rem">✏️</button>
            <button class="del-sm" data-del-grocery-cat="${ci}" type="button" aria-label="Delete category">×</button>
          </div>
          <div class="item-list">
            ${cat.items.map((item, ii) => `
              <div class="item-row${item.checked ? ' item-checked' : ''}">
                <button class="check-circle${item.checked ? ' done' : ''}" data-check-grocery data-ci="${ci}" data-ii="${ii}" type="button" aria-label="Toggle"></button>
                <span class="item-text">${item.text}</span>
                <button class="del-sm" data-del-grocery-item data-ci="${ci}" data-ii="${ii}" type="button" aria-label="Remove">×</button>
              </div>`).join('')}
          </div>
          <form class="add-item-form" data-add-grocery="${ci}">
            <input name="item" placeholder="Add to ${cat.category}..." required>
            <button type="submit" class="add-item-submit">Add</button>
          </form>
        </div>`;
      }).join('')}
      <form class="add-item-form" id="add-grocery-cat-form" style="margin-top:8px">
        <input name="cat" placeholder="New category name..." required>
        <button type="submit" class="add-item-submit">+ Category</button>
      </form>
      <dialog class="event-dialog" id="rename-grocery-cat-dialog">
        <form class="dialog-card" id="rename-grocery-cat-form">
          <button class="close-btn" type="button" id="rename-grocery-cat-close">×</button>
          <p class="eyebrow">Rename Category</p>
          <input type="hidden" name="ci">
          <label>Name <input required name="name" placeholder="Produce"></label>
          <button class="primary-btn full" type="submit">Save</button>
        </form>
      </dialog>
    </div>`;
}
