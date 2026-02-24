import { DEFAULT_TEMPLATE_ID, TIMER_TEMPLATES } from './templates.js';
import { addCheckpoint, applyTemplate, createState, removeCheckpoint, updateCheckpoint } from './state.js';

const TICK_MS = 250;
const STORAGE_KEY = 'roland-helper-timer-state';

function escapeHtmlAttr(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function formatSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');

  return `${minutes}:${seconds}`;
}

function formatMillis(ms) {
  return formatSeconds(Math.floor(ms / 1000));
}

function buildTemplateOptions(selectedTemplateId) {
  return Object.values(TIMER_TEMPLATES)
    .map((template) => {
      const selected = template.id === selectedTemplateId ? 'selected' : '';
      return `<option value="${escapeHtmlAttr(template.id)}" ${selected}>${escapeHtmlAttr(template.name)}</option>`;
    })
    .join('');
}

function buildCheckpointRows(checkpoints, elapsedMs, firedCheckpointIds, isEditable) {
  if (!checkpoints.length) {
    return '<p class="meta">No checkpoints yet. Add one below.</p>';
  }

  return checkpoints
    .map((checkpoint) => {
      const checkpointMs = checkpoint.seconds * 1000;
      const isPassed = elapsedMs >= checkpointMs;
      const isFired = firedCheckpointIds.has(checkpoint.id);
      const rowClass = isPassed ? 'checkpoint-row is-passed' : 'checkpoint-row';
      const statusText = isFired ? 'Triggered' : isPassed ? 'Reached' : 'Pending';
      const disabled = isEditable ? '' : 'disabled';

      return `
        <div class="${rowClass}" data-id="${checkpoint.id}">
          <input class="checkpoint-label" type="text" value="${escapeHtmlAttr(checkpoint.label)}" aria-label="Checkpoint label" ${disabled} />
          <input class="checkpoint-minutes" type="number" min="0" step="1" value="${Math.floor(checkpoint.seconds / 60)}" aria-label="Minutes" ${disabled} />
          <span class="checkpoint-status">${statusText}</span>
          <button class="ghost-btn remove-checkpoint" data-remove-id="${checkpoint.id}" type="button" ${disabled}>Remove</button>
        </div>
      `;
    })
    .join('');
}

function buildNextCheckpointLine(checkpoints, elapsedMs, firedCheckpointIds) {
  if (!checkpoints.length) {
    return 'No checkpoints configured.';
  }

  const upcoming = checkpoints.find(
    (checkpoint) =>
      !firedCheckpointIds.has(checkpoint.id) && elapsedMs < checkpoint.seconds * 1000,
  );

  if (!upcoming) {
    return 'All checkpoints reached.';
  }

  return `Next checkpoint: ${escapeHtmlAttr(upcoming.label)} at ${formatSeconds(upcoming.seconds)}.`;
}

function createAudioEngine() {
  const hasAudioContext = Boolean(window.AudioContext || window.webkitAudioContext);

  return {
    context: null,
    enabled: hasAudioContext,
    get AudioContextClass() {
      return window.AudioContext || window.webkitAudioContext || null;
    },
    async enable() {
      if (!this.AudioContextClass) {
        this.enabled = false;
        return false;
      }

      if (!this.context) {
        this.context = new this.AudioContextClass();
      }

      try {
        if (this.context.state === 'suspended') {
          await this.context.resume();
        }
      } catch (_error) {
        // Keep enabled; some browsers require a gesture before resume.
      }

      this.enabled = true;
      return true;
    },
    async playReminderTone() {
      if (!this.enabled) {
        return;
      }

      if (!this.context) {
        if (!this.AudioContextClass) {
          this.enabled = false;
          return;
        }
        this.context = new this.AudioContextClass();
      }

      try {
        if (this.context.state === 'suspended') {
          await this.context.resume();
        }
      } catch (_error) {
        return;
      }

      const now = this.context.currentTime;
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.context.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    },
  };
}

function supportsNotifications() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

function loadPersistedState() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    return parsed;
  } catch (_error) {
    return null;
  }
}

function persistState(payload) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (_error) {
    // Ignore storage failures.
  }
}

