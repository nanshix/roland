export function mountLandingView(container, navigate) {
  container.innerHTML = `
    <section class="landing">
      <div class="landing-card">
        <p class="landing-eyebrow">Roland Helper</p>
        <h1>Start the match timer in one tap.</h1>
        <p class="landing-subhead">Footy checkpoints, alerts, and a clean full-screen view. No setup needed.</p>
        <button class="cta-btn" id="launch-timer" type="button">Open Timer</button>
        <p class="landing-note">You can customize checkpoints after launch.</p>
      </div>
    </section>
  `;

  const launchButton = container.querySelector('#launch-timer');
  const handleLaunch = () => {
    if (typeof navigate === 'function') {
      navigate('timer');
    }
  };

  launchButton.addEventListener('click', handleLaunch);

  return () => {
    launchButton.removeEventListener('click', handleLaunch);
  };
}
