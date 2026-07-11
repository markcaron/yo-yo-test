import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('yy-help')
export class YyHelp extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: var(--yy-space-lg) var(--yy-space-md);
      max-width: 480px;
      margin: 0 auto;
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 var(--yy-space-lg);
    }

    h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: var(--yy-space-xl) 0 var(--yy-space-md);
    }

    h3:first-of-type {
      margin-top: 0;
    }

    .setup-diagram {
      width: 100%;
      max-width: 380px;
      margin: 0 auto var(--yy-space-lg);
      display: block;
    }

    ol {
      margin: 0;
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

    ol li code {
      background: var(--yy-bg-surface);
      border: 1px solid var(--yy-border-subtle);
      padding: 2px 6px;
      border-radius: var(--yy-radius-sm);
      font-size: 0.85em;
    }

    .about {
      margin-top: var(--yy-space-2xl);
      padding-top: var(--yy-space-lg);
      border-top: 1px solid var(--yy-border-subtle);
      text-align: center;
    }

    .brand-icon {
      width: 48px;
      height: 48px;
      margin-bottom: var(--yy-space-sm);
      border-radius: var(--yy-radius-lg);
      overflow: hidden;
    }

    .app-name {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0;
    }

    .version {
      font-size: 0.8rem;
      color: var(--yy-text-muted);
      margin: var(--yy-space-xs) 0;
    }

    .author {
      font-size: 0.9rem;
      color: var(--yy-text);
      margin: 0;
    }
  `;

  render() {
    return html`
      <h2>Help</h2>

      <h3>Instructions</h3>

      <svg class="setup-diagram" viewBox="0 0 400 90" xmlns="http://www.w3.org/2000/svg" aria-label="Cone setup diagram: Recovery cone 5m from Start cone, Start cone 20m from End cone">
        <!-- Cones -->
        <circle cx="40" cy="35" r="10" fill="var(--yy-text-muted)" opacity="0.6"/>
        <circle cx="120" cy="35" r="10" fill="var(--yy-accent)"/>
        <circle cx="360" cy="35" r="10" fill="var(--yy-accent)"/>

        <!-- Distance lines -->
        <line x1="55" y1="35" x2="105" y2="35" stroke="var(--yy-border)" stroke-width="1" stroke-dasharray="3,2"/>
        <line x1="135" y1="35" x2="345" y2="35" stroke="var(--yy-border)" stroke-width="1" stroke-dasharray="3,2"/>

        <!-- Distance labels -->
        <text x="80" y="25" text-anchor="middle" font-size="11" fill="var(--yy-text-muted)">5m</text>
        <text x="240" y="25" text-anchor="middle" font-size="11" fill="var(--yy-text-muted)">20m</text>

        <!-- Cone labels -->
        <text x="40" y="65" text-anchor="middle" font-size="10" fill="var(--yy-text-muted)">Recovery</text>
        <text x="40" y="77" text-anchor="middle" font-size="10" fill="var(--yy-text-muted)">cone</text>
        <text x="120" y="65" text-anchor="middle" font-size="10" fill="var(--yy-text)">Start</text>
        <text x="120" y="77" text-anchor="middle" font-size="10" fill="var(--yy-text)">cone</text>
        <text x="360" y="65" text-anchor="middle" font-size="10" fill="var(--yy-text)">End</text>
        <text x="360" y="77" text-anchor="middle" font-size="10" fill="var(--yy-text)">cone</text>
      </svg>

      <ol>
        <li>Set up two cones <strong>20 meters</strong> apart, one will be the start cone.</li>
        <li>Place a third recovery cone <strong>5m</strong> behind/before the start cone.</li>
        <li>Stand beside the start cone, and <strong>get ready to go.</strong></li>
        <li><strong>Press Play</strong> (optionally, a 10-second countdown clock begins).</li>
        <li>On the first beep, <strong>run 20m out</strong> to the cone.</li>
        <li>On the next beep, <strong>run 20m back</strong> to the start cone (completing one 40m shuttle).</li>
        <li>A double beep signals <strong>10 seconds of active recovery</strong> — walk or jog slowly around the recovery cone and back to the start cone.</li>
        <li><strong>Repeat.</strong> <em>Speed increases</em> with each stage — a <strong>triple beep</strong> signals a new, faster stage.</li>
        <li>If you fail to reach the line before the beep, tap the <strong>Miss button</strong> ☹️.</li>
        <li><strong>After two consecutive misses</strong>, the test ends automatically.</li>
        <li><strong>Your score</strong> is the <code>last stage:shuttle completed</code>, plus total distance and estimated VO₂max.</li>
      </ol>

      <div class="about">
        <svg class="brand-icon" viewBox="0 0 511 511" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect width="511" height="511" fill="#FF2346"/>
          <path d="M141.789 82.1875C26.6732 93.7166 -80 199.75 -80 335.488C-80 471.227 34.3947 591 175.5 591C316.605 591 431 476.6 431 335.488C431 182.533 297.041 62.1384 141.789 82.1875ZM175.485 543.663C60.5142 543.663 -32.6809 450.464 -32.6809 335.488C-32.6809 220.513 60.5219 127.313 175.485 127.313C290.447 127.313 383.643 220.513 383.643 335.488C383.643 450.464 290.447 543.663 175.485 543.663Z" fill="white"/>
          <path d="M175.485 178.91C89.0055 178.91 18.9058 249.021 18.9058 335.496C18.9058 421.972 89.0132 492.082 175.485 492.082C261.956 492.082 332.064 421.979 332.064 335.496C332.064 249.013 261.964 178.91 175.485 178.91ZM277.246 346.511L203.715 363.781L186.445 437.315C183.767 448.929 167.095 448.929 164.417 437.315L147.147 363.781L73.6163 346.511C62.011 343.832 62.011 327.16 73.6163 324.481L147.147 307.211L164.417 233.677C167.095 222.071 183.767 222.071 186.445 233.677L203.861 307.211L277.246 324.481C289.004 327.16 289.004 343.832 277.246 346.511Z" fill="white"/>
          <path d="M149 -263L199 -263L199 129L149 129L149 -263Z" fill="white"/>
        </svg>
        <p class="app-name">Yo-Yo Test</p>
        <p class="version">v${__APP_VERSION__}</p>
        <p class="author">By Mark Caron</p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yy-help': YyHelp;
  }
}
