import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { buttonStyles } from '../styles/buttons.js';

@customElement('yy-instructions')
export class YyInstructions extends LitElement {
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
        max-height: 80dvh;
        overflow-y: auto;
        box-shadow: var(--yy-shadow-lg);
      }

      dialog::backdrop {
        background: var(--yy-backdrop);
      }

      h2 {
        margin: 0 0 var(--yy-space-md);
        font-size: 1.25rem;
        font-weight: 600;
      }

      ol {
        margin: 0 0 var(--yy-space-lg);
        padding-left: var(--yy-space-lg);
        line-height: 1.7;
        font-size: 0.9rem;
        color: var(--yy-text-muted);
      }

      ol li {
        margin-bottom: var(--yy-space-sm);
      }

      ol li strong {
        color: var(--yy-text);
      }

      .close-row {
        display: flex;
        justify-content: flex-end;
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
        <h2>Instructions</h2>
        <ol>
          <li>Set up two markers <strong>20 meters</strong> apart.</li>
          <li>Press <strong>Play</strong> — a 10-second countdown begins.</li>
          <li>On the first beep, run <strong>20m out</strong> to the far line.</li>
          <li>On the next beep, run <strong>20m back</strong> to the start line (completing one 40m shuttle).</li>
          <li>A double beep signals <strong>10 seconds of active recovery</strong> — jog slowly around the start cone.</li>
          <li>Repeat. Speed increases with each stage — a <strong>triple beep</strong> signals a new, faster stage.</li>
          <li>If you fail to reach the line before the beep, tap the <strong>Miss</strong> button.</li>
          <li>After <strong>two consecutive misses</strong>, the test ends automatically.</li>
          <li>Your score is the <strong>last stage:shuttle completed</strong>, plus total distance and estimated VO₂max.</li>
        </ol>
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
    'yy-instructions': YyInstructions;
  }
}
