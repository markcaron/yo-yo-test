import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { buttonStyles } from '../styles/buttons.js';
import { TimerEngine, type TimerState, type EngineStatus } from '../lib/timer-engine.js';
import { YYIR1_LEVELS } from '../lib/yo-yo-protocol.js';
import { iconPlay, iconStop, iconReset, iconSettings, iconClipboard, iconAbout, iconInfo } from '../icons.js';
import './yy-dial.js';

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

      h1 {
        font-size: 2.25rem;
        font-weight: 700;
        margin: 0;
        letter-spacing: -0.02em;
      }

      .subtitle {
        font-size: 1.25rem;
        color: var(--yy-accent);
        margin: var(--yy-space-xs) 0 0;
        font-weight: 500;
      }

      /* ─── Stats bar (time + distance) ─── */
      .stats {
        display: flex;
        justify-content: center;
        gap: var(--yy-space-lg);
        padding: var(--yy-space-sm) var(--yy-space-md);
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

      /* ─── Controls ─── */
      .controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--yy-space-md);
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

      .control-btn.reset svg {
        width: 42px;
        height: 42px;
        fill: var(--yy-accent);
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

      .nav-btn:focus-visible {
        outline: 2px solid var(--yy-accent);
        outline-offset: 3px;
      }

      .nav-btn svg {
        width: 28px;
        height: 28px;
        fill: var(--yy-text-muted);
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

  @state() private _engineStatus: EngineStatus = 'idle';
  @state() private _timerState: TimerState | null = null;

  #engine = new TimerEngine((state) => {
    this._timerState = state;
    this._engineStatus = state.status;
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
    const elapsedMs = state?.elapsedMs ?? 0;
    const countdownRemaining = state?.countdownRemaining ?? 0;
    const isCountdown = this._engineStatus === 'countdown';

    return html`
      <header>
        <h1>Yo-Yo Test</h1>
        <p class="subtitle">Recovery Level 1</p>
      </header>

      <div class="stats" aria-label="Test statistics">
        <span>${this.#formatTime(elapsedMs)}</span>
        <span>${distance} m</span>
      </div>

      <main>
        <div class="dial-container" role="img"
          aria-label="${isCountdown
            ? `Countdown: ${Math.ceil(countdownRemaining)} seconds`
            : `Test progress: Stage ${levelNum}, Shuttle ${shuttleNum}, Speed ${speed} km/h`}">
          <yy-dial
            .outerProgress=${outerProgress}
            .innerProgress=${innerProgress}
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

        <div class="controls">
          ${this.#renderControls()}
        </div>

        ${this.#renderNextLevel(levelNum)}
      </main>

      <nav aria-label="App navigation">
        <button class="nav-btn" aria-label="About">
          <svg viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">${iconInfo}</svg>
        </button>
        <button class="nav-btn" aria-label="Instructions">
          <svg viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">${iconAbout}</svg>
        </button>
        <button class="nav-btn" aria-label="Stage table">
          <svg viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">${iconClipboard}</svg>
        </button>
        <button class="nav-btn" aria-label="Settings">
          <svg viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">${iconSettings}</svg>
        </button>
      </nav>

      <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        ${this.#liveAnnouncement}
      </div>
    `;
  }

  get #liveAnnouncement(): string {
    if (this._engineStatus === 'idle') return '';
    if (this._engineStatus === 'countdown') {
      const r = this._timerState?.countdownRemaining ?? 0;
      return `Starting in ${Math.ceil(r)} seconds.`;
    }
    if (this._engineStatus === 'stopped') return 'Test stopped.';
    const s = this._timerState;
    if (!s) return '';
    if (s.phase === 'recovery') return `Recovery. ${Math.ceil(s.recoveryRemaining)} seconds.`;
    return `Stage ${s.level.level}, shuttle ${s.shuttleIndex + 1}.`;
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
    this.#engine.start();
  }

  #handleStop() {
    this.#engine.stop();
  }

  #handleReset() {
    this.#engine.reset();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yy-app': YyApp;
  }
}
