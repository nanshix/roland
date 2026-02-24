export function mountLandingView(container, navigate) {
  container.innerHTML = `
    <section class="landing">
      <div class="landing-intro">
        <p class="landing-eyebrow">Roland Helper</p>
        <h1>Pick a helper and go.</h1>
      </div>
      <div class="landing-grid" role="list">
        <button class="landing-card" data-route="timer" type="button" role="listitem">
          <span class="landing-icon icon-footy" aria-hidden="true">
            <svg viewBox="0 0 120 120" focusable="false">
              <circle class="icon-ring" cx="60" cy="60" r="38" />
              <path class="icon-line" d="M60 24c-12 6-18 18-18 30s6 24 18 30c12-6 18-18 18-30s-6-24-18-30z" />
              <path class="icon-line" d="M60 24l16 6 8 16-8 20-16 6-16-6-8-20 8-16 16-6z" />
              <path class="icon-line" d="M50 44l-12 6M70 44l12 6M50 76l-12-6M70 76l12-6" />
            </svg>
          </span>
          <span class="landing-card-title">Footy Timer</span>
          <span class="landing-card-sub">Kickoff-ready checkpoints.</span>
        </button>
        <button class="landing-card" data-route="coming-soon" type="button" role="listitem">
          <span class="landing-icon icon-stopwatch" aria-hidden="true">
            <svg viewBox="0 0 120 120" focusable="false">
              <circle class="icon-ring" cx="60" cy="64" r="30" />
              <path class="icon-line" d="M60 64V48" />
              <path class="icon-line" d="M48 34h24" />
            </svg>
          </span>
          <span class="landing-card-title">Stopwatch</span>
          <span class="landing-card-sub">Quick laps and splits.</span>
        </button>
        <button class="landing-card" data-route="coming-soon" type="button" role="listitem">
          <span class="landing-icon icon-scoreboard" aria-hidden="true">
            <svg viewBox="0 0 120 120" focusable="false">
              <rect class="icon-ring" x="24" y="30" width="72" height="48" rx="10" />
              <path class="icon-line" d="M40 56h18M62 56h18" />
              <path class="icon-line" d="M46 46l6-6 6 6M72 46l6-6 6 6" />
            </svg>
          </span>
          <span class="landing-card-title">Scoreboard</span>
          <span class="landing-card-sub">Live match scoring.</span>
        </button>
        <button class="landing-card" data-route="coming-soon" type="button" role="listitem">
          <span class="landing-icon icon-notes" aria-hidden="true">
            <svg viewBox="0 0 120 120" focusable="false">
              <rect class="icon-ring" x="28" y="26" width="64" height="68" rx="10" />
              <path class="icon-line" d="M42 48h36M42 62h36M42 76h22" />
            </svg>
          </span>
          <span class="landing-card-title">Match Notes</span>
          <span class="landing-card-sub">Capture key moments.</span>
        </button>
        <button class="landing-card" data-route="coming-soon" type="button" role="listitem">
          <span class="landing-icon icon-carpool" aria-hidden="true">
            <svg viewBox="0 0 120 120" focusable="false">
              <path class="icon-ring" d="M28 68h64c6 0 10-4 10-10v-10c0-6-4-10-10-10H74l-8-10H46l-8 10H28c-6 0-10 4-10 10v10c0 6 4 10 10 10z" />
              <path class="icon-line" d="M34 68v6M86 68v6" />
              <path class="icon-line" d="M40 54h40" />
            </svg>
          </span>
          <span class="landing-card-title">Carpool</span>
          <span class="landing-card-sub">Simple pickup rotation.</span>
        </button>
        <button class="landing-card" data-route="coming-soon" type="button" role="listitem">
          <span class="landing-icon icon-candy" aria-hidden="true">
            <svg viewBox="0 0 120 120" focusable="false">
              <circle class="icon-ring" cx="60" cy="60" r="28" />
              <circle class="icon-line" cx="60" cy="60" r="6" />
              <path class="icon-line" d="M60 32v20M60 68v20M32 60h20M68 60h20" />
              <path class="icon-line" d="M43 43l10 10M77 77l-10-10M43 77l10-10M77 43l-10 10" />
            </svg>
          </span>
          <span class="landing-card-title">Candy Rotate</span>
          <span class="landing-card-sub">Fair weekly turns.</span>
        </button>
        <button class="landing-card" data-route="coming-soon" type="button" role="listitem">
          <span class="landing-icon icon-timetable" aria-hidden="true">
            <svg viewBox="0 0 120 120" focusable="false">
              <rect class="icon-ring" x="26" y="24" width="68" height="72" rx="12" />
              <path class="icon-line" d="M40 46h40M40 62h40M40 78h24" />
            </svg>
          </span>
          <span class="landing-card-title">Timetable</span>
          <span class="landing-card-sub">Focus blocks at a glance.</span>
        </button>
        <button class="landing-card" data-route="coming-soon" type="button" role="listitem">
          <span class="landing-icon icon-roster" aria-hidden="true">
            <svg viewBox="0 0 120 120" focusable="false">
              <path class="icon-ring" d="M40 54c0-8 6-14 14-14s14 6 14 14-6 14-14 14-14-6-14-14z" />
              <path class="icon-line" d="M32 86c6-10 18-14 28-14s22 4 28 14" />
            </svg>
          </span>
          <span class="landing-card-title">Roster</span>
          <span class="landing-card-sub">Keep teams balanced.</span>
        </button>
        <button class="landing-card" data-route="coming-soon" type="button" role="listitem">
          <span class="landing-icon icon-checklist" aria-hidden="true">
            <svg viewBox="0 0 120 120" focusable="false">
              <rect class="icon-ring" x="30" y="24" width="60" height="72" rx="10" />
              <path class="icon-line" d="M44 48l6 6 10-12M44 68h32M44 82h24" />
            </svg>
          </span>
          <span class="landing-card-title">Checklist</span>
          <span class="landing-card-sub">Prep gear fast.</span>
        </button>
      </div>
    </section>
  `;

  const cards = Array.from(container.querySelectorAll('.landing-card'));
  const handleClick = (event) => {
    const card = event.currentTarget;
    const route = card.dataset.route;
    if (typeof navigate === 'function' && route) {
      navigate(route);
    }
  };

  cards.forEach((card) => card.addEventListener('click', handleClick));

  return () => {
    cards.forEach((card) => card.removeEventListener('click', handleClick));
  };
}
