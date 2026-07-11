import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { buttonStyles } from '../styles/buttons.js';
import { getSessions, deleteSession, clearAllSessions } from '../lib/store.js';
import type { TestSession } from '../lib/types.js';

@customElement('yy-norms')
export class YyNorms extends LitElement {
  static styles = [
    buttonStyles,
    css`
      :host {
        display: block;
        padding: var(--yy-space-lg) var(--yy-space-md);
        max-width: 480px;
        margin: 0 auto;
      }

      h2 {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0 0 var(--yy-space-sm);
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

      /* ─── Results section ─── */

      .results-empty {
        color: var(--yy-text-muted);
        font-size: 0.9rem;
        margin-bottom: var(--yy-space-lg);
      }

      .results-list {
        list-style: none;
        margin: 0 0 var(--yy-space-md);
        padding: 0;
      }

      .results-list li {
        display: flex;
        align-items: center;
        gap: var(--yy-space-xs);
        padding: var(--yy-space-xs) 0;
        border-bottom: 1px solid var(--yy-border-subtle);
      }

      .result-date {
        font-size: 0.8rem;
        color: var(--yy-text-muted);
        min-width: 7em;
        margin-right: var(--yy-space-md);
      }

      .result-score {
        flex: 1;
        font-weight: 600;
        font-size: 0.9rem;
      }

      .delete-btn {
        appearance: none;
        background: none;
        border: none;
        padding: var(--yy-space-xs);
        cursor: pointer;
        color: var(--yy-text-muted);
        min-height: 36px;
        min-width: 36px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--yy-radius-md);
      }

      .delete-btn:hover {
        color: var(--yy-danger);
      }

      .delete-btn:focus-visible {
        outline: 2px solid var(--yy-accent);
        outline-offset: 3px;
      }

      .delete-btn svg {
        width: 20px;
        height: 20px;
        fill: currentColor;
      }

      .clear-all {
        margin-top: var(--yy-space-md);
        background: transparent;
        border: 1px solid var(--yy-danger);
        color: var(--yy-danger);
      }

      .clear-all:hover {
        background: var(--yy-danger);
        color: var(--yy-text-white);
      }

      /* ─── Divider ─── */

      hr {
        border: none;
        border-top: 1px solid var(--yy-border-subtle);
        margin: var(--yy-space-xl) 0;
      }

      /* ─── Norms tables ─── */

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

      /* ─── Dialogs ─── */

      dialog {
        border: none;
        border-radius: var(--yy-radius-lg);
        background: var(--yy-bg-surface);
        color: var(--yy-text);
        padding: var(--yy-space-xl);
        box-sizing: border-box;
        width: calc(100vw - 32px);
        max-width: 400px;
        box-shadow: var(--yy-shadow-lg);
      }

      dialog::backdrop {
        background: var(--yy-backdrop);
      }

      dialog h2 {
        margin: 0 0 var(--yy-space-md);
        font-size: 1.25rem;
        font-weight: 600;
      }

      dialog p {
        margin: 0 0 var(--yy-space-xl);
        color: var(--yy-text-muted);
        font-size: 0.9rem;
        line-height: 1.5;
      }

      .dialog-actions {
        display: flex;
        gap: var(--yy-space-sm);
        justify-content: flex-end;
      }
    `,
  ];

  @state() private _sessions: TestSession[] = [];
  @state() private _deleteTargetId: string | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._sessions = getSessions();
  }

  #formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  #formatScore(session: TestSession): string {
    const dist = `${session.totalDistance}m`;
    const level = `${session.currentLevel}:${session.currentShuttle}`;
    return `${dist} — ${level}`;
  }

  // ─── Delete single result ───

  #promptDelete(id: string) {
    this._deleteTargetId = id;
    this.renderRoot.querySelector<HTMLDialogElement>('#delete-dialog')?.showModal();
  }

  #confirmDelete() {
    if (this._deleteTargetId) {
      deleteSession(this._deleteTargetId);
      this._sessions = getSessions();
      this._deleteTargetId = null;
    }
    this.renderRoot.querySelector<HTMLDialogElement>('#delete-dialog')?.close();
  }

  #cancelDelete() {
    this._deleteTargetId = null;
    this.renderRoot.querySelector<HTMLDialogElement>('#delete-dialog')?.close();
  }

  // ─── Clear all results ───

  #promptClearAll() {
    this.renderRoot.querySelector<HTMLDialogElement>('#clear-dialog')?.showModal();
  }

  #confirmClearAll() {
    clearAllSessions();
    this._sessions = [];
    this.renderRoot.querySelector<HTMLDialogElement>('#clear-dialog')?.close();
  }

  #cancelClearAll() {
    this.renderRoot.querySelector<HTMLDialogElement>('#clear-dialog')?.close();
  }

  render() {
    return html`
      <h2>Results</h2>

      ${this._sessions.length === 0
        ? html`<p class="results-empty">No results yet. Complete a test to see your scores here.</p>`
        : html`
            <ul class="results-list">
              ${this._sessions.map(
                s => html`
                  <li>
                    <span class="result-date">${this.#formatDate(s.date)}</span>
                    <span class="result-score">${this.#formatScore(s)}</span>
                    <button
                      class="delete-btn"
                      aria-label="Delete result from ${this.#formatDate(s.date)}"
                      @click=${() => this.#promptDelete(s.id)}
                    >
                      <svg viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
                        <path d="m174.98 380.02h62.484l52.5 647.48c2.4844 24.984 24.984 45 50.016 45h519.98c24.984 0 47.484-20.016 50.016-45l52.5-647.48h62.531c27.516 0 50.016-22.5 50.016-50.016s-22.5-50.016-50.016-50.016h-200.02v-105c0-27.516-22.5-50.016-50.016-50.016l-349.97 0.046875c-27.516 0-50.016 22.5-50.016 50.016v102.52h-92.484l-107.53-0.046875c-27.516 0-50.016 22.5-50.016 50.016 0.046875 27.469 22.547 52.5 50.016 52.5zm300-155.02h249.98v52.5h-249.98zm-49.969 155.02h437.53l-50.062 594.98h-424.97l-47.484-594.98z"/>
                      </svg>
                    </button>
                  </li>
                `,
              )}
            </ul>
            <button class="clear-all" @click=${this.#promptClearAll}>
              Clear all results
            </button>
          `}

      <hr />

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

      <!-- Delete single result dialog -->
      <dialog id="delete-dialog">
        <h2>Delete result?</h2>
        <p>This result will be permanently removed.</p>
        <div class="dialog-actions">
          <button @click=${this.#cancelDelete}>Cancel</button>
          <button class="danger" @click=${this.#confirmDelete}>Delete</button>
        </div>
      </dialog>

      <!-- Clear all results dialog -->
      <dialog id="clear-dialog">
        <h2>Clear all results?</h2>
        <p>All saved results will be permanently removed. This cannot be undone.</p>
        <div class="dialog-actions">
          <button @click=${this.#cancelClearAll}>Cancel</button>
          <button class="danger" @click=${this.#confirmClearAll}>Clear all</button>
        </div>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yy-norms': YyNorms;
  }
}
