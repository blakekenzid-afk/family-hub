// Rewards handlers
import { createDialogSetup, createDeleteHandler } from '../utils/dialogFactory.js';
import { findProfileByName, updateProfilePoints } from '../utils/mutations.js';

export function setupRewards(state, render) {
  // Delete reward handler
  createDeleteHandler('data-del-reward', 'rewards')(state, render);

  // Redeem reward handler
  document.querySelectorAll('[data-redeem-reward]').forEach(btn =>
    btn.addEventListener('click', () => {
      const reward = state.rewards[Number(btn.dataset.redeemReward)];
      const profile = findProfileByName(state.profiles, btn.dataset.redeemFor);
      if (!reward || !profile) return;
      if ((profile.points || 0) < reward.cost) return;
      updateProfilePoints(profile, -reward.cost);
      render();
    }));

  // Add reward dialog handler
  const addRewardSetup = createDialogSetup({
    dialogId: 'reward-dialog',
    openBtnId: 'add-reward-btn',
    closeBtnId: 'reward-close',
    formId: 'reward-form',
    onSubmit: (data) => {
      state.rewards.push({
        id: state.nextRewardId++,
        title: data.get('title'),
        emoji: data.get('emoji') || '🎁',
        cost: parseInt(data.get('cost') || '10', 10),
      });
    },
  });
  addRewardSetup(state, render);
}
