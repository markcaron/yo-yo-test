import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { buttonStyles } from '../styles/buttons.js';

@customElement('yy-norms')
export class YyNorms extends LitElement {
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
        margin: 0 0 var(--yy-space-sm);
        font-size: 1.25rem;
        font-weight: 600;
      }

      h3 {
        margin: var(--yy-space-lg) 0 var(--yy-space-sm);
        font-size: 1rem;
        font-weight: 600;
      }

      .source {
        font-size: 0.75rem;
        color: var(--yy-text-muted);
        margin-bottom: var(--yy-space-md);
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.85rem;
        margin-bottom: var(--yy-space-md);
      }

      th {
        text-align: left;
        padding: var(--yy-space-sm);
        border-bottom: 2px solid var(--yy-border);
        font-weight: 600;
        font-size: 0.8rem;
        color: var(--yy-text-muted);
      }

      td {
        padding: var(--yy-space-sm);
        border-bottom: 1px solid var(--yy-border-subtle);
      }

      .rating-elite { color: var(--yy-success); font-weight: 600; }
      .rating-excellent { color: var(--yy-success); }
      .rating-good { color: var(--yy-accent); }
      .rating-average { color: var(--yy-text); }
      .rating-below { color: var(--yy-warning); }
      .rating-poor { color: var(--yy-danger); }

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
        <h2>YYIR1 Fitness Norms</h2>
        <p class="source">Source: Bangsbo, Iaia &amp; Krustrup (2008)</p>

        <h3>Men</h3>
        <table>
          <thead>
            <tr>
              <th>Rating</th>
              <th>Distance</th>
              <th>Speed (km/h)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td class="rating-elite">Elite</td><td>&gt; 2400 m</td><td>&gt; 20.1</td></tr>
            <tr><td class="rating-excellent">Excellent</td><td>2000–2400 m</td><td>18.7–20.1</td></tr>
            <tr><td class="rating-good">Good</td><td>1520–1960 m</td><td>17.3–18.6</td></tr>
            <tr><td class="rating-average">Average</td><td>1040–1480 m</td><td>15.7–17.2</td></tr>
            <tr><td class="rating-below">Below Avg</td><td>520–1000 m</td><td>14.2–15.6</td></tr>
            <tr><td class="rating-poor">Poor</td><td>&lt; 520 m</td><td>&lt; 14.2</td></tr>
          </tbody>
        </table>

        <h3>Women</h3>
        <table>
          <thead>
            <tr>
              <th>Rating</th>
              <th>Distance</th>
              <th>Speed (km/h)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td class="rating-elite">Elite</td><td>&gt; 1600 m</td><td>&gt; 17.5</td></tr>
            <tr><td class="rating-excellent">Excellent</td><td>1320–1600 m</td><td>16.6–17.5</td></tr>
            <tr><td class="rating-good">Good</td><td>1000–1280 m</td><td>15.6–16.5</td></tr>
            <tr><td class="rating-average">Average</td><td>680–960 m</td><td>14.6–15.5</td></tr>
            <tr><td class="rating-below">Below Avg</td><td>320–640 m</td><td>13.1–14.5</td></tr>
            <tr><td class="rating-poor">Poor</td><td>&lt; 320 m</td><td>&lt; 13.1</td></tr>
          </tbody>
        </table>

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
    'yy-norms': YyNorms;
  }
}
