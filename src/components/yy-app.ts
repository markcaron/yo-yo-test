import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { buttonStyles } from '../styles/buttons.js';
import { TimerEngine, type TimerState, type EngineStatus } from '../lib/timer-engine.js';
import { YYIR1_LEVELS, estimateVO2max } from '../lib/yo-yo-protocol.js';
import { iconPlay, iconStop, iconReset, iconMiss, iconDashboard, iconQuestion, iconClipboard, iconSettings } from '../icons.js';
import { getSettings } from './yy-settings.js';
import './yy-dial.js';
import './yy-help.js';
import './yy-norms.js';
import './yy-settings.js';

type AppView = 'dashboard' | 'help' | 'norms' | 'settings';

@customElement('yy-app')
export class YyApp extends LitElement {
  static styles = [
    buttonStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100dvh;
        padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px));
      }

      /* ─── Header ─── */
      header {
        text-align: center;
        padding: var(--yy-space-lg) var(--yy-space-md) var(--yy-space-sm);
      }

      .brand {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--yy-space-md);
        margin-left: -10px;
      }

      .brand-icon {
        width: 55px;
        height: 55px;
        flex-shrink: 0;
        border-radius: var(--yy-radius-lg);
        overflow: hidden;
      }

      .brand-text {
        text-align: left;
      }

      h1 {
        font-size: 2.25rem;
        font-weight: 700;
        margin: 0 0 5px;
        line-height: 1em;
        letter-spacing: -0.02em;
      }

      .subtitle {
        font-size: 0.9rem;
        color: var(--yy-text-muted);
        margin: 2px 0 0;
        font-weight: 500;
      }

      /* ─── Stats bar (time + distance) ─── */
      .stats {
        display: flex;
        justify-content: center;
        gap: var(--yy-space-lg);
        padding: var(--yy-space-sm) var(--yy-space-lg);
        background: var(--yy-bg-surface);
        border-radius: var(--yy-radius-lg);
        font-size: 0.95rem;
        color: var(--yy-text-muted);
        font-variant-numeric: tabular-nums;
      }

      /* ─── Main dial area ─── */
      main {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--yy-space-md);
        gap: var(--yy-space-lg);
        position: relative;
      }

      .dial-wrapper {
        position: relative;
        width: 280px;
        height: 280px;
        contain: strict;
      }

      .dial-container {
        position: absolute;
        inset: 0;
      }

      yy-dial {
        position: absolute;
        inset: 0;
      }

      .dial-center {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      }

      .level-display {
        font-size: 3rem;
        font-weight: 700;
        line-height: 1;
        letter-spacing: -0.02em;
      }

      .countdown-display {
        font-size: 3rem;
        font-weight: 700;
        line-height: 1;
        color: var(--yy-text);
        font-variant-numeric: tabular-nums;
      }

      .speed-display {
        font-size: 0.95rem;
        color: var(--yy-text-muted);
        margin-top: var(--yy-space-xs);
      }

      .recovery-next {
        font-size: 0.95rem;
        color: var(--yy-text-muted);
        margin-top: var(--yy-space-xs);
      }

      .next-level {
        font-size: 0.95rem;
        color: var(--yy-text-muted);
        text-align: center;
        margin: 0;
        min-height: 1.4em;
      }

      .results {
        text-align: center;
        line-height: 1.8;
      }

      .results .score {
        font-size: 3rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--yy-text);
      }

      .results .score-label {
        font-size: 0.85rem;
        color: var(--yy-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: var(--yy-space-xs);
      }

      .results .stats-line {
        font-size: 0.95rem;
        color: var(--yy-text-muted);
        margin-top: var(--yy-space-sm);
      }

      .results .stats-line strong {
        color: var(--yy-text);
      }

      /* ─── Controls ─── */
      .controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--yy-space-lg);
      }

      .control-btn {
        appearance: none;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        border-radius: var(--yy-radius-full);
        width: 56px;
        height: 56px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: transform var(--yy-transition-fast);
      }

      .control-btn:active {
        transform: scale(0.92);
      }

      .control-btn:focus-visible {
        outline: 2px solid var(--yy-accent);
        outline-offset: 3px;
      }

      .control-btn svg {
        width: 56px;
        height: 56px;
      }

      .control-btn.play svg {
        fill: var(--yy-success);
      }

      .control-btn.stop svg {
        fill: var(--yy-danger);
      }

      .control-btn.miss svg {
        width: 42px;
        height: 42px;
        fill: var(--yy-warning);
      }

      .control-btn.reset svg {
        width: 42px;
        height: 42px;
        fill: var(--yy-accent);
      }

      .miss-group {
        display: flex;
        align-items: center;
        gap: var(--yy-space-sm);
      }

      .miss-indicator {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .miss-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: 2px solid var(--yy-warning);
        background: transparent;
      }

      .miss-dot.filled {
        background: var(--yy-warning);
      }

      /* ─── Stop confirmation dialog ─── */
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
        margin: 0 0 var(--yy-space-sm);
        font-size: 1.25rem;
        font-weight: 600;
      }

      dialog p {
        margin: 0 0 var(--yy-space-xl);
        color: var(--yy-text-muted);
        font-size: 0.9rem;
      }

      .dialog-actions {
        display: flex;
        gap: var(--yy-space-sm);
        justify-content: flex-end;
      }

      /* ─── Bottom bar ─── */
      nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: var(--yy-space-sm) var(--yy-space-md);
        padding-bottom: calc(var(--yy-space-sm) + env(safe-area-inset-bottom, 0px));
        border-top: 1px solid var(--yy-border-subtle);
        background: var(--yy-bg-surface);
      }

      .nav-btn {
        appearance: none;
        background: none;
        border: none;
        padding: var(--yy-space-sm);
        cursor: pointer;
        border-radius: var(--yy-radius-md);
        min-height: 48px;
        min-width: 48px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .nav-btn:hover {
        background: var(--yy-hover-overlay);
      }

      .nav-btn[aria-current="page"] svg {
        fill: var(--yy-accent);
      }

      .nav-btn:focus-visible {
        outline: 2px solid var(--yy-accent);
        outline-offset: 3px;
      }

      .nav-btn svg {
        width: 28px;
        height: 28px;
        fill: var(--yy-text-muted);
      }

      /* ─── View content area ─── */
      .view-content {
        flex: 1;
        overflow-y: auto;
      }

      /* ─── Live region (sr-only) ─── */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `,
  ];

  @state() private _view: AppView = 'dashboard';
  @state() private _engineStatus: EngineStatus = 'idle';
  @state() private _timerState: TimerState | null = null;
  @state() private _announcement = '';
  @state() private _missCount = 0;
  @state() private _settings = getSettings();

  #lastAnnouncementKey = '';
  #lastShuttleKey = '';
  #stoppedElapsedMs = 0;
  #lastRenderKey = '';

  #engine = new TimerEngine((state) => {
    this.#updateDialDirectly(state);
    this.#updateStatsDirectly(state);
    this.#updateCenterDirectly(state);
    this.#updateNextLevel(state);
    this.#updateAnnouncement(state);
    this.#resetMissOnNewShuttle(state);

    // Always update status immediately (drives button swaps)
    if (state.status !== this._engineStatus) {
      this._engineStatus = state.status;
    }

    // Throttle timerState updates (only for data reads in results/next-level)
    const renderKey = `${state.levelIndex}-${state.shuttleIndex}-${state.phase}`;
    if (renderKey !== this.#lastRenderKey) {
      this.#lastRenderKey = renderKey;
      this._timerState = state;
    }
  });

  render() {
    const state = this._timerState;
    const level = state?.level;
    const levelNum = level ? level.level : 1;
    const shuttleNum = state ? state.shuttleIndex + 1 : 0;
    const speed = level ? level.speed.toFixed(1) : '10.0';
    const outerProgress = state?.shuttleProgress ?? 0;
    const innerProgress = state?.segmentProgress ?? 0;
    const recoveryRemaining = state?.recoveryRemaining ?? 0;
    const isRecovery = state?.phase === 'recovery';
    const distance = state?.distance ?? 0;
    const elapsedMs = this._engineStatus === 'stopped' ? this.#stoppedElapsedMs : (state?.elapsedMs ?? 0);
    const countdownRemaining = state?.countdownRemaining ?? 0;
    const isCountdown = this._engineStatus === 'countdown';

    return html`
      ${this._view === 'dashboard' ? html`
        <header>
          <div class="brand">
            <svg class="brand-icon" viewBox="0 0 511 511" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="511" height="511" fill="#FF2346"/>
              <path d="M141.789 82.1875C26.6732 93.7166 -80 199.75 -80 335.488C-80 471.227 34.3947 591 175.5 591C316.605 591 431 476.6 431 335.488C431 182.533 297.041 62.1384 141.789 82.1875ZM175.485 543.663C60.5142 543.663 -32.6809 450.464 -32.6809 335.488C-32.6809 220.513 60.5219 127.313 175.485 127.313C290.447 127.313 383.643 220.513 383.643 335.488C383.643 450.464 290.447 543.663 175.485 543.663Z" fill="white"/>
              <path d="M175.485 178.91C89.0055 178.91 18.9058 249.021 18.9058 335.496C18.9058 421.972 89.0132 492.082 175.485 492.082C261.956 492.082 332.064 421.979 332.064 335.496C332.064 249.013 261.964 178.91 175.485 178.91ZM277.246 346.511L203.715 363.781L186.445 437.315C183.767 448.929 167.095 448.929 164.417 437.315L147.147 363.781L73.6163 346.511C62.011 343.832 62.011 327.16 73.6163 324.481L147.147 307.211L164.417 233.677C167.095 222.071 183.767 222.071 186.445 233.677L203.861 307.211L277.246 324.481C289.004 327.16 289.004 343.832 277.246 346.511Z" fill="white"/>
              <path d="M149 -263L199 -263L199 129L149 129L149 -263Z" fill="white"/>
            </svg>
            <div class="brand-text">
              <h1>Yo-Yo Test</h1>
              <p class="subtitle">Intermittent Recovery Level 1</p>
            </div>
          </div>
        </header>

        <main>
          <div class="stats" role="group" aria-label="Test statistics">
            <span id="stat-time">${this.#formatTime(elapsedMs)}</span>
            <span id="stat-dist">${distance} m</span>
          </div>
          ${this._engineStatus === 'stopped' ? html`
            ${this.#renderResults(levelNum, shuttleNum, distance, elapsedMs)}
          ` : html`
            <div class="dial-wrapper">
              <div class="dial-container" role="img"
                aria-label="Test progress">
                <yy-dial
                  .outerProgress=${outerProgress}
                  .innerProgress=${innerProgress}
                  ?recovery=${isRecovery}
                ></yy-dial>
                <div class="dial-center">
                  <span class="level-display" id="dial-center-text">${levelNum}:${shuttleNum}</span>
                  <span class="speed-display" id="dial-center-sub">${speed} km/h</span>
                </div>
              </div>
            </div>
          `}

          <div class="controls">
            ${this.#renderControls()}
          </div>

          ${this._engineStatus !== 'stopped'
            ? this.#renderNextLevel()
            : nothing}
        </main>
      ` : html`
        <div class="view-content">
          ${this._view === 'help' ? html`<yy-help></yy-help>` : nothing}
          ${this._view === 'norms' ? html`<yy-norms></yy-norms>` : nothing}
          ${this._view === 'settings' ? html`<yy-settings @settings-changed=${this.#onSettingsChanged}></yy-settings>` : nothing}
        </div>
      `}

      <nav aria-label="App navigation">
        <button class="nav-btn" aria-label="Dashboard" aria-current="${this._view === 'dashboard' ? 'page' : nothing}" @click=${() => this.#setView('dashboard')}>
          <svg viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">${iconDashboard}</svg>
        </button>
        <button class="nav-btn" aria-label="Help" aria-current="${this._view === 'help' ? 'page' : nothing}" @click=${() => this.#setView('help')}>
          <svg viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">${iconQuestion}</svg>
        </button>
        <button class="nav-btn" aria-label="Stage table" aria-current="${this._view === 'norms' ? 'page' : nothing}" @click=${() => this.#setView('norms')}>
          <svg viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">${iconClipboard}</svg>
        </button>
        <button class="nav-btn" aria-label="Settings" aria-current="${this._view === 'settings' ? 'page' : nothing}" @click=${() => this.#setView('settings')}>
          <svg viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">${iconSettings}</svg>
        </button>
      </nav>

      <dialog id="stop-dialog" @close=${this.#onDialogClose}>
        <h2>Stop test?</h2>
        <p>The current test session will end and show your results.</p>
        <div class="dialog-actions">
          <button @click=${this.#cancelStop}>Continue</button>
          <button class="danger" @click=${this.#confirmStop}>Stop</button>
        </div>
      </dialog>

      <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        ${this._announcement}
      </div>
    `;
  }

  #updateAnnouncement(state: TimerState): void {
    let key = '';
    let text = '';

    if (state.status === 'idle') {
      key = 'idle';
      text = '';
    } else if (state.status === 'countdown') {
      key = `countdown-${Math.ceil(state.countdownRemaining)}`;
      text = `Starting in ${Math.ceil(state.countdownRemaining)}.`;
    } else if (state.status === 'stopped') {
      key = 'stopped';
      text = 'Test stopped.';
    } else if (state.phase === 'recovery') {
      key = `recovery-${state.levelIndex}-${state.shuttleIndex}`;
      text = 'Recovery.';
    } else {
      key = `${state.levelIndex}-${state.shuttleIndex}-${state.phase}`;
      text = `Stage ${state.level.level}, shuttle ${state.shuttleIndex + 1}.`;
    }

    if (key !== this.#lastAnnouncementKey) {
      this.#lastAnnouncementKey = key;
      this._announcement = text;
    }
  }

  #renderControls() {
    switch (this._engineStatus) {
      case 'idle':
        return html`
          <button class="control-btn play" aria-label="Start test" @click=${this.#handlePlay}>
            <svg viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">${iconPlay}</svg>
          </button>
        `;
      case 'countdown':
      case 'running':
        return html`
          <button class="control-btn stop" aria-label="Stop test" @click=${this.#handleStop}>
            <svg viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">${iconStop}</svg>
          </button>
          <div class="miss-group">
            <button class="control-btn miss" aria-label="Mark miss (${this._missCount} of 2)" @click=${this.#handleMiss}>
              <svg viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">${iconMiss}</svg>
            </button>
            <div class="miss-indicator" aria-hidden="true">
              <span class="miss-dot" id="miss-dot-1"></span>
              <span class="miss-dot" id="miss-dot-2"></span>
            </div>
          </div>
        `;
      case 'stopped':
        return html`
          <button class="control-btn reset" aria-label="Reset test" @click=${this.#handleReset}>
            <svg viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">${iconReset}</svg>
          </button>
        `;
    }
  }

  #renderNextLevel() {
    return html`<p class="next-level" id="next-level-text"></p>`;
  }

  #updateNextLevel(state: TimerState) {
    const el = this.renderRoot.querySelector('#next-level-text');
    if (!el) return;
    if (this._engineStatus === 'countdown' || state.phase === 'recovery') {
      el.textContent = '';
    } else {
      const nextLevelData = YYIR1_LEVELS.find(l => l.level > state.level.level);
      el.textContent = nextLevelData
        ? `Next: Stage ${nextLevelData.level} — ${nextLevelData.speed.toFixed(1)} km/h`
        : '';
    }
  }

  #renderResults(levelNum: number, shuttleNum: number, distance: number, elapsedMs: number) {
    const vo2max = estimateVO2max(distance);
    return html`
      <div class="results">
        <p class="score-label">Score</p>
        <p class="score">${levelNum}:${shuttleNum}</p>
        <p class="stats-line"><strong>${distance}</strong> m</p>
        <p class="stats-line">VO₂max ≈ <strong>${vo2max.toFixed(1)}</strong> ml/kg/min</p>
        <p class="stats-line">${this.#formatTime(elapsedMs)} elapsed</p>
      </div>
    `;
  }

  #nextStageLabel(currentLevel: number, currentShuttle: number): string {
    const state = this._timerState;
    if (!state) return '';
    const level = YYIR1_LEVELS[state.levelIndex];
    if (!level) return '';
    if (currentShuttle < level.shuttles) {
      return `Next: ${currentLevel}:${currentShuttle + 1}`;
    }
    const nextLevel = YYIR1_LEVELS[state.levelIndex + 1];
    if (nextLevel) {
      return `Next: Stage ${nextLevel.level}`;
    }
    return '';
  }

  #formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  #handlePlay() {
    this._missCount = 0;
    this._engineStatus = this._settings.countdownEnabled ? 'countdown' : 'running';
    this.#engine.start({ skipCountdown: !this._settings.countdownEnabled });
  }

  #handleMiss() {
    this._missCount++;
    this.#updateMissDots();
    if (this._missCount >= 2) {
      this.#stoppedElapsedMs = this._timerState?.elapsedMs ?? 0;
      this.#engine.stop();
      this._engineStatus = 'stopped';
      this.requestUpdate();
    }
  }

  #handleStop() {
    this.#stoppedElapsedMs = this._timerState?.elapsedMs ?? 0;
    this.renderRoot.querySelector<HTMLDialogElement>('#stop-dialog')?.showModal();
  }

  #confirmStop() {
    this.renderRoot.querySelector<HTMLDialogElement>('#stop-dialog')?.close();
    this.#stoppedElapsedMs = this._timerState?.elapsedMs ?? 0;
    this.#engine.stop();
    this._engineStatus = 'stopped';
    this.requestUpdate();
  }

  #cancelStop() {
    this.renderRoot.querySelector<HTMLDialogElement>('#stop-dialog')?.close();
  }

  #onDialogClose() {}

  #updateMissDots() {
    const dot1 = this.renderRoot.querySelector('#miss-dot-1');
    const dot2 = this.renderRoot.querySelector('#miss-dot-2');
    if (dot1) dot1.classList.toggle('filled', this._missCount >= 1);
    if (dot2) dot2.classList.toggle('filled', this._missCount >= 2);
  }

  #updateDialDirectly(state: TimerState) {
    const dial = this.renderRoot.querySelector('yy-dial') as import('./yy-dial.js').YyDial | null;
    if (!dial) return;
    dial.outerProgress = state.shuttleProgress;
    dial.innerProgress = state.segmentProgress;
    dial.recovery = state.phase === 'recovery';
  }

  #updateStatsDirectly(state: TimerState) {
    const timeEl = this.renderRoot.querySelector('#stat-time');
    const distEl = this.renderRoot.querySelector('#stat-dist');
    if (!timeEl || !distEl) return;
    const ms = this._engineStatus === 'stopped' ? this.#stoppedElapsedMs : state.elapsedMs;
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    timeEl.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
    distEl.textContent = `${state.distance} m`;
  }

  #updateCenterDirectly(state: TimerState) {
    const mainEl = this.renderRoot.querySelector('#dial-center-text');
    const subEl = this.renderRoot.querySelector('#dial-center-sub');
    if (!mainEl || !subEl) return;

    if (state.status === 'countdown') {
      mainEl.textContent = `${Math.ceil(state.countdownRemaining)}`;
      subEl.textContent = '';
    } else if (state.phase === 'recovery') {
      mainEl.textContent = `${Math.ceil(state.recoveryRemaining)}`;
      subEl.textContent = this.#nextStageLabel(state.level.level, state.shuttleIndex + 1);
    } else {
      mainEl.textContent = `${state.level.level}:${state.shuttleIndex + 1}`;
      subEl.textContent = `${state.level.speed.toFixed(1)} km/h`;
    }
  }

  #resetMissOnNewShuttle(state: TimerState) {
    if (state.status !== 'running') return;
    const key = `${state.levelIndex}-${state.shuttleIndex}`;
    if (key !== this.#lastShuttleKey) {
      this.#lastShuttleKey = key;
      if (this._missCount > 0 && this._missCount < 2) {
        this._missCount = 0;
        this.#updateMissDots();
      }
    }
  }

  #handleReset() {
    this._missCount = 0;
    this.#engine.reset();
    this._engineStatus = 'idle';
    this.requestUpdate();
  }

  #setView(view: AppView) {
    this._view = view;
  }

  #onSettingsChanged() {
    this._settings = getSettings();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yy-app': YyApp;
  }
}
