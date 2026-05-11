/**
 * Dialog Factory Utility
 * Abstracts the repeated dialog pattern used across all handlers
 * Provides a factory function to create setup functions for dialogs with forms
 */

/**
 * Creates a dialog setup function with standard open/close/submit behavior
 * @param {Object} config - Configuration object
 * @param {string} config.dialogId - ID of the dialog element (without #)
 * @param {string} config.openBtnId - ID of the button that opens the dialog (without #)
 * @param {string} config.closeBtnId - ID of the button that closes the dialog (without #)
 * @param {string} config.formId - ID of the form inside the dialog (without #)
 * @param {Function} config.onSubmit - Handler called on form submit with (formData, e) parameters
 * @returns {Function} A setup function to be called with (state, render) signature
 */
export function createDialogSetup(config) {
  return function setup(state, render) {
    const dialog = document.querySelector(`#${config.dialogId}`);
    const openBtn = document.querySelector(`#${config.openBtnId}`);
    const closeBtn = document.querySelector(`#${config.closeBtnId}`);
    const form = document.querySelector(`#${config.formId}`);

    openBtn?.addEventListener('click', () => dialog?.showModal());
    closeBtn?.addEventListener('click', () => dialog?.close());

    form?.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      config.onSubmit(data, e, state, render);
      dialog?.close();
      e.currentTarget.reset();
      render();
    });
  };
}

/**
 * Creates event listener attachment for delete buttons with array mutation
 * @param {string} selectorAttr - Data attribute name for the delete buttons (e.g. 'data-del-routine')
 * @param {string} stateKey - Key in state object (e.g. 'routines')
 * @param {Function} deleteHandler - Optional custom delete handler that receives (btn, item, state, render)
 * @returns {Function} A setup function to be called with (state, render) signature
 */
export function createDeleteHandler(selectorAttr, stateKey, deleteHandler) {
  return function setup(state, render) {
    document.querySelectorAll(`[${selectorAttr}]`).forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = Number(btn.dataset[selectorAttr.replace('data-', '')]);
        const item = state[stateKey]?.[itemId];

        if (deleteHandler) {
          deleteHandler(btn, item, state, render);
        } else {
          // Default: splice by index
          state[stateKey]?.splice(itemId, 1);
        }
        render();
      });
    });
  };
}
