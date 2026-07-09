import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

const OUTER_R = 120;
const INNER_R = 96;
const OUTER_C = 2 * Math.PI * OUTER_R;
const INNER_C = 2 * Math.PI * INNER_R;

/**
 * Concentric progress ring dial.
 *
 * Uses direct DOM manipulation for stroke-dashoffset to avoid
 * Lit re-renders on every rAF frame (eliminates iOS jitter).
 */
@customElement('yy-dial')
export class YyDial extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      max-width: 300px;
      aspect-ratio: 1;
      margin: 0 auto;
      contain: layout style paint;
    }

    svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg) translateZ(0);
    }

    .track {
      fill: none;
      stroke: var(--yy-shuttle-track);
      opacity: 0.3;
    }

    .outer-ring {
      fill: none;
      stroke: var(--yy-ring-outer);
      stroke-linecap: round;
    }

    .inner-ring {
      fill: none;
      stroke: var(--yy-ring-inner);
      stroke-linecap: round;
      transition: stroke 200ms ease;
    }

    :host([recovery]) .inner-ring {
      stroke: var(--yy-accent);
    }
  `;

  @property({ type: Number }) outerProgress = 0;
  @property({ type: Number }) innerProgress = 0;
  @property({ type: Boolean, reflect: true }) recovery = false;

  #outerRing: SVGCircleElement | null = null;
  #innerRing: SVGCircleElement | null = null;

  protected firstUpdated() {
    this.#outerRing = this.renderRoot.querySelector('.outer-ring');
    this.#innerRing = this.renderRoot.querySelector('.inner-ring');
    this.#applyProgress();
  }

  protected updated(changed: Map<string, unknown>) {
    if (changed.has('outerProgress') || changed.has('innerProgress')) {
      this.#applyProgress();
    }
  }

  #applyProgress() {
    if (this.#outerRing) {
      const offset = (1 - this.outerProgress) * OUTER_C;
      this.#outerRing.style.strokeDashoffset = `${offset}`;
    }
    if (this.#innerRing) {
      const offset = (1 - this.innerProgress) * INNER_C;
      this.#innerRing.style.strokeDashoffset = `${offset}`;
    }
  }

  render() {
    return html`
      <svg viewBox="0 0 280 280" aria-hidden="true">
        <circle class="track" cx="140" cy="140" r="${OUTER_R}" stroke-width="16" />
        <circle class="outer-ring" cx="140" cy="140" r="${OUTER_R}"
          stroke-width="16" stroke-dasharray="${OUTER_C}" />
        <circle class="track" cx="140" cy="140" r="${INNER_R}" stroke-width="12" />
        <circle class="inner-ring" cx="140" cy="140" r="${INNER_R}"
          stroke-width="12" stroke-dasharray="${INNER_C}" />
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yy-dial': YyDial;
  }
}
