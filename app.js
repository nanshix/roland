import { routes } from './src/router.js';

const app = document.querySelector('#app');
const navButtons = document.querySelectorAll('.nav-btn');
let activeCleanup = null;

function render(route) {
  if (typeof activeCleanup === 'function') {
    activeCleanup();
  }

  const mountView = routes[route] || routes.timer;
  const navigate = (nextRoute) => render(nextRoute);
  activeCleanup = mountView(app, navigate) || null;
  document.body.classList.toggle('is-landing', route === 'landing');

  navButtons.forEach((button) => {
    const isActive = button.dataset.route === route;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    render(button.dataset.route);
  });
});

render('landing');
