// Profiles handlers
import { createDialogSetup, createDeleteHandler } from '../utils/dialogFactory.js';

export function setupProfiles(state, render) {
  // Delete profile handler
  createDeleteHandler('data-del-profile', 'profiles')(state, render);

  // Add profile dialog handler
  const addProfileSetup = createDialogSetup({
    dialogId: 'profile-dialog',
    openBtnId: 'add-profile-btn',
    closeBtnId: 'profile-close',
    formId: 'profile-form',
    onSubmit: (data) => {
      state.profiles.push({
        id: state.nextProfileId++,
        name: data.get('name'),
        emoji: data.get('emoji') || '🧑',
        color: data.get('color'),
        type: data.get('type') || 'adult',
        points: 0,
      });
    },
  });
  addProfileSetup(state, render);
}
