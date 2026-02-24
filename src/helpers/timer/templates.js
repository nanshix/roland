export const TIMER_TEMPLATES = {
  footy: {
    id: 'footy',
    name: 'Footy (90m + break)',
    totalSeconds: 6300,
    checkpoints: [
      { label: 'Kick-off', seconds: 0 },
      { label: 'Hydration', seconds: 1200 },
      { label: 'Half-time', seconds: 2700 },
      { label: 'Second half', seconds: 3600 },
      { label: 'Final whistle', seconds: 6300 },
    ],
  },
};

export const DEFAULT_TEMPLATE_ID = 'footy';
