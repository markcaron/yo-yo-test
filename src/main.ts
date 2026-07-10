import { getSettings, applyColorMode } from './components/yy-settings.js';
import './components/yy-splash.js';
import './components/yy-app.js';

applyColorMode(getSettings().colorMode);
