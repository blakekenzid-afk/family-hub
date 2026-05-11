import { state } from '../main.js';

export function renderLists() {
  return `
    <div class="page">
      <header class="tasks-header">
        <button class="back-btn" type="button" data-nav="home">←</button>
        <h1 class="tasks-date">Lists</h1>
        <div class="tasks-nav"></div>
      </header>
      <div class="lists-wrap">
        ${state.lists.map(list => {
          const doneCount = list.items.filter(i => i.checked).length;
          return `
          <div class="list-card">
            <div class="list-card-header">
              <h3 class="list-card-title">${list.name}</h3>
              <span class="cat-count">${doneCount}/${list.items.length}</span>
              <button class="icon-btn" data-rename-list="${list.id}" type="button" style="font-size:0.8rem">✏️</button>
              <button class="del-sm" data-del-list="${list.id}" type="button" aria-label="Delete list">×</button>
            </div>
            <div class="list-items">
              ${list.items.map((item, i) => `
                <div class="list-item-row${item.checked ? ' item-checked' : ''}">
                  <button class="check-circle${item.checked ? ' done' : ''}" data-check-list="${list.id}" data-item-idx="${i}" type="button" aria-label="Toggle"></button>
                  <span class="item-text">${item.text}</span>
                  <button class="del-sm" data-del-list-item="${list.id}" data-item-idx="${i}" type="button" aria-label="Remove">×</button>
                </div>`).join('')}
            </div>
            <form class="add-item-form" data-add-list="${list.id}">
              <input name="item" placeholder="Add item..." required>
              <button type="submit" class="add-item-submit">Add</button>
            </form>
          </div>`;
        }).join('')}
      </div>
      <button class="add-list-btn" id="add-list-btn" type="button">+ New List</button>
      <dialog class="event-dialog" id="new-list-dialog">
        <form class="dialog-card" id="new-list-form">
          <button class="close-btn" type="button" id="new-list-close">×</button>
          <p class="eyebrow">New List</p>
          <label>List name <input required name="name" placeholder="Vacation packing"></label>
          <button class="primary-btn full" type="submit">Create List</button>
        </form>
      </dialog>
      <dialog class="event-dialog" id="rename-list-dialog">
        <form class="dialog-card" id="rename-list-form">
          <button class="close-btn" type="button" id="rename-list-close">×</button>
          <p class="eyebrow">Rename List</p>
          <input type="hidden" name="id">
          <label>Name <input required name="name" placeholder="Shopping list"></label>
          <button class="primary-btn full" type="submit">Save</button>
        </form>
      </dialog>
    </div>`;
}
