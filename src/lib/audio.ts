/**
 * Web Audio API beep engine for the Yo-Yo test.
 *
 * Handles iOS-specific issues:
 * - AudioContext suspension after screen lock / background
 * - Audio session reverting to ambient after interruptions
 * - Stale context requiring recreation
 */

let ctx: AudioContext | null = null;
let scheduledNodes: OscillatorNode[] = [];

function createContext(): AudioContext {
  ctx = new AudioContext();
  return ctx;
}

/**
 * Get or create the AudioContext, ensuring it's in 'running' state.
 * If suspended, attempts resume. If closed/broken, recreates.
 */
function getContext(): AudioContext {
  if (!ctx || ctx.state === 'closed') {
    createContext();
  }
  return ctx!;
}

/**
 * Ensure the AudioContext is running before scheduling audio.
 * Call this from user gestures and before any beep scheduling.
 */
export async function ensureAudioReady(): Promise<void> {
  const audioCtx = getContext();

  // Re-assert playback session every time (iOS may reset after interruption)
  const nav = navigator as Navigator & { audioSession?: { type: string } };
  if (nav.audioSession) {
    try {
      nav.audioSession.type = 'playback';
    } catch { /* non-fatal */ }
  }

  if (audioCtx.state === 'suspended') {
    try {
      await audioCtx.resume();
    } catch {
      // If resume fails, recreate the context
      ctx?.close().catch(() => {});
      createContext();
      await ctx!.resume().catch(() => {});
    }
  }
}

/**
 * Must be called from a user gesture (e.g. play button tap).
 * Unlocks audio on iOS/Safari and overrides the silent switch.
 */
export function unlockAudio(): void {
  // Set audio session to playback — bypasses iOS silent switch
  const nav = navigator as Navigator & { audioSession?: { type: string } };
  if (nav.audioSession) {
    try {
      nav.audioSession.type = 'playback';
    } catch { /* non-fatal */ }
  }

  const audioCtx = getContext();

  // Force resume (may be suspended)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  // Standard Web Audio unlock — play a silent buffer from user gesture
  const buffer = audioCtx.createBuffer(1, 1, 22050);
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start(0);
}

function playTone(frequency: number, startTime: number, duration: number, volume = 1.0): OscillatorNode {
  const audioCtx = getContext();

  // If context is suspended, force resume (best-effort, non-blocking)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  // Guard against scheduling in the past (can happen after background)
  const safeStart = Math.max(startTime, audioCtx.currentTime);

  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, safeStart);
  gain.gain.exponentialRampToValueAtTime(0.01, safeStart + duration);

  oscillator.connect(gain);
  gain.connect(audioCtx.destination);

  oscillator.start(safeStart);
  oscillator.stop(safeStart + duration);

  oscillator.addEventListener('ended', () => {
    const idx = scheduledNodes.indexOf(oscillator);
    if (idx >= 0) scheduledNodes.splice(idx, 1);
  });

  scheduledNodes.push(oscillator);
  return oscillator;
}

/** Cancel all scheduled/playing tones immediately */
export function cancelAllAudio(): void {
  for (const node of scheduledNodes) {
    try { node.stop(); } catch { /* already stopped */ }
  }
  scheduledNodes = [];
}

/**
 * Schedule a beep at an absolute AudioContext time.
 */
export function scheduleBeep(type: 'single' | 'double' | 'triple', atTime: number): void {
  const freq = type === 'triple' ? 1200 : 1000;

  switch (type) {
    case 'single':
      playTone(freq, atTime, 0.15);
      break;
    case 'double':
      playTone(freq, atTime, 0.12);
      playTone(freq, atTime + 0.18, 0.12);
      break;
    case 'triple':
      playTone(freq, atTime, 0.1);
      playTone(freq, atTime + 0.15, 0.1);
      playTone(freq, atTime + 0.3, 0.1);
      break;
  }
}

/**
 * Schedule 10 clock-tick sounds, one per second.
 */
export function scheduleCountdownTicks(startTime: number): void {
  for (let i = 0; i < 10; i++) {
    playTone(1800, startTime + i, 0.02, 0.3);
  }
}

/** Get the AudioContext currentTime for scheduling */
export function getAudioTime(): number {
  return getContext().currentTime;
}
