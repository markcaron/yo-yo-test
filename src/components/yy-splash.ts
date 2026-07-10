import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

const SPLASH_SHOWN_KEY = 'yy-splash-shown';

@customElement('yy-splash')
export class YySplash extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 9999;
      pointer-events: none;
    }

    :host([hidden]) {
      display: none;
    }

    .backdrop {
      position: absolute;
      inset: 0;
      background: var(--yy-brand);
      transform-origin: bottom center;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .backdrop.peel {
      transform: translateY(-100%);
    }

    .yoyo-group {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      will-change: transform;
    }

    .string {
      width: 6px;
      background: white;
      flex-shrink: 0;
      margin-bottom: -2px;
    }

    .yoyo {
      width: 25vw;
      max-width: 120px;
      flex-shrink: 0;
    }

    .yoyo svg {
      width: 100%;
      height: auto;
      display: block;
    }
  `;

  @state() private _phase: 'throw' | 'spin' | 'snap' | 'done' = 'throw';
  @state() private _peeling = false;

  #groupEl: HTMLElement | null = null;
  #stringEl: HTMLElement | null = null;
  #yoyoEl: HTMLElement | null = null;
  #animId: number | null = null;
  #startTime = 0;
  #failsafeTimer: number | null = null;

  connectedCallback() {
    super.connectedCallback();

    if (sessionStorage.getItem(SPLASH_SHOWN_KEY)) {
      this.setAttribute('hidden', '');
      return;
    }

    this.removeAttribute('hidden');
    this.#failsafeTimer = window.setTimeout(() => this.#forceHide(), 3000);
  }

  protected firstUpdated() {
    if (this.hasAttribute('hidden')) return;

    this.#groupEl = this.renderRoot.querySelector('.yoyo-group');
    this.#stringEl = this.renderRoot.querySelector('.string');
    this.#yoyoEl = this.renderRoot.querySelector('.yoyo');

    if (!this.#groupEl || !this.#stringEl || !this.#yoyoEl) {
      this.#forceHide();
      return;
    }

    this.#startTime = performance.now();
    this.#animate();
  }

  #animate() {
    const tick = () => {
      const elapsed = performance.now() - this.#startTime;
      const group = this.#groupEl;
      const string = this.#stringEl;
      const yoyoEl = this.#yoyoEl;

      if (!group || !string || !yoyoEl) {
        this.#forceHide();
        return;
      }

      const vh = window.innerHeight;
      const yoyoHeight = yoyoEl.offsetHeight || (window.innerWidth * 0.25);
      const targetStringH = vh - yoyoHeight;

      if (this._phase === 'throw') {
        const duration = 400;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 2);
        const stringH = eased * targetStringH;
        const rotation = progress * 720;

        string.style.height = `${stringH}px`;
        yoyoEl.style.transform = `rotate(${rotation}deg)`;

        if (progress >= 1) {
          this._phase = 'spin';
          this.#startTime = performance.now();
        }
      } else if (this._phase === 'spin') {
        const duration = 250;
        const progress = Math.min(elapsed / duration, 1);
        const rotation = 720 + progress * 540;

        string.style.height = `${targetStringH}px`;
        yoyoEl.style.transform = `rotate(${rotation}deg)`;

        if (progress >= 1) {
          this._phase = 'snap';
          this.#startTime = performance.now();
        }
      } else if (this._phase === 'snap') {
        const duration = 350;
        const progress = Math.min(elapsed / duration, 1);
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        const groupY = -eased * vh;
        const rotation = 1260 + progress * 360;

        group.style.transform = `translateX(-50%) translateY(${groupY}px)`;
        yoyoEl.style.transform = `rotate(${rotation}deg)`;

        if (progress >= 0.3 && !this._peeling) {
          this._peeling = true;
        }

        if (progress >= 1) {
          this._phase = 'done';
          this.#finish();
          return;
        }
      }

      this.#animId = requestAnimationFrame(tick);
    };

    this.#animId = requestAnimationFrame(tick);
  }

  #finish() {
    sessionStorage.setItem(SPLASH_SHOWN_KEY, '1');
    setTimeout(() => this.setAttribute('hidden', ''), 400);
  }

  #forceHide() {
    sessionStorage.setItem(SPLASH_SHOWN_KEY, '1');
    this.setAttribute('hidden', '');
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.#animId) cancelAnimationFrame(this.#animId);
    if (this.#failsafeTimer) clearTimeout(this.#failsafeTimer);
  }

  render() {
    return html`
      <div class="backdrop ${this._peeling ? 'peel' : ''}" aria-hidden="true"></div>
      <div class="yoyo-group" aria-hidden="true">
        <div class="string"></div>
        <div class="yoyo">
          <svg viewBox="0 0 410 411" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M177.952 1.75945C85.5891 11.0323 0 96.3154 0 205.491C0 314.666 91.7844 411 205 411C318.216 411 410 318.987 410 205.491C410 82.4679 302.518 -14.3662 177.952 1.75945ZM204.988 372.927C112.741 372.927 37.9664 297.966 37.9664 205.491C37.9664 113.015 112.748 38.0545 204.988 38.0545C297.228 38.0545 372.003 113.015 372.003 205.491C372.003 297.966 297.228 372.927 204.988 372.927Z" fill="white"/>
            <path d="M204.987 79.5566C135.601 79.5566 79.3564 135.947 79.3564 205.5C79.3564 275.052 135.607 331.442 204.987 331.442C274.368 331.442 330.618 275.058 330.618 205.5C330.618 135.941 274.374 79.5566 204.987 79.5566ZM286.635 214.359L227.638 228.25L213.781 287.393C211.632 296.734 198.256 296.734 196.107 287.393L182.251 228.25L123.253 214.359C113.942 212.204 113.942 198.795 123.253 196.64L182.251 182.75L196.107 123.606C198.256 114.271 211.632 114.271 213.781 123.606L227.755 182.75L286.635 196.64C296.07 198.795 296.07 212.204 286.635 214.359Z" fill="white"/>
          </svg>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yy-splash': YySplash;
  }
}
