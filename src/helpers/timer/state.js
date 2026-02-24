import { DEFAULT_TEMPLATE_ID, TIMER_TEMPLATES } from './templates.js';

function checkpointWithId(checkpoint, index) {
  return {
    id: checkpoint.id || `cp-${Date.now()}-${index}`,
    label: checkpoint.label,
    seconds: Number(checkpoint.seconds) || 0,
  };
}

function normalizeCheckpoints(checkpoints) {
  return checkpoints
    .map(checkpointWithId)
    .sort((a, b) => a.seconds - b.seconds)
    .map((checkpoint, index) => ({
      ...checkpoint,
      id: checkpoint.id || `cp-${Date.now()}-${index}`,
    }));
}

export function createState(templateId = DEFAULT_TEMPLATE_ID) {
  return applyTemplate(templateId);
}

export function applyTemplate(templateId) {
  const template = TIMER_TEMPLATES[templateId] || TIMER_TEMPLATES[DEFAULT_TEMPLATE_ID];

  return {
    selectedTemplateId: template.id,
    totalSeconds: template.totalSeconds,
    checkpoints: normalizeCheckpoints(template.checkpoints),
  };
}

export function addCheckpoint(state) {
  const fallback = Math.min(state.totalSeconds, 300);
  const last = state.checkpoints[state.checkpoints.length - 1];
  const nextSeconds = last ? Math.min(state.totalSeconds, last.seconds + 300) : fallback;

  state.checkpoints.push({
    id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: `Checkpoint ${state.checkpoints.length + 1}`,
    seconds: nextSeconds,
  });

  state.checkpoints = normalizeCheckpoints(state.checkpoints);
}

export function updateCheckpoint(state, id, patch) {
  state.checkpoints = state.checkpoints.map((checkpoint) => {
    if (checkpoint.id !== id) {
      return checkpoint;
    }

    return {
      ...checkpoint,
      label: typeof patch.label === 'string' ? patch.label : checkpoint.label,
      seconds:
        typeof patch.seconds === 'number' && Number.isFinite(patch.seconds)
          ? Math.max(0, Math.min(state.totalSeconds, patch.seconds))
          : checkpoint.seconds,
    };
  });

  state.checkpoints = normalizeCheckpoints(state.checkpoints);
}

export function removeCheckpoint(state, id) {
  state.checkpoints = state.checkpoints.filter((checkpoint) => checkpoint.id !== id);
}
