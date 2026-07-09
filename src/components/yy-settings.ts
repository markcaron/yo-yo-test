import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { buttonStyles } from '../styles/buttons.js';

const SETTINGS_KEY = 'yy-settings';

export interface AppSettings {
  countdownEnabled: boolean;
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { countdownEnabled: true };
  } catch {
    return { countdownEnabled: true };
  }
}

function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getSettings(): AppSettings {
  return loadSettings();
}

@customElement('yy-settings')
export class YySettings extends LitElement {
  static styles = [
    buttonStyles,
    css`
      dialog {
        border: none;
        border-radius: var(--yy-radius-lg);
        background: var(--yy-bg-surface);
        color: var(--yy-text);
        padding: var(--yy-space-xl);
        max-width: min(400px, 90vw);
        width: min(400px, 90vw);
        box-shadow: var(--yy-shadow-lg);
      }

      dialog::backdrop {
        background: var(--yy-backdrop);
      }

      h2 {
        margin: 0 0 var(--yy-space-lg);
        font-size: 1.25rem;
        font-weight: 600;
      }

      .setting-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--yy-space-md);
        padding: var(--yy-space-sm) 0;
      }

      .setting-label {
        font-size: 0.9rem;
      }

      .toggle {
        position: relative;
        width: 48px;
        height: 28px;
        flex-shrink: 0;
      }

      .toggle input {
        opacity: 0;
        width: 0;
        height: 0;
        position: absolute;
      }

      .toggle-track {
        position: absolute;
        inset: 0;
        background: var(--yy-border-subtle);
        border-radius: 14px;
        box-shadow: inset 0 0 0 1px var(--yy-border);
        transition: background var(--yy-transition-fast),
          box-shadow var(--yy-transition-fast);
        cursor: pointer;
      }

      .toggle input:checked + .toggle-track {
        background: var(--yy-accent);
        box-shadow: none;
      }

      .toggle-track::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 22px;
        height: 22px;
        background: white;
        border-radius: 50%;
        box-shadow: inset 0 0 0 1.5px var(--yy-text-muted);
        transition: transform var(--yy-transition-fast),
          box-shadow var(--yy-transition-fast);
      }

      .toggle input:checked + .toggle-track::after {
        transform: translateX(20px);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }

      .toggle input:focus-visible + .toggle-track {
        outline: 2px solid var(--yy-accent);
        outline-offset: 2px;
      }

      .close-row {
        display: flex;
        justify-content: flex-end;
        margin-top: var(--yy-space-xl);
      }
    `,
  ];

  @state() private _settings: AppSettings = loadSettings();

  open() {
    this._settings = loadSettings();
    this.renderRoot.querySelector<HTMLDialogElement>('dialog')?.showModal();
  }

  render() {
    return html`
      <dialog @close=${this.#onClose}>
        <h2>Settings</h2>

        <div class="setting-row">
          <span class="setting-label">10-second starting countdown</span>
          <label class="toggle">
            <input type="checkbox"
              .checked=${this._settings.countdownEnabled}
              @change=${this.#toggleCountdown}
              aria-label="Enable starting countdown" />
            <span class="toggle-track"></span>
          </label>
        </div>

        <div class="close-row">
          <button @click=${this.#onClose}>Close</button>
        </div>
      </dialog>
    `;
  }

  #toggleCountdown(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    this._settings = { ...this._settings, countdownEnabled: checked };
    saveSettings(this._settings);
    this.dispatchEvent(new CustomEvent('settings-changed', {
      detail: this._settings,
      bubbles: true,
      composed: true,
    }));
  }

  #onClose() {
    this.renderRoot.querySelector<HTMLDialogElement>('dialog')?.close();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yy-settings': YySettings;
  }
}
