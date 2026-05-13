// Profiles handlers
import { createDialogSetup } from '../utils/dialogFactory.js';

export function setupProfiles(state, render) {
  // Unified click delegation for profile interactions
  const pageEl = document.querySelector('.page');
  if (pageEl) {
    pageEl.addEventListener('click', (e) => {
      // Delete profile button
      if (e.target.closest('[data-del-profile]')) {
        const btn = e.target.closest('[data-del-profile]');
        const profileId = Number(btn.dataset.delProfile);
        state.profiles = state.profiles.filter(p => p.id !== profileId);
        render();
        return;
      }

      // Edit profile button
      if (e.target.closest('[data-edit-profile]')) {
        const btn = e.target.closest('[data-edit-profile]');
        const profileId = Number(btn.dataset.editProfile);
        const profile = state.profiles.find(p => p.id === profileId);
        if (!profile) return;

        const form = document.querySelector('#profile-form');
        form.querySelector('[name=profile-id]').value = profileId;
        form.querySelector('[name=name]').value = profile.name;
        form.querySelector('[name=emoji]').value = profile.emoji;
        form.querySelector('[name=type]').value = profile.type;
        form.querySelector('[name=color]').value = profile.color;
        document.querySelector('#profile-dialog').showModal();
        return;
      }
    });
  }

  // Add/Edit profile dialog handler
  const addProfileSetup = createDialogSetup({
    dialogId: 'profile-dialog',
    openBtnId: 'add-profile-btn',
    closeBtnId: 'profile-close',
    formId: 'profile-form',
    onBeforeOpen: () => {
      // Clear the form for new profile
      const form = document.querySelector('#profile-form');
      form.querySelector('[name=profile-id]').value = '';
    },
    onSubmit: (data) => {
      const profileId = data.get('profile-id');
      if (profileId) {
        // Edit existing profile
        const profile = state.profiles.find(p => p.id === Number(profileId));
        if (profile) {
          profile.name = data.get('name');
          profile.emoji = data.get('emoji') || '🧑';
          profile.type = data.get('type');
          profile.color = data.get('color');
        }
      } else {
        // Create new profile
        state.profiles.push({
          id: state.nextProfileId++,
          name: data.get('name'),
          emoji: data.get('emoji') || '🧑',
          color: data.get('color'),
          type: data.get('type') || 'adult',
          points: 0,
        });
      }
    },
  });
  addProfileSetup(state, render);
}
