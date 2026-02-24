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
              <circle class="icon-ring" cx="60" cy="60" r="46" />
              <path class="icon-ball" d="M60 36l16 6 6 16-6 16-16 6-16-6-6-16 6-16 16-6z" />
            </svg>
          </span>
          <span class="landing-card-title">Footy Timer</span>
          <span class="landing-card-sub">Kickoff-ready checkpoints.</span>
        </button>
        <button class="landing-card" data-route="coming-soon" type="button" role="listitem">
          <span class="landing-icon icon-carpool" aria-hidden="true">
            <svg viewBox="0 0 120 120" focusable="false">
              <rect class="icon-ring" x="18" y="36" width="84" height="36" rx="12" />
              <path class="icon-line" d="M34 78h52" />
            </svg>
          </span>
          <span class="landing-card-title">Carpool</span>
          <span class="landing-card-sub">Simple pickup rotation.</span>
        </button>
        <button class="landing-card" data-route="coming-soon" type="button" role="listitem">
          <span class="landing-icon icon-candy" aria-hidden="true">
            <svg viewBox="0 0 120 120" focusable="false">
              <path class="icon-ring" d="M30 60c0-16 13-30 30-30s30 14 30 30-13 30-30 30-30-14-30-30z" />
              <path class="icon-line" d="M44 44l32 32" />
              <path class="icon-line" d="M76 44L44 76" />
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
