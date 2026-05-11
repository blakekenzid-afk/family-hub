import { state } from '../main.js';

export function renderProfiles() {
  return `
    <div class="page">
      <header class="tasks-header">
        <button class="back-btn" type="button" data-nav="home">←</button>
        <h1 class="tasks-date">Profiles</h1>
        <div class="tasks-nav"></div>
      </header>
      <div class="profiles-grid">
        ${state.profiles.map((p, i) => `
          <div class="profile-card ${p.color}">
            <button class="del-sm profile-del" data-del-profile="${i}" type="button" aria-label="Remove">×</button>
            <div class="profile-avatar">${p.emoji}</div>
            <span class="profile-name">${p.name}</span>
            <span class="profile-type-badge">${p.type === 'child' ? '👶 Child' : '🧑 Adult'}</span>
            ${p.type === 'child' ? `<span class="profile-points">⭐ ${p.points || 0} pts</span>` : ''}
          </div>`).join('')}
      </div>
      <button class="add-list-btn" id="add-profile-btn" type="button" style="margin-top:16px">+ Add Person</button>
      <dialog class="event-dialog" id="profile-dialog">
        <form class="dialog-card" id="profile-form">
          <button class="close-btn" type="button" id="profile-close">×</button>
          <p class="eyebrow">New Profile</p>
          <label>Name <input required name="name" placeholder="Sam"></label>
          <label>Emoji <input name="emoji" placeholder="🧑" maxlength="2" value="🧑"></label>
          <label>Type
            <select name="type">
              <option value="adult">Adult</option>
              <option value="child">Child</option>
            </select>
          </label>
          <label>Color
            <select name="color">
              <option value="lavender">Lavender</option>
              <option value="blue">Blue</option>
              <option value="pink">Pink</option>
              <option value="green">Green</option>
              <option value="orange">Orange</option>
              <option value="teal">Teal</option>
              <option value="yellow">Yellow</option>
              <option value="red">Red</option>
            </select>
          </label>
          <button class="primary-btn full" type="submit">Add Person</button>
        </form>
      </dialog>
    </div>`;
}
