const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const header = document.querySelector('.site-header');

// Add another year by adding its year and supplied banner path to this list.
const results = [
  { year: '2026', image: 'assets/results-2026.jpeg' },
  { year: '2025', image: 'assets/results-2025.jpeg' },
  { year: '2023', image: 'assets/results-2023.jpeg' },
  { year: '2022', image: 'assets/results-2022.jpeg' },
];

const resultsList = document.querySelector('#results-list');
resultsList.innerHTML = results.map(({ year, image }, index) => `
  <article class="result-item reveal">
    <h2>${year} SSC Results</h2>
    <div class="result-banner-scroll" role="region" tabindex="0" aria-label="${year} SSC results banner. Scroll horizontally to view the full banner on smaller screens.">
      <img class="result-banner" src="${image}" alt="${year} SSC student results banner from ZK Educational Academy" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async">
    </div>
  </article>
`).join('');

const classroomPhotos = Array.from({ length: 10 }, (_, index) => `assets/class${index + 1}.jpeg`);
const carouselTrack = document.querySelector('#classroom-carousel-track');
const carouselViewport = document.querySelector('.carousel-viewport');
const carousel = document.querySelector('.classroom-carousel');
const carouselPauseButton = document.querySelector('[data-carousel-toggle]');
const photoMarkup = (decorative = false) => classroomPhotos.map((src) => `
  <figure class="carousel-slide">
    <img src="${src}" alt="${decorative ? '' : 'ZK Educational Academy classroom interior'}" loading="lazy" draggable="false">
  </figure>
`).join('');

carouselTrack.innerHTML = `<div class="carousel-group">${photoMarkup()}</div><div class="carousel-group" aria-hidden="true">${photoMarkup(true)}</div>`;
const carouselFirstGroup = carouselTrack.querySelector('.carousel-group');

const carouselPrefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let carouselPaused = false;
let pointerInsideCarousel = false;
let pointerInteracting = false;
let keyboardInteracting = false;
let lastCarouselFrame = 0;
let pointerResumeTimer;
let carouselLoopWidth = carouselFirstGroup.scrollWidth;

const updateCarouselLoopWidth = () => {
  carouselLoopWidth = carouselFirstGroup.scrollWidth;
};
if ('ResizeObserver' in window) {
  new ResizeObserver(updateCarouselLoopWidth).observe(carouselFirstGroup);
} else {
  window.addEventListener('resize', updateCarouselLoopWidth, { passive: true });
}

if (carouselPrefersReducedMotion.matches) carouselPauseButton.hidden = true;

carouselPauseButton.addEventListener('click', () => {
  carouselPaused = !carouselPaused;
  keyboardInteracting = false;
  carouselPauseButton.setAttribute('aria-pressed', String(carouselPaused));
  carouselPauseButton.textContent = carouselPaused ? 'Play' : 'Pause';
});

document.querySelector('[data-carousel-prev]').addEventListener('click', () => {
  const slide = carousel.querySelector('.carousel-slide');
  carouselViewport.scrollBy({ left: -(slide.getBoundingClientRect().width + 16), behavior: carouselPrefersReducedMotion.matches ? 'auto' : 'smooth' });
});

document.querySelector('[data-carousel-next]').addEventListener('click', () => {
  const slide = carousel.querySelector('.carousel-slide');
  carouselViewport.scrollBy({ left: slide.getBoundingClientRect().width + 16, behavior: carouselPrefersReducedMotion.matches ? 'auto' : 'smooth' });
});

carousel.addEventListener('pointerenter', () => { pointerInsideCarousel = true; });
carousel.addEventListener('pointerleave', () => { pointerInsideCarousel = false; });
carousel.addEventListener('pointerdown', () => {
  pointerInteracting = true;
  clearTimeout(pointerResumeTimer);
});
carousel.addEventListener('pointerup', () => {
  clearTimeout(pointerResumeTimer);
  pointerResumeTimer = setTimeout(() => { pointerInteracting = false; }, 1200);
});
carousel.addEventListener('focusin', () => { keyboardInteracting = true; });
carousel.addEventListener('focusout', () => {
  setTimeout(() => { keyboardInteracting = carousel.contains(document.activeElement) && !document.activeElement.matches('[data-carousel-toggle]'); }, 0);
});

function animateClassroomCarousel(timestamp) {
  if (!lastCarouselFrame) lastCarouselFrame = timestamp;
  const frameDuration = Math.min(timestamp - lastCarouselFrame, 50);
  lastCarouselFrame = timestamp;

  const shouldAutoScroll = !carouselPrefersReducedMotion.matches && !carouselPaused && !pointerInsideCarousel && !pointerInteracting && !keyboardInteracting;
  if (shouldAutoScroll) {
    carouselViewport.scrollLeft += frameDuration * 0.048;
    if (carouselLoopWidth && carouselViewport.scrollLeft >= carouselLoopWidth) {
      carouselViewport.scrollLeft -= carouselLoopWidth;
    }
  }

  requestAnimationFrame(animateClassroomCarousel);
}

if (!carouselPrefersReducedMotion.matches) requestAnimationFrame(animateClassroomCarousel);

function closeNavigation() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}

menuButton.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeNavigation);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeNavigation();
});

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });

document.querySelector('#year').textContent = new Date().getFullYear();

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  document.body.classList.add('reveal-ready');
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('visible'));
}

document.querySelector('.contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  document.querySelector('.form-note').textContent = 'This prototype form is not connected yet. Add the academy’s contact details or a form service to receive enquiries.';
});
