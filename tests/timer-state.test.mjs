import test from 'node:test';
import assert from 'node:assert/strict';

import { TIMER_TEMPLATES } from '../src/helpers/timer/templates.js';
import { addCheckpoint, applyTemplate, createState, removeCheckpoint, updateCheckpoint } from '../src/helpers/timer/state.js';

test('createState uses default template when id is omitted', () => {
  const state = createState();

  assert.equal(state.selectedTemplateId, TIMER_TEMPLATES.footy.id);
  assert.equal(state.totalSeconds, TIMER_TEMPLATES.footy.totalSeconds);
  assert.equal(Array.isArray(state.checkpoints), true);
  assert.ok(state.checkpoints.length > 0);
});

test('applyTemplate falls back to default when unknown id is provided', () => {
  const state = applyTemplate('does-not-exist');

  assert.equal(state.selectedTemplateId, TIMER_TEMPLATES.footy.id);
  assert.equal(state.totalSeconds, TIMER_TEMPLATES.footy.totalSeconds);
});

test('addCheckpoint appends checkpoint within total duration bounds', () => {
  const state = createState();
  const beforeCount = state.checkpoints.length;

  addCheckpoint(state);

  assert.equal(state.checkpoints.length, beforeCount + 1);
  const last = state.checkpoints[state.checkpoints.length - 1];
  assert.ok(last.seconds <= state.totalSeconds);
});

test('updateCheckpoint clamps seconds and keeps ordering', () => {
  const state = createState();
  const targetId = state.checkpoints[0].id;

  updateCheckpoint(state, targetId, { seconds: state.totalSeconds + 5000 });

  const updated = state.checkpoints.find((checkpoint) => checkpoint.id === targetId);
  assert.equal(updated.seconds, state.totalSeconds);

  const sortedSeconds = [...state.checkpoints].map((checkpoint) => checkpoint.seconds);
  const manuallySorted = [...sortedSeconds].sort((a, b) => a - b);
  assert.deepEqual(sortedSeconds, manuallySorted);
});

test('removeCheckpoint removes by id', () => {
  const state = createState();
  const idToRemove = state.checkpoints[0].id;

  removeCheckpoint(state, idToRemove);

  assert.equal(state.checkpoints.some((checkpoint) => checkpoint.id === idToRemove), false);
});
