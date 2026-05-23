import { getIconSvg } from '../services/icons.js';

export function render(container) {
  const zapIcon = getIconSvg('zap', { width: 18, height: 18 });
  const externalIcon = getIconSvg('external-link', { width: 14, height: 14 });

  container.innerHTML = `
    <style>
      .apexresolve-page-layout {
        display: flex;
        flex-direction: column;
        gap: 20px;
        animation: fadeIn 0.4s ease-out;
        max-width: 1400px;
        margin: 0 auto;
        padding: 10px;
      }
      
      .apexresolve-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
      }

      .apexresolve-title-wrap h1 {
        font-size: 26px;
        font-weight: 700;
        margin-bottom: 4px;
        background: linear-gradient(135deg, #00e5ff, #a855f7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .apexresolve-subtitle {
        font-size: 13.5px;
        color: var(--text-secondary);
      }

      .apexresolve-iframe-card {
        background: rgba(20, 27, 43, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        overflow: hidden;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        height: calc(100vh - 190px);
        min-height: 550px;
        position: relative;
      }

      .apexresolve-iframe {
        width: 100%;
        height: 100%;
        border: none;
        background: transparent;
      }

      .apexresolve-placeholder {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        background: #090d16;
        z-index: 5;
        text-align: center;
        padding: 24px;
      }

      .apexresolve-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(0, 229, 255, 0.1);
        border-top-color: #00e5ff;
        border-radius: 50%;
        animation: spin-pulse 1s linear infinite;
      }

      @keyframes spin-pulse {
        to { transform: rotate(360deg); }
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>

    <div class="apexresolve-page-layout">
      <div class="apexresolve-header-row">
        <div class="apexresolve-title-wrap">
          <h1>${zapIcon} DeepPulse AI Technical Assistant</h1>
          <p class="apexresolve-subtitle">Premium AI diagnostic command center and developer utility core</p>
        </div>
        <div>
          <a href="http://localhost:5173/" target="_blank" class="btn-secondary" style="display: inline-flex; align-items: center; gap: 8px; font-size: 13px; text-decoration: none; padding: 8px 16px;">
            Open Standalone ${externalIcon}
          </a>
        </div>
      </div>

      <div class="apexresolve-iframe-card">
        <!-- Live status checker loading screen -->
        <div class="apexresolve-placeholder" id="iframe-loading-placeholder">
          <div class="apexresolve-spinner"></div>
          <div>
            <h3 style="font-size: 15px; font-weight: 600; color: #fff;">Connecting to DeepPulse Node...</h3>
            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">Loading sandbox logs and reasoning networks</p>
          </div>
        </div>

        <iframe 
          src="http://localhost:5173/" 
          class="apexresolve-iframe" 
          id="apexresolve-iframe"
          title="DeepPulse AI Helper Console"
        ></iframe>
      </div>
    </div>
  `;

  // Hide loading placeholder when iframe loaded successfully
  const iframe = document.getElementById('apexresolve-iframe');
  const placeholder = document.getElementById('iframe-loading-placeholder');
  
  if (iframe && placeholder) {
    iframe.addEventListener('load', () => {
      placeholder.style.display = 'none';
    });
    
    // Safety timeout to close placeholder if loading takes long
    setTimeout(() => {
      placeholder.style.display = 'none';
    }, 2500);
  }
}
