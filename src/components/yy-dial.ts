import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Concentric progress ring dial.
 *
 * - Outer ring: full shuttle (40m) progress
 * - Inner ring: current 20m segment progress
 *
 * Rings "shrink" (deplete) as time runs out — full = just started, empty = time's up.
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
    }

    svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg) translateZ(0);
      will-change: contents;
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
      will-change: stroke-dashoffset;
    }

    .inner-ring {
      fill: none;
      stroke: var(--yy-ring-inner);
      stroke-linecap: round;
      will-change: stroke-dashoffset;
      transition: stroke 200ms ease;
    }

    :host([recovery]) .inner-ring {
      stroke: var(--yy-accent);
    }
  `;

  /** 0–1 progress for the outer ring (full shuttle / 40m) */
  @property({ type: Number }) outerProgress = 0;

  /** 0–1 progress for the inner ring (20m segment) */
  @property({ type: Number }) innerProgress = 0;

  /** When true, inner ring turns blue (recovery phase) */
  @property({ type: Boolean, reflect: true }) recovery = false;

  render() {
    const outerRadius = 120;
    const innerRadius = 96;
    const outerCircumference = 2 * Math.PI * outerRadius;
    const innerCircumference = 2 * Math.PI * innerRadius;

    const outerRemaining = (1 - this.outerProgress) * outerCircumference;
    const innerRemaining = (1 - this.innerProgress) * innerCircumference;

    const cx = 140;
    const cy = 140;

    return html`
      <svg viewBox="0 0 280 280" aria-hidden="true">
        <!-- Outer track -->
        <circle class="track" cx="${cx}" cy="${cy}" r="${outerRadius}"
          stroke-width="16" />
        <!-- Outer progress -->
        <circle class="outer-ring" cx="${cx}" cy="${cy}" r="${outerRadius}"
          stroke-width="16"
          stroke-dasharray="${outerCircumference}"
          stroke-dashoffset="${outerRemaining}" />
        <!-- Inner track -->
        <circle class="track" cx="${cx}" cy="${cy}" r="${innerRadius}"
          stroke-width="12" />
        <!-- Inner progress -->
        <circle class="inner-ring" cx="${cx}" cy="${cy}" r="${innerRadius}"
          stroke-width="12"
          stroke-dasharray="${innerCircumference}"
          stroke-dashoffset="${innerRemaining}" />
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yy-dial': YyDial;
  }
}
