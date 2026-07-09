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
 * to unlock audio on iOS/Safari AND override the silent switch.
 *
 * Uses navigator.audioSession.type = 'playback' (Safari 16.4+)
 * to bypass the hardware mute switch on iOS.
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

  // Standard Web Audio unlock (required for autoplay policy)
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
 * Schedule 10 clock-tick sounds, one per second.
 * Uses a short, sharp high-frequency click to mimic a clock tick,
 * distinct from the test's musical beeps.
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
