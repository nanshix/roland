import { mountPlaceholderToolsView } from './tools/placeholders/view.js';
import { mountTimerView } from './tools/timer/view.js';

export const routes = {
  timer: mountTimerView,
  'coming-soon': mountPlaceholderToolsView,
};
