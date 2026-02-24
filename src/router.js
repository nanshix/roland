import { mountLandingView } from './helpers/landing/view.js';
import { mountPlaceholderHelpersView } from './helpers/placeholders/view.js';
import { mountTimerView } from './helpers/timer/view.js';

export const routes = {
  landing: mountLandingView,
  timer: mountTimerView,
  'coming-soon': mountPlaceholderHelpersView,
};
