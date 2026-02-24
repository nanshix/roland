import { routes } from './src/router.js';

const app = document.querySelector('#app');
const navButtons = document.querySelectorAll('.nav-btn');
const brandLink = document.querySelector('.brand-link');
const ROUTE_STORAGE_KEY = 'roland-helper-route';
let activeCleanup = null;

function render(route) {
  if (typeof activeCleanup === 'function') {
    activeCleanup();
  }

  const mountView = routes[route] || routes.timer;
  const navigate = (nextRoute) => render(nextRoute);
  activeCleanup = mountView(app, navigate) || null;
  document.body.classList.toggle('is-landing', route === 'landing');

  try {
    window.localStorage.setItem(ROUTE_STORAGE_KEY, route);
  } catch (_error) {
    // Ignore storage failures.
  }

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

if (brandLink) {
  brandLink.addEventListener('click', () => {
    render(brandLink.dataset.route || 'landing');
  });
}

let initialRoute = 'landing';
try {
  const storedRoute = window.localStorage.getItem(ROUTE_STORAGE_KEY);
  if (storedRoute && routes[storedRoute]) {
    initialRoute = storedRoute;
  }
} catch (_error) {
  // Ignore storage failures.
}

render(initialRoute);
