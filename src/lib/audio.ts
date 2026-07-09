/**
 * Web Audio API beep engine for the Yo-Yo test.
 * Generates tones programmatically — no audio files needed.
 *
 * Single beep = start/end of 20m segment
 * Double beep = end of shuttle (40m) / start of recovery
 * Triple beep = end of stage (level complete)
 * Tick beep = soft countdown tick
 */

let ctx: AudioContext | null = null;
let scheduledNodes: OscillatorNode[] = [];

function getContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

/**
 * Must be called from a user gesture (e.g. play button tap)
 * to unlock audio on iOS/Safari.
 */
export function unlockAudio(): void {
  const audioCtx = getContext();
  const buffer = audioCtx.createBuffer(1, 1, 22050);
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start(0);
}

function playTone(frequency: number, startTime: number, duration: number, volume = 1.0): OscillatorNode {
  const audioCtx = getContext();
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

  oscillator.connect(gain);
  gain.connect(audioCtx.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);

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

/** Single short beep — marks 20m turn point */
export function beepSingle(): void {
  const audioCtx = getContext();
  playTone(1000, audioCtx.currentTime, 0.15);
}

/** Double beep — marks end of shuttle (40m complete) */
export function beepDouble(): void {
  const audioCtx = getContext();
  const now = audioCtx.currentTime;
  playTone(1000, now, 0.12);
  playTone(1000, now + 0.18, 0.12);
}

/** Triple beep — marks end of stage / level complete */
export function beepTriple(): void {
  const audioCtx = getContext();
  const now = audioCtx.currentTime;
  playTone(1200, now, 0.1);
  playTone(1200, now + 0.15, 0.1);
  playTone(1200, now + 0.3, 0.1);
}

/**
 * Schedule a beep at an absolute AudioContext time.
 * Use this for precision timing against the device clock.
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
 * Schedule 10 soft countdown ticks, one per second.
 * Lower frequency and volume than test beeps.
 */
export function scheduleCountdownTicks(startTime: number): void {
  for (let i = 0; i < 10; i++) {
    playTone(660, startTime + i, 0.08, 0.2);
  }
}

/** Get the AudioContext currentTime for scheduling */
export function getAudioTime(): number {
  return getContext().currentTime;
}
