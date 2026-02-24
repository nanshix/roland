import { mountPlaceholderHelpersView } from './helpers/placeholders/view.js';
import { mountTimerView } from './helpers/timer/view.js';

export const routes = {
  timer: mountTimerView,
  'coming-soon': mountPlaceholderHelpersView,
};
