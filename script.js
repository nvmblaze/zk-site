const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const header = document.querySelector('.site-header');

// Add another year by adding its year and supplied banner path to this list.
const results = [
  { year: '2026', image: 'assets/optimized/results-2026-2600.jpeg', full: 'assets/results-2026.jpeg' },
  { year: '2025', image: 'assets/optimized/results-2025-2600.jpeg', full: 'assets/results-2025.jpeg' },
  { year: '2023', image: 'assets/optimized/results-2023-2600.jpeg', full: 'assets/results-2023.jpeg' },
  { year: '2022', image: 'assets/optimized/results-2022-2600.jpeg', full: 'assets/results-2022.jpeg' },
];

const resultsList = document.querySelector('#results-list');
resultsList.innerHTML = results.map(({ year, image, full }) => `
  <article class="result-item reveal">
    <h2>${year} SSC Results</h2>
    <div class="result-banner-toolbar">
      <span>Tap the preview to view the full banner</span>
      <a href="${full}" target="_blank" rel="noopener" aria-label="Open the original full-resolution ${year} SSC results banner in a new tab">Open full-size banner <span aria-hidden="true">↗</span></a>
    </div>
    <div class="result-banner-scroll">
      <a href="${full}" target="_blank" rel="noopener" aria-label="View the complete ${year} SSC results banner">
        <img class="result-banner" src="${image}" srcset="assets/optimized/results-${year}-800.jpeg 800w, assets/optimized/results-${year}-2048.jpeg 2048w, assets/optimized/results-${year}-2600.jpeg 2600w" sizes="(max-width: 700px) 100vw, 2048px" width="2600" height="709" alt="${year} SSC student results banner from ZK Educational Academy. Tap to open the full-size banner." loading="lazy" decoding="async">
      </a>
    </div>
  </article>
`).join('');

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

const enquiryForm = document.querySelector('.contact-form');
enquiryForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!enquiryForm.reportValidity()) return;

  const formData = new FormData(enquiryForm);
  const message = [
    'New enquiry for ZK Educational Academy',
    `Name: ${String(formData.get('name') || '').trim()}`,
    `Phone: ${String(formData.get('phone') || '').trim()}`,
    `Program: ${String(formData.get('program') || '').trim()}`,
  ].join('\n');
  const whatsappUrl = `https://wa.me/919133100660?text=${encodeURIComponent(message)}`;
  document.querySelector('.form-note').textContent = 'WhatsApp is opening with your enquiry. Review it and tap Send to deliver it to the academy.';
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
});
