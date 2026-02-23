import { DEFAULT_TEMPLATE_ID, TIMER_TEMPLATES } from './templates.js';
import { addCheckpoint, applyTemplate, createState, removeCheckpoint, updateCheckpoint } from './state.js';

const TICK_MS = 250;

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

function createAudioEngine() {
  return {
    context: null,
    enabled: false,
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

      if (this.context.state === 'suspended') {
        await this.context.resume();
      }

      this.enabled = true;
      return true;
    },
    async playReminderTone() {
      if (!this.enabled || !this.context) {
        return;
      }

      if (this.context.state === 'suspended') {
        await this.context.resume();
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

function render({ timerState, runtime, notifications, audio }) {
  const elapsedMs = runtime.getElapsedMs();
  const totalMs = timerState.totalSeconds * 1000;
  const progress = Math.min(100, (elapsedMs / totalMs) * 100 || 0);
  const isRunning = runtime.status === 'running';
  const isEditable = !isRunning;
  const canStart = runtime.status === 'idle' || runtime.status === 'completed';

  const notificationsSupported = supportsNotifications();
  const notificationStatus = notificationsSupported ? notifications.permission : 'unsupported';

  return `
    <section class="card timer-card">
      <h1>Timer Tool</h1>
      <p class="meta">Footy template + live timer + browser notification/sound reminders.</p>

      <div class="timer-headline">
        <div>
          <p class="meta">Elapsed</p>
          <p class="clock">${formatMillis(elapsedMs)}</p>
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
          <button class="ghost-btn" id="enable-sound-btn" type="button" ${audio.enabled ? 'disabled' : ''}>Enable Sound</button>
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

  function clearTick() {
    if (runtime.intervalId) {
      window.clearInterval(runtime.intervalId);
      runtime.intervalId = null;
    }
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
      paint();
    });

    pauseButton.addEventListener('click', () => {
      runtime.baseElapsedMs = runtime.getElapsedMs();
      runtime.startEpochMs = null;
      runtime.status = 'paused';
      clearTick();
      paint();
    });

    resumeButton.addEventListener('click', () => {
      runtime.status = 'running';
      runtime.startEpochMs = Date.now();
      clearTick();
      runtime.intervalId = window.setInterval(paint, TICK_MS);
      paint();
    });

    resetButton.addEventListener('click', () => {
      runtime.status = 'idle';
      runtime.baseElapsedMs = 0;
      runtime.startEpochMs = null;
      runtime.firedCheckpointIds.clear();
      runtime.lastReminderMessage = 'Timer reset.';
      clearTick();
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
      paint();
    });

    addButton.addEventListener('click', () => {
      addCheckpoint(timerState);
      syncFiredCheckpointSet();
      paint();
    });

    container.querySelectorAll('.remove-checkpoint').forEach((button) => {
      button.addEventListener('click', () => {
        removeCheckpoint(timerState, button.dataset.removeId);
        syncFiredCheckpointSet();
        paint();
      });
    });

    container.querySelectorAll('.checkpoint-row').forEach((row) => {
      const id = row.dataset.id;
      const labelInput = row.querySelector('.checkpoint-label');
      const minuteInput = row.querySelector('.checkpoint-minutes');

      labelInput.addEventListener('input', () => {
        updateCheckpoint(timerState, id, { label: labelInput.value.trim() || 'Checkpoint' });
      });

      minuteInput.addEventListener('change', () => {
        updateCheckpoint(timerState, id, { seconds: Number(minuteInput.value) * 60 });
        syncFiredCheckpointSet();
        paint();
      });
    });
  }

  function handleVisibilityChange() {
    if (!document.hidden && runtime.status === 'running') {
      paint();
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);
  paint();

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    clearTick();
  };
}
