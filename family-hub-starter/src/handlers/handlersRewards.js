// Rewards handlers
export function setupRewards(state, render) {
  document.querySelectorAll('[data-del-reward]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.rewards.splice(Number(btn.dataset.delReward), 1);
      render();
    }));

  document.querySelectorAll('[data-redeem-reward]').forEach(btn =>
    btn.addEventListener('click', () => {
      const reward = state.rewards[Number(btn.dataset.redeemReward)];
      const profile = state.profiles.find(p => p.name === btn.dataset.redeemFor);
      if (!reward || !profile) return;
      if ((profile.points || 0) < reward.cost) return;
      profile.points = (profile.points || 0) - reward.cost;
      render();
    }));

  const rewardDialog = document.querySelector('#reward-dialog');
  document.querySelector('#add-reward-btn')?.addEventListener('click', () => rewardDialog?.showModal());
  document.querySelector('#reward-close')?.addEventListener('click', () => rewardDialog?.close());
  document.querySelector('#reward-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    state.rewards.push({
      id: state.nextRewardId++,
      title: data.get('title'),
      emoji: data.get('emoji') || '🎁',
      cost: parseInt(data.get('cost') || '10', 10),
    });
    rewardDialog?.close();
    e.currentTarget.reset();
    render();
  });
}
