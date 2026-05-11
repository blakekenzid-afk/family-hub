// Profiles handlers
export function setupProfiles(state, render) {
  document.querySelectorAll('[data-del-profile]').forEach(btn =>
    btn.addEventListener('click', () => {
      state.profiles.splice(Number(btn.dataset.delProfile), 1);
      render();
    }));

  const profileDialog = document.querySelector('#profile-dialog');
  document.querySelector('#add-profile-btn')?.addEventListener('click', () => profileDialog.showModal());
  document.querySelector('#profile-close')?.addEventListener('click', () => profileDialog.close());
  document.querySelector('#profile-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    state.profiles.push({
      name: data.get('name'),
      emoji: data.get('emoji') || '🧑',
      color: data.get('color'),
      type: data.get('type') || 'adult',
      points: 0,
    });
    profileDialog.close();
    e.currentTarget.reset();
    render();
  });
}
