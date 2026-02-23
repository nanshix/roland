export function mountPlaceholderToolsView(container) {
  container.innerHTML = `
    <section class="card">
      <h1>More Tools</h1>
      <p class="meta">Scaffold is ready for additional tools.</p>
      <div class="tools-grid">
        <article class="tool-tile"><strong>Stopwatch</strong><br />Placeholder</article>
        <article class="tool-tile"><strong>Scoreboard</strong><br />Placeholder</article>
        <article class="tool-tile"><strong>Match Notes</strong><br />Placeholder</article>
      </div>
    </section>
  `;
}
