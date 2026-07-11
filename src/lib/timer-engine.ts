import { YYIR1_LEVELS, RECOVERY_SECONDS } from './yo-yo-protocol.js';
import { scheduleBeep, getAudioTime, unlockAudio, ensureAudioReady, scheduleCountdownTicks, cancelAllAudio } from './audio.js';
import type { LevelData } from './types.js';

export type TimerPhase = 'out' | 'back' | 'recovery';
export type EngineStatus = 'idle' | 'countdown' | 'running' | 'stopped';

export interface TimerState {
  status: EngineStatus;
  levelIndex: number;
  shuttleIndex: number;
  phase: TimerPhase;
  /** 0–1 progress through current 20m segment (out or back) */
  segmentProgress: number;
  /** 0–1 progress through full shuttle (40m) */
  shuttleProgress: number;
  /** Recovery countdown in seconds (0 when not in recovery) */
  recoveryRemaining: number;
  /** Current level data */
  level: LevelData;
  /** Cumulative distance so far */
  distance: number;
  /** Total elapsed time since test started (ms), excludes countdown */
  elapsedMs: number;
  /** Countdown remaining (seconds, 0 when not in countdown) */
  countdownRemaining: number;
}

type OnTick = (state: TimerState) => void;

const COUNTDOWN_SECONDS = 10;

/**
 * Precision timer engine for the Yo-Yo test.
 *
 * Uses absolute timestamps (performance.now / AudioContext.currentTime)
 * so timing remains accurate even if the screen locks or tab is backgrounded.
 * The rAF loop is for UI updates only — beep scheduling is clock-based.
 */
export class TimerEngine {
  #status: EngineStatus = 'idle';
  #levels: LevelData[] = YYIR1_LEVELS;
  #levelIndex = 0;
  #shuttleIndex = 0;
  #phase: TimerPhase = 'out';
  #onTick: OnTick;
  #rafId: number | null = null;

  /** Absolute time (ms, performance.now) when current segment started */
  #segmentStartMs = 0;
  /** Duration of current segment in ms */
  #segmentDurationMs = 0;
  /** Cumulative distance */
  #distance = 0;
  /** Absolute time when the actual test started (after countdown) */
  #testStartMs = 0;
  /** Absolute time when countdown started */
  #countdownStartMs = 0;

  constructor(onTick: OnTick) {
    this.#onTick = onTick;
  }

  get status(): EngineStatus {
    return this.#status;
  }

  start(options?: { skipCountdown?: boolean }): void {
    if (this.#status === 'running' || this.#status === 'countdown') return;
    unlockAudio();
    ensureAudioReady();
    this.#levelIndex = 0;
    this.#shuttleIndex = 0;
    this.#phase = 'out';
    this.#distance = 0;

    if (options?.skipCountdown) {
      this.#status = 'running';
      this.#testStartMs = performance.now();
      this.#beginSegment();
      this.#scheduleLoop();
    } else {
      this.#status = 'countdown';
      this.#countdownStartMs = performance.now();
      scheduleCountdownTicks(getAudioTime());
      this.#runCountdown();
    }
  }

  stop(): void {
    this.#status = 'stopped';
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
    cancelAllAudio();
    this.#emitState();
  }

  reset(): void {
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
    this.#status = 'idle';
    this.#levelIndex = 0;
    this.#shuttleIndex = 0;
    this.#phase = 'out';
    this.#distance = 0;
    this.#segmentStartMs = 0;
    this.#segmentDurationMs = 0;
    this.#testStartMs = 0;
    this.#emitState();
  }

  #runCountdown(): void {
    const tick = () => {
      if (this.#status !== 'countdown') return;

      const elapsed = performance.now() - this.#countdownStartMs;
      const remaining = COUNTDOWN_SECONDS - (elapsed / 1000);

      if (remaining <= 0) {
        this.#status = 'running';
        this.#testStartMs = performance.now();
        this.#beginSegment();
        this.#scheduleLoop();
        return;
      }

      this.#emitState();
      this.#rafId = requestAnimationFrame(tick);
    };

    this.#rafId = requestAnimationFrame(tick);
  }

  /** Audio time reference for the current shuttle's first segment */
  #shuttleAudioStart = 0;

  #beginSegment(stageChanged = false): void {
    const level = this.#levels[this.#levelIndex];
    if (!level) {
      this.stop();
      return;
    }

    this.#segmentStartMs = performance.now();
    const halfShuttleSec = level.shuttleTime / 2;

    if (this.#phase === 'recovery') {
      this.#segmentDurationMs = RECOVERY_SECONDS * 1000;
    } else {
      this.#segmentDurationMs = halfShuttleSec * 1000;
    }

    if (this.#phase === 'out') {
      const audioNow = getAudioTime();
      this.#shuttleAudioStart = audioNow;
      scheduleBeep(stageChanged ? 'triple' : 'single', audioNow);
      scheduleBeep('single', audioNow + halfShuttleSec);
      scheduleBeep('double', audioNow + level.shuttleTime);
    }
    // 'back' and 'recovery' beeps are already pre-scheduled from 'out'
  }

