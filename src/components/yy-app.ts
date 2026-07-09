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
        overflow: hidden;
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
      }

      .brand-icon {
        width: 55px;
        height: 55px;
        fill: var(--yy-text);
        flex-shrink: 0;
      }

      .brand-text {
        text-align: left;
      }

      h1 {
        font-size: 2.25rem;
        font-weight: 700;
        margin: 0;
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
      }

      .dial-container {
        position: relative;
        width: 100%;
        max-width: 280px;
        aspect-ratio: 1;
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
        max-width: calc(100vw - 32px);
        margin: auto;
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

  #engine = new TimerEngine((state) => {
    this._timerState = state;
    this._engineStatus = state.status;
    this.#updateAnnouncement(state);
    this.#resetMissOnNewShuttle(state);
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
            <svg class="brand-icon" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="m474.98 1137.5c-227.48 0-412.5-185.02-412.5-412.5 0-227.53 185.02-412.5 412.5-412.5s412.5 185.02 412.5 412.5-185.02 412.5-412.5 412.5zm0-750c-186 0-337.5 151.5-337.5 337.5s151.5 337.5 337.5 337.5 337.5-151.5 337.5-337.5-151.5-337.5-337.5-337.5z"/>
              <path d="m474.98 1012.5c-158.48 0-287.48-129-287.48-287.48s129-287.48 287.48-287.48 287.48 129 287.48 287.48-129 287.48-287.48 287.48zm0-500.02c-117 0-212.48 95.484-212.48 212.48s95.484 212.48 212.48 212.48 212.48-95.484 212.48-212.48-95.484-212.48-212.48-212.48z"/>
              <path d="m552 881.48c-4.5 0-9.5156-0.98438-13.5-2.4844l-63.516-24.984-63.516 24.984c-12 4.5-25.5 3-35.484-4.5-10.5-7.5-15.984-20.016-15.516-32.484l3.9844-68.016-43.5-52.5c-8.0156-9.9844-10.5-23.016-6.5156-35.484 3.9844-12 14.016-21.516 26.484-24.516l66-17.016 36.516-57.516c14.016-21.516 49.5-21.516 63.516 0l36.516 57.516 66 17.016c12.516 3 22.5 12.516 26.484 24.516s1.5 25.5-6.5156 35.484l-43.5 52.5 3.9844 68.016c0.98438 12.984-5.0156 24.984-15.516 32.484-6.5156 4.5-14.016 6.9844-21.984 6.9844zm-77.016-105.47c4.5 0 9.5156 0.98438 13.5 2.4844l22.5 9-1.5-24c-0.51562-9.5156 2.4844-18.984 8.4844-26.016l15.516-18.516-23.484-6c-9-2.4844-17.016-8.0156-22.5-15.984l-12.984-20.484-12.984 20.484c-5.0156 8.0156-12.984 14.016-22.5 15.984l-23.484 6 15.516 18.516c6 7.5 9 16.5 8.4844 26.016l-1.5 24 22.5-9c4.5-1.5 9-2.4844 13.5-2.4844z"/>
              <path d="m1050 937.5c-20.484 0-37.5-17.016-37.5-37.5v-699.98c0-34.5-27.984-62.484-62.484-62.484s-62.484 27.984-62.484 62.484v525c0 20.484-17.016 37.5-37.5 37.5s-37.5-17.016-37.5-37.5l-0.046875-525c0-75.984 61.5-137.48 137.48-137.48s137.48 61.5 137.48 137.48v699.98c0 20.484-17.016 37.5-37.5 37.5z"/>
              <path d="m1050 1137.5c-48 0-87.516-39.516-87.516-87.516v-99.984c0-48 39.516-87.516 87.516-87.516s87.516 39.516 87.516 87.516v99.984c0 48-39.516 87.516-87.516 87.516zm0-200.02c-6.9844 0-12.516 5.4844-12.516 12.516v99.984c0 14.016 24.984 14.016 24.984 0v-99.984c0-6.9844-5.4844-12.516-12.516-12.516z"/>
            </svg>
            <div class="brand-text">
              <h1>Yo-Yo Test</h1>
              <p class="subtitle">Intermittent Recovery Level 1</p>
            </div>
          </div>
        </header>

        <main>
          <div class="stats" role="group" aria-label="Test statistics">
            <span>${this.#formatTime(elapsedMs)}</span>
            <span>${distance} m</span>
          </div>
          ${this._engineStatus === 'stopped' ? html`
            ${this.#renderResults(levelNum, shuttleNum, distance, elapsedMs)}
          ` : html`
            <div class="dial-container" role="img"
              aria-label="${isCountdown
                ? `Countdown: ${Math.ceil(countdownRemaining)} seconds`
                : `Test progress: Stage ${levelNum}, Shuttle ${shuttleNum}, Speed ${speed} km/h`}">
              <yy-dial
                .outerProgress=${outerProgress}
                .innerProgress=${innerProgress}
                ?recovery=${isRecovery}
              ></yy-dial>
              <div class="dial-center">
                ${isCountdown ? html`
                  <span class="countdown-display">${Math.ceil(countdownRemaining)}</span>
                ` : isRecovery ? html`
                  <span class="countdown-display">${Math.ceil(recoveryRemaining)}</span>
                  <span class="recovery-next">${this.#nextStageLabel(levelNum, shuttleNum)}</span>
                ` : html`
                  <span class="level-display">${levelNum}:${shuttleNum}</span>
                  <span class="speed-display">${speed} km/h</span>
                `}
              </div>
            </div>
          `}

          <div class="controls">
            ${this.#renderControls()}
          </div>

          ${this._engineStatus !== 'stopped'
            ? this.#renderNextLevel(levelNum)
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
              <span class="miss-dot ${this._missCount >= 1 ? 'filled' : ''}"></span>
              <span class="miss-dot ${this._missCount >= 2 ? 'filled' : ''}"></span>
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

  #renderNextLevel(currentLevel: number) {
    const state = this._timerState;
    const isRecovery = state?.phase === 'recovery';
    const nextLevelData = YYIR1_LEVELS.find(l => l.level > currentLevel);
    const text = (this._engineStatus !== 'countdown' && !isRecovery && nextLevelData)
      ? `Next: Stage ${nextLevelData.level} — ${nextLevelData.speed.toFixed(1)} km/h`
      : '';
    return html`<p class="next-level">${text}</p>`;
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
    this.#engine.start({ skipCountdown: !this._settings.countdownEnabled });
  }

  #handleMiss() {
    this._missCount++;
    if (this._missCount >= 2) {
      this.#stoppedElapsedMs = this._timerState?.elapsedMs ?? 0;
      this.#engine.stop();
    }
  }

  #handleStop() {
    this.#stoppedElapsedMs = this._timerState?.elapsedMs ?? 0;
    this.renderRoot.querySelector<HTMLDialogElement>('#stop-dialog')?.showModal();
  }

  #confirmStop() {
    this.renderRoot.querySelector<HTMLDialogElement>('#stop-dialog')?.close();
    this.#engine.stop();
  }

  #cancelStop() {
    this.renderRoot.querySelector<HTMLDialogElement>('#stop-dialog')?.close();
  }

  #onDialogClose() {}

  #resetMissOnNewShuttle(state: TimerState) {
    if (state.status !== 'running') return;
    const key = `${state.levelIndex}-${state.shuttleIndex}`;
    if (key !== this.#lastShuttleKey) {
      this.#lastShuttleKey = key;
      if (this._missCount > 0 && this._missCount < 2) {
        this._missCount = 0;
      }
    }
  }

  #handleReset() {
    this._missCount = 0;
    this.#engine.reset();
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
