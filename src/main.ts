import { getSettings, applyColorMode } from './components/yy-settings.js';
import { ensureAudioReady } from './lib/audio.js';
import './components/yy-splash.js';
import './components/yy-app.js';

applyColorMode(getSettings().colorMode);

// Re-prime audio context when app returns from background/screen lock
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    ensureAudioReady();
  }
});
