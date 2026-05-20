let container = null;

const ICONS = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
};

/**
 * Initializes the toast container. Call once on app startup.
 */
export function initToastContainer() {
  if (container) return;

  container = document.createElement('div');
  container.className = 'toast-container';
  container.id = 'toast-container';
  document.body.appendChild(container);
}

/**
 * Shows a toast notification.
 * @param {string} message - Text to display
 * @param {'success' | 'error' | 'info'} type - Toast type
 */
export function showToast(message, type = 'info') {
  if (!container) initToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  icon.textContent = ICONS[type] || ICONS.info;

  const text = document.createElement('span');
  text.className = 'toast-message';
  text.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Close notification');
  closeBtn.addEventListener('click', () => dismiss(toast));

  toast.appendChild(icon);
  toast.appendChild(text);
  toast.appendChild(closeBtn);

  container.appendChild(toast);

  // Trigger slide-in animation
  requestAnimationFrame(() => {
    toast.classList.add('toast-visible');
  });

  // Auto-dismiss after 3 seconds
  setTimeout(() => dismiss(toast), 3000);
}

/**
 * Dismisses a toast with a fade-out animation.
 */
function dismiss(toast) {
  if (!toast || !toast.parentElement) return;

  toast.classList.add('toast-hiding');
  toast.addEventListener('animationend', () => {
    toast.remove();
  });
  // Fallback removal if animationend doesn't fire
  setTimeout(() => toast.remove(), 500);
}
