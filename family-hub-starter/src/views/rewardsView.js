import { state } from '../main.js';

export function renderRewards() {
  const kids = state.profiles.filter(p => p.type === 'child');

  const balanceCards = kids.map(p => `
    <div class="rewards-balance-card ${p.color}">
      <div class="rewards-balance-name">${p.emoji} ${p.name}</div>
      <div class="rewards-balance-pts">${p.points || 0}</div>
      <div class="rewards-balance-star">⭐ points</div>
    </div>`).join('');

  const rewardCards = state.rewards.map((r, ri) => {
    const redeemOptions = kids.map(k =>
      `<button class="redeem-btn" data-redeem-reward="${ri}" data-redeem-for="${k.name}" type="button"${(k.points || 0) < r.cost ? ' disabled' : ''}>${k.name}</button>`
    ).join('');
    return `
      <div class="reward-card">
        <div class="reward-emoji">${r.emoji || '🎁'}</div>
        <div class="reward-info">
          <div class="reward-title">${r.title}</div>
          <div class="reward-cost">⭐ ${r.cost} points</div>
        </div>
        <div class="reward-redeem-row">
          ${kids.length ? redeemOptions : '<span style="font-size:0.75rem;color:var(--muted)">No kids</span>'}
          <button class="del-sm" data-del-reward="${ri}" type="button" aria-label="Delete">×</button>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="page">
      <header class="tasks-header">
        <button class="back-btn" type="button" data-nav="home">←</button>
        <h1 class="tasks-date">Rewards</h1>
        <div class="tasks-nav"></div>
      </header>

      ${kids.length > 0 ? `
        <h3 class="section-label">Points Balance</h3>
        <div class="rewards-balance-grid">${balanceCards}</div>` : ''}

      <h3 class="section-label">Reward Store</h3>
      ${state.rewards.length === 0
        ? `<p style="color:var(--muted);text-align:center;padding:32px 0">No rewards yet — add some! ⭐</p>`
        : rewardCards}

      <button class="add-txn-btn" id="add-reward-btn" type="button" style="background:var(--nv-purple);color:#5c00aa">+ Add Reward</button>

      <dialog class="event-dialog" id="reward-dialog">
        <form class="dialog-card" id="reward-form">
          <button class="close-btn" type="button" id="reward-close">×</button>
          <p class="eyebrow">New Reward</p>
          <label>Title <input required name="title" placeholder="Movie night"></label>
          <label>Emoji <input name="emoji" placeholder="🎁" maxlength="2" value="🎁"></label>
          <label>Point cost <input required name="cost" type="number" min="1" placeholder="50"></label>
          <button class="primary-btn full" type="submit">Save Reward</button>
        </form>
      </dialog>
    </div>`;
}
