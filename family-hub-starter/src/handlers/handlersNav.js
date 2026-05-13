// Navigation and common handlers
export function setupNav(state, render) {
  // Unified click delegation for navigation
  const pageEl = document.querySelector('.page');
  if (pageEl) {
    pageEl.addEventListener('click', (e) => {
      // Navigation buttons (data-nav)
      if (e.target.closest('[data-nav]')) {
        const btn = e.target.closest('[data-nav]');
        state.view = btn.dataset.nav;
        render();
        return;
      }

      // Previous day button
      if (e.target.matches('#prev-day') || e.target.closest('#prev-day')) {
        state.currentDate.setDate(state.currentDate.getDate() - 1);
        render();
        return;
      }

      // Next day button
      if (e.target.matches('#next-day') || e.target.closest('#next-day')) {
        state.currentDate.setDate(state.currentDate.getDate() + 1);
        render();
        return;
      }

      // Today button
      if (e.target.matches('#today-btn') || e.target.closest('#today-btn')) {
        state.currentDate = new Date();
        render();
        return;
      }
    });
  }
}

