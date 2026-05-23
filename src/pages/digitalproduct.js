import { getIconSvg } from '../services/icons.js';

export function render(container) {
  const packageIcon = getIconSvg('brain', { width: 18, height: 18 });
  const externalIcon = getIconSvg('external-link', { width: 14, height: 14 });

  container.innerHTML = `
    <style>
      .digitalproduct-page-layout {
        display: flex;
        flex-direction: column;
        gap: 20px;
        animation: fadeIn 0.4s ease-out;
        max-width: 1400px;
        margin: 0 auto;
        padding: 10px;
      }
      
      .digitalproduct-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
      }

      .digitalproduct-title-wrap h1 {
        font-size: 26px;
        font-weight: 700;
        margin-bottom: 4px;
        background: linear-gradient(135deg, #10b981, #06b6d4);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .digitalproduct-subtitle {
        font-size: 13.5px;
        color: var(--text-secondary);
      }

      .digitalproduct-iframe-card {
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

      .digitalproduct-iframe {
        width: 100%;
        height: 100%;
        border: none;
        background: transparent;
      }

      .digitalproduct-placeholder {
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

      .digitalproduct-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(16, 185, 129, 0.1);
        border-top-color: #10b981;
        border-radius: 50%;
        animation: spin-pulse-emerald 1s linear infinite;
      }

      @keyframes spin-pulse-emerald {
        to { transform: rotate(360deg); }
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>

    <div class="digitalproduct-page-layout">
      <div class="digitalproduct-header-row">
        <div class="digitalproduct-title-wrap">
          <h1>${packageIcon} DeepPulse Product Agent</h1>
          <p class="digitalproduct-subtitle">AI-powered digital product profitability commands, wholesale arbitrage, and cross-platform command center</p>
        </div>
        <div>
          <a href="http://localhost:3000/" target="_blank" class="btn-secondary" style="display: inline-flex; align-items: center; gap: 8px; font-size: 13px; text-decoration: none; padding: 8px 16px;">
            Open Standalone ${externalIcon}
          </a>
        </div>
      </div>

      <div class="digitalproduct-iframe-card">
        <!-- Live status checker loading screen -->
        <div class="digitalproduct-placeholder" id="digitalproduct-loading-placeholder">
          <div class="digitalproduct-spinner"></div>
          <div>
            <h3 style="font-size: 15px; font-weight: 600; color: #fff;">Connecting to Product Command Center...</h3>
            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">Loading sourcing maps and PLR ledger sandboxes</p>
          </div>
        </div>

        <iframe 
          src="http://localhost:3000/" 
          class="digitalproduct-iframe" 
          id="digitalproduct-iframe"
          title="DeepPulse Product Agent Console"
        ></iframe>
      </div>
    </div>
  `;

  // Hide loading placeholder when iframe loaded successfully
  const iframe = document.getElementById('digitalproduct-iframe');
  const placeholder = document.getElementById('digitalproduct-loading-placeholder');
  
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