function render({ timerState, runtime, notifications, audio }) {
  const elapsedMs = runtime.getElapsedMs();
  const totalMs = timerState.totalSeconds * 1000;
  const progress = Math.min(100, (elapsedMs / totalMs) * 100 || 0);
  const isRunning = runtime.status === 'running';
  const isEditable = !isRunning;
  const canStart = runtime.status === 'idle' || runtime.status === 'completed';

  const notificationsSupported = supportsNotifications();
  const notificationStatus = notificationsSupported ? notifications.permission : 'unsupported';
  const soundLabel = audio.enabled ? 'Sound Enabled' : 'Enable Sound';

  return `
    <section class="card timer-card">
      <h1>Footy Timer</h1>
      <p class="meta">Footy template + live timer + browser notification/sound reminders.</p>

      <div class="timer-headline">
        <div>
          <p class="meta">Elapsed</p>
          <p class="clock">${formatMillis(elapsedMs)}</p>
          <div class="elapsed-adjust">
            <label>
              Minutes
              <input class="elapsed-minutes" type="number" min="0" step="1" inputmode="numeric" value="${Math.floor(elapsedMs / 60000)}" aria-label="Elapsed minutes" />
            </label>
          </div>
        </div>
        <div>
          <p class="meta">Total</p>
          <p class="clock subdued">${formatSeconds(timerState.totalSeconds)}</p>
        </div>
      </div>

      <div class="progress-wrap" aria-label="Timer progress">
        <div class="progress-bar" style="width: ${progress.toFixed(2)}%"></div>
      </div>

      <div class="timer-controls runtime-controls">
        <button class="primary-btn" id="start-btn" type="button" ${canStart ? '' : 'disabled'}>Start</button>
        <button class="ghost-btn" id="pause-btn" type="button" ${isRunning ? '' : 'disabled'}>Pause</button>
        <button class="ghost-btn" id="resume-btn" type="button" ${runtime.status === 'paused' ? '' : 'disabled'}>Resume</button>
        <button class="ghost-btn" id="reset-btn" type="button">Reset</button>
      </div>

      <section>
        <h2>Alerts</h2>
        <div class="timer-controls runtime-controls">
          <button class="ghost-btn" id="enable-notifications-btn" type="button" ${notificationsSupported && notificationStatus !== 'granted' ? '' : 'disabled'}>Enable Notifications</button>
          <button class="ghost-btn" id="enable-sound-btn" type="button" ${audio.enabled ? 'disabled' : ''}>${soundLabel}</button>
          <button class="ghost-btn" id="test-sound-btn" type="button" ${audio.enabled ? '' : 'disabled'}>Test Sound</button>
        </div>
        <p class="meta">Notifications: <strong>${escapeHtmlAttr(notificationStatus)}</strong> | Sound: <strong>${audio.enabled ? 'enabled' : 'disabled'}</strong></p>
      </section>

      <div class="timer-controls">
        <label>
          Template
          <select id="template-select" ${isRunning ? 'disabled' : ''}>
            ${buildTemplateOptions(timerState.selectedTemplateId)}
          </select>
        </label>
      </div>

      <section>
        <h2>Checkpoints</h2>
        <p class="meta">Reminders trigger when elapsed time reaches each checkpoint.</p>
        <p class="meta checkpoint-next">${buildNextCheckpointLine(timerState.checkpoints, elapsedMs, runtime.firedCheckpointIds)}</p>
        <div id="checkpoint-list">
          ${buildCheckpointRows(timerState.checkpoints, elapsedMs, runtime.firedCheckpointIds, isEditable)}
        </div>
        <div class="checkpoint-actions">
          <button id="add-checkpoint" class="primary-btn" type="button" ${isEditable ? '' : 'disabled'}>Add Checkpoint</button>
        </div>
      </section>

      <section>
        <h2>Latest Reminder</h2>
        <p class="meta">${escapeHtmlAttr(runtime.lastReminderMessage || 'No reminders triggered yet.')}</p>
      </section>
    </section>
  `;
}

function createRuntime() {
  return {
    status: 'idle',
    baseElapsedMs: 0,
    startEpochMs: null,
    intervalId: null,
    firedCheckpointIds: new Set(),
    lastReminderMessage: '',
    getElapsedMs() {
      if (this.status !== 'running') {
        return this.baseElapsedMs;
      }

      return this.baseElapsedMs + (Date.now() - this.startEpochMs);
    },
  };
}

function createNotificationsState() {
  return {
    permission: supportsNotifications() ? Notification.permission : 'unsupported',
  };
}