  #advance(): void {
    const level = this.#levels[this.#levelIndex];

    if (this.#phase === 'out') {
      this.#distance += 20;
      this.#phase = 'back';
      this.#beginSegment();
    } else if (this.#phase === 'back') {
      this.#distance += 20;
      this.#phase = 'recovery';
      this.#beginSegment();
    } else if (this.#phase === 'recovery') {
      this.#shuttleIndex++;
      let stageChanged = false;
      if (this.#shuttleIndex >= level.shuttles) {
        this.#shuttleIndex = 0;
        this.#levelIndex++;
        stageChanged = true;
        if (this.#levelIndex >= this.#levels.length) {
          this.stop();
          return;
        }
      }
      this.#phase = 'out';
      this.#beginSegment(stageChanged);
    }
  }

  #scheduleLoop(): void {
    const tick = () => {
      if (this.#status !== 'running') return;

      const elapsed = performance.now() - this.#segmentStartMs;
      const progress = Math.min(elapsed / this.#segmentDurationMs, 1);

      if (progress >= 1) {
        this.#advance();
      }

      this.#emitState();
      this.#rafId = requestAnimationFrame(tick);
    };

    this.#rafId = requestAnimationFrame(tick);
  }

  #emitState(): void {
    const level = this.#levels[this.#levelIndex] ?? this.#levels[this.#levels.length - 1];

    let segmentProgress = 0;
    let shuttleProgress = 0;
    let recoveryRemaining = 0;
    let elapsedMs = 0;
    let countdownRemaining = 0;

    if (this.#status === 'countdown') {
      const elapsed = performance.now() - this.#countdownStartMs;
      countdownRemaining = Math.max(0, COUNTDOWN_SECONDS - (elapsed / 1000));
    } else if (this.#status === 'running') {
      const segElapsed = performance.now() - this.#segmentStartMs;
      segmentProgress = Math.min(segElapsed / this.#segmentDurationMs, 1);

      if (this.#phase === 'out') {
        shuttleProgress = segmentProgress * 0.5;
      } else if (this.#phase === 'back') {
        shuttleProgress = 0.5 + segmentProgress * 0.5;
      } else {
        shuttleProgress = 1;
      }

      if (this.#phase === 'recovery') {
        recoveryRemaining = Math.max(0, RECOVERY_SECONDS - (segElapsed / 1000));
      }

      elapsedMs = performance.now() - this.#testStartMs;
    } else if (this.#status === 'stopped' && this.#testStartMs > 0) {
      elapsedMs = performance.now() - this.#testStartMs;
    }

    this.#onTick({
      status: this.#status,
      levelIndex: this.#levelIndex,
      shuttleIndex: this.#shuttleIndex,
      phase: this.#phase,
      segmentProgress,
      shuttleProgress,
      recoveryRemaining,
      level,
      distance: this.#distance,
      elapsedMs,
      countdownRemaining,
    });
  }
}
