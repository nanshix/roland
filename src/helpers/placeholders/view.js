export function mountPlaceholderHelpersView(container) {
  container.innerHTML = `
    <section class="card">
      <h1>More Helpers</h1>
      <p class="meta">Scaffold is ready for additional helpers.</p>
      <div class="helpers-grid">
        <article class="helper-tile"><strong>Stopwatch</strong><br />Placeholder</article>
        <article class="helper-tile"><strong>Scoreboard</strong><br />Placeholder</article>
        <article class="helper-tile"><strong>Match Notes</strong><br />Placeholder</article>
      </div>
    </section>
  `;
}