export function mountTimerView(container) {
  let timerState = createState(DEFAULT_TEMPLATE_ID);
  const runtime = createRuntime();
  const notifications = createNotificationsState();
  const audio = createAudioEngine();
  const persisted = loadPersistedState();

  if (persisted?.timerState) {
    timerState = persisted.timerState;
  }

  if (persisted?.runtime) {
    runtime.status = persisted.runtime.status || runtime.status;
    runtime.baseElapsedMs = Number(persisted.runtime.baseElapsedMs) || 0;
    runtime.startEpochMs = Number(persisted.runtime.startEpochMs) || null;
    runtime.firedCheckpointIds = new Set(persisted.runtime.firedCheckpointIds || []);
    runtime.lastReminderMessage = persisted.runtime.lastReminderMessage || runtime.lastReminderMessage;
  }

  if (runtime.status === 'running' && !runtime.startEpochMs) {
    runtime.startEpochMs = Date.now();
  }

  function clearTick() {
    if (runtime.intervalId) {
      window.clearInterval(runtime.intervalId);
      runtime.intervalId = null;
    }
  }

  function snapshotState() {
    return {
      timerState,
      runtime: {
        status: runtime.status,
        baseElapsedMs: runtime.baseElapsedMs,
        startEpochMs: runtime.startEpochMs,
        firedCheckpointIds: Array.from(runtime.firedCheckpointIds),
        lastReminderMessage: runtime.lastReminderMessage,
      },
    };
  }

  function saveState() {
    persistState(snapshotState());
  }

  function refreshNotificationPermission() {
    notifications.permission = supportsNotifications() ? Notification.permission : 'unsupported';
  }

  function syncFiredCheckpointSet() {
    const validIds = new Set(timerState.checkpoints.map((checkpoint) => checkpoint.id));
    runtime.firedCheckpointIds.forEach((id) => {
      if (!validIds.has(id)) {
        runtime.firedCheckpointIds.delete(id);
      }
    });
  }

  async function emitReminder(checkpoint, elapsedMs) {
    runtime.lastReminderMessage = `${checkpoint.label} reached at ${formatMillis(elapsedMs)}.`;

    try {
      if (notifications.permission === 'granted') {
        const title = `Timer checkpoint: ${checkpoint.label}`;
        const body = `Reached at ${formatMillis(elapsedMs)}.`;
        new Notification(title, { body });
      }
    } catch (_error) {
      runtime.lastReminderMessage = `${runtime.lastReminderMessage} Notification failed.`;
    }

    try {
      await audio.playReminderTone();
    } catch (_error) {
      runtime.lastReminderMessage = `${runtime.lastReminderMessage} Sound failed.`;
    }
  }

  function checkReminders() {
    const elapsedMs = runtime.getElapsedMs();

    timerState.checkpoints.forEach((checkpoint) => {
      const checkpointMs = checkpoint.seconds * 1000;
      if (elapsedMs >= checkpointMs && !runtime.firedCheckpointIds.has(checkpoint.id)) {
        runtime.firedCheckpointIds.add(checkpoint.id);
        void emitReminder(checkpoint, elapsedMs);
      }
    });

    if (elapsedMs >= timerState.totalSeconds * 1000) {
      runtime.baseElapsedMs = timerState.totalSeconds * 1000;
      runtime.status = 'completed';
      clearTick();
    }
  }

  function paint() {
    refreshNotificationPermission();
    checkReminders();
    container.innerHTML = render({ timerState, runtime, notifications, audio });

    const templateSelect = container.querySelector('#template-select');
    const addButton = container.querySelector('#add-checkpoint');
    const elapsedMinutesInput = container.querySelector('.elapsed-minutes');
    const startButton = container.querySelector('#start-btn');
    const pauseButton = container.querySelector('#pause-btn');
    const resumeButton = container.querySelector('#resume-btn');
    const resetButton = container.querySelector('#reset-btn');
    const enableNotificationsButton = container.querySelector('#enable-notifications-btn');
    const enableSoundButton = container.querySelector('#enable-sound-btn');
    const testSoundButton = container.querySelector('#test-sound-btn');

    startButton.addEventListener('click', () => {
      runtime.status = 'running';
      runtime.baseElapsedMs = 0;
      runtime.startEpochMs = Date.now();
      runtime.firedCheckpointIds.clear();
      runtime.lastReminderMessage = 'Timer started.';
      clearTick();
      runtime.intervalId = window.setInterval(paint, TICK_MS);
      saveState();
      paint();
    });

    pauseButton.addEventListener('click', () => {
      runtime.baseElapsedMs = runtime.getElapsedMs();
      runtime.startEpochMs = null;
      runtime.status = 'paused';
      clearTick();
      saveState();
      paint();
    });

    resumeButton.addEventListener('click', () => {
      runtime.status = 'running';
      runtime.startEpochMs = Date.now();
      clearTick();
      runtime.intervalId = window.setInterval(paint, TICK_MS);
      saveState();
      paint();
    });

    resetButton.addEventListener('click', () => {
      runtime.status = 'idle';
      runtime.baseElapsedMs = 0;
      runtime.startEpochMs = null;
      runtime.firedCheckpointIds.clear();
      runtime.lastReminderMessage = 'Timer reset.';
      clearTick();
      saveState();
      paint();
    });

    enableNotificationsButton.addEventListener('click', async () => {
      if (!supportsNotifications()) {
        return;
      }

      try {
        notifications.permission = await Notification.requestPermission();
        runtime.lastReminderMessage = `Notification permission: ${notifications.permission}.`;
      } catch (_error) {
        runtime.lastReminderMessage = 'Notification permission request failed.';
      }
      saveState();
      paint();
    });

    enableSoundButton.addEventListener('click', async () => {
      const enabled = await audio.enable();
      runtime.lastReminderMessage = enabled
        ? 'Sound enabled.'
        : 'Sound not supported in this browser.';
      if (enabled) {
        await audio.playReminderTone();
      }
      saveState();
      paint();
    });

    testSoundButton.addEventListener('click', async () => {
      await audio.playReminderTone();
    });

    templateSelect.addEventListener('change', (event) => {
      timerState = applyTemplate(event.target.value);
      runtime.status = 'idle';
      runtime.baseElapsedMs = 0;
      runtime.startEpochMs = null;
      runtime.firedCheckpointIds.clear();
      runtime.lastReminderMessage = `Template switched to ${TIMER_TEMPLATES[event.target.value].name}.`;
      clearTick();
      saveState();
      paint();
    });

    addButton.addEventListener('click', () => {
      addCheckpoint(timerState);
      syncFiredCheckpointSet();
      saveState();
      paint();
    });

    container.querySelectorAll('.remove-checkpoint').forEach((button) => {
      button.addEventListener('click', () => {
        removeCheckpoint(timerState, button.dataset.removeId);
        syncFiredCheckpointSet();
        saveState();
        paint();
      });
    });

    container.querySelectorAll('.checkpoint-row').forEach((row) => {
      const id = row.dataset.id;
      const labelInput = row.querySelector('.checkpoint-label');
      const minuteInput = row.querySelector('.checkpoint-minutes');

      labelInput.addEventListener('input', () => {
        updateCheckpoint(timerState, id, { label: labelInput.value.trim() || 'Checkpoint' });
        saveState();
      });

      minuteInput.addEventListener('change', () => {
        updateCheckpoint(timerState, id, { seconds: Number(minuteInput.value) * 60 });
        syncFiredCheckpointSet();
        saveState();
        paint();
      });
    });

    elapsedMinutesInput.addEventListener('change', () => {
      const currentElapsedMs = runtime.getElapsedMs();
      const desiredMinutes = Number(elapsedMinutesInput.value);
      const safeMinutes = Number.isFinite(desiredMinutes) ? Math.max(0, desiredMinutes) : 0;
      const secondsMs = currentElapsedMs % 60000;
      runtime.baseElapsedMs = safeMinutes * 60000 + secondsMs;
      runtime.startEpochMs = runtime.status === 'running' ? Date.now() : null;
      runtime.firedCheckpointIds = new Set(
        timerState.checkpoints
          .filter((checkpoint) => checkpoint.seconds * 1000 <= runtime.baseElapsedMs)
          .map((checkpoint) => checkpoint.id),
      );
      runtime.lastReminderMessage = `Elapsed time adjusted to ${formatMillis(runtime.baseElapsedMs)}.`;
      saveState();
      paint();
    });
  }

  function handleVisibilityChange() {
    if (!document.hidden && runtime.status === 'running') {
      paint();
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);
  if (runtime.status === 'running' && runtime.startEpochMs) {
    runtime.intervalId = window.setInterval(paint, TICK_MS);
  }
  paint();

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    clearTick();
    saveState();
  };
}
