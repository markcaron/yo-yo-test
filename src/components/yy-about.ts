import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { buttonStyles } from '../styles/buttons.js';

@customElement('yy-about')
export class YyAbout extends LitElement {
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
        text-align: center;
      }

      dialog::backdrop {
        background: var(--yy-backdrop);
      }

      .brand-icon {
        width: 64px;
        height: 64px;
        fill: var(--yy-text);
        margin-bottom: var(--yy-space-md);
      }

      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
      }

      .version {
        font-size: 0.85rem;
        color: var(--yy-text-muted);
        margin: var(--yy-space-xs) 0 var(--yy-space-md);
      }

      .author {
        font-size: 0.95rem;
        color: var(--yy-text);
        margin: 0;
      }

      .close-row {
        display: flex;
        justify-content: center;
        margin-top: var(--yy-space-xl);
      }
    `,
  ];

  open() {
    this.renderRoot.querySelector<HTMLDialogElement>('dialog')?.showModal();
  }

  render() {
    return html`
      <dialog @close=${this.#onClose}>
        <svg class="brand-icon" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="m474.98 1137.5c-227.48 0-412.5-185.02-412.5-412.5 0-227.53 185.02-412.5 412.5-412.5s412.5 185.02 412.5 412.5-185.02 412.5-412.5 412.5zm0-750c-186 0-337.5 151.5-337.5 337.5s151.5 337.5 337.5 337.5 337.5-151.5 337.5-337.5-151.5-337.5-337.5-337.5z"/>
          <path d="m474.98 1012.5c-158.48 0-287.48-129-287.48-287.48s129-287.48 287.48-287.48 287.48 129 287.48 287.48-129 287.48-287.48 287.48zm0-500.02c-117 0-212.48 95.484-212.48 212.48s95.484 212.48 212.48 212.48 212.48-95.484 212.48-212.48-95.484-212.48-212.48-212.48z"/>
          <path d="m552 881.48c-4.5 0-9.5156-0.98438-13.5-2.4844l-63.516-24.984-63.516 24.984c-12 4.5-25.5 3-35.484-4.5-10.5-7.5-15.984-20.016-15.516-32.484l3.9844-68.016-43.5-52.5c-8.0156-9.9844-10.5-23.016-6.5156-35.484 3.9844-12 14.016-21.516 26.484-24.516l66-17.016 36.516-57.516c14.016-21.516 49.5-21.516 63.516 0l36.516 57.516 66 17.016c12.516 3 22.5 12.516 26.484 24.516s1.5 25.5-6.5156 35.484l-43.5 52.5 3.9844 68.016c0.98438 12.984-5.0156 24.984-15.516 32.484-6.5156 4.5-14.016 6.9844-21.984 6.9844zm-77.016-105.47c4.5 0 9.5156 0.98438 13.5 2.4844l22.5 9-1.5-24c-0.51562-9.5156 2.4844-18.984 8.4844-26.016l15.516-18.516-23.484-6c-9-2.4844-17.016-8.0156-22.5-15.984l-12.984-20.484-12.984 20.484c-5.0156 8.0156-12.984 14.016-22.5 15.984l-23.484 6 15.516 18.516c6 7.5 9 16.5 8.4844 26.016l-1.5 24 22.5-9c4.5-1.5 9-2.4844 13.5-2.4844z"/>
          <path d="m1050 937.5c-20.484 0-37.5-17.016-37.5-37.5v-699.98c0-34.5-27.984-62.484-62.484-62.484s-62.484 27.984-62.484 62.484v525c0 20.484-17.016 37.5-37.5 37.5s-37.5-17.016-37.5-37.5l-0.046875-525c0-75.984 61.5-137.48 137.48-137.48s137.48 61.5 137.48 137.48v699.98c0 20.484-17.016 37.5-37.5 37.5z"/>
          <path d="m1050 1137.5c-48 0-87.516-39.516-87.516-87.516v-99.984c0-48 39.516-87.516 87.516-87.516s87.516 39.516 87.516 87.516v99.984c0 48-39.516 87.516-87.516 87.516zm0-200.02c-6.9844 0-12.516 5.4844-12.516 12.516v99.984c0 14.016 24.984 14.016 24.984 0v-99.984c0-6.9844-5.4844-12.516-12.516-12.516z"/>
        </svg>
        <h2>Yo-Yo Test</h2>
        <p class="version">v${__APP_VERSION__}</p>
        <p class="author">By Mark Caron</p>
        <div class="close-row">
          <button @click=${this.#onClose}>Close</button>
        </div>
      </dialog>
    `;
  }

  #onClose() {
    this.renderRoot.querySelector<HTMLDialogElement>('dialog')?.close();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yy-about': YyAbout;
  }
}
