import { getIconSvg } from '../services/icons.js';

/**
 * Initializes and triggers the beautiful bottom drawer prompt
 * guiding iOS/iPhone Safari users to add ClipGenius to their home screen.
 */
export function initIosInstallPrompt() {
  // 1. Detect if the user is on an iOS device (iPhone, iPad, iPod)
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // 2. Detect Safari browser specifically (avoid Chrome/Firefox on iOS wrappers)
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);

  // 3. Detect if already running in standalone PWA mode
  const isStandalone = ('standalone' in window.navigator) && (window.navigator.standalone);

  // 4. Read user dismiss state from localStorage
  const isDismissed = localStorage.getItem('clipgenius_ios_prompt_dismissed') === 'true';

  // Only run if on iOS Safari, not installed, and not dismissed
  if (!isIos || isStandalone || isDismissed) {
    return;
  }

  // Create the install drawer element
  const drawer = document.createElement('div');
  drawer.className = 'ios-install-drawer';

  // SVG Icons from service
  const shareIcon = getIconSvg('upload', { width: 16, height: 16 }); // Safari uses upload/share icon style
  const plusIcon = getIconSvg('check', { width: 14, height: 14 });
  
  drawer.innerHTML = `
    <div class="ios-prompt-header">
      <div class="ios-prompt-icon">
        <img src="/assets/icon-512.png" alt="ClipGenius Logo" />
      </div>
      <div class="ios-prompt-title">
        <h3>Install ClipGenius</h3>
        <p>Run the engine directly from your iPhone home screen</p>
      </div>
    </div>
    <div class="ios-prompt-steps">
      <div class="ios-prompt-step">
        <div class="ios-prompt-step-num">1</div>
        <div class="ios-prompt-step-text">
          Tap Safari's <strong>Share</strong> button ${shareIcon} at the bottom of the screen.
        </div>
      </div>
      <div class="ios-prompt-step">
        <div class="ios-prompt-step-num">2</div>
        <div class="ios-prompt-step-text">
          Scroll down the list and select <strong>Add to Home Screen</strong>.
        </div>
      </div>
      <div class="ios-prompt-step">
        <div class="ios-prompt-step-num">3</div>
        <div class="ios-prompt-step-text">
          Confirm the app name and tap <strong>Add</strong> in the top-right!
        </div>
      </div>
    </div>
    <div class="ios-prompt-actions">
      <button class="btn-secondary" id="ios-prompt-dismiss">Maybe Later</button>
      <button class="btn-primary" id="ios-prompt-confirm">Got It!</button>
    </div>
  `;

  document.body.appendChild(drawer);

  // Animate the bottom drawer in smoothly after a short delay
  setTimeout(() => {
    drawer.classList.add('show');
  }, 1500);

  // Close animation and store dismissed preference
  const dismissPrompt = () => {
    drawer.classList.remove('show');
    localStorage.setItem('clipgenius_ios_prompt_dismissed', 'true');
    setTimeout(() => {
      drawer.remove();
    }, 400);
  };

  document.getElementById('ios-prompt-dismiss').addEventListener('click', dismissPrompt);
  document.getElementById('ios-prompt-confirm').addEventListener('click', dismissPrompt);
}
