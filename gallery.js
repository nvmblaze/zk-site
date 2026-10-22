const classroomImageCount = 10;
const galleryGrid = document.querySelector('#full-gallery-grid');

galleryGrid.innerHTML = Array.from({ length: classroomImageCount }, (_, index) => {
  const imageNumber = index + 1;
  const originalImage = `assets/class${imageNumber}.jpeg`;
  const smallImage = `assets/optimized/class${imageNumber}-800.jpeg`;
  const largeImage = `assets/optimized/class${imageNumber}-1200.jpeg`;
  return `
  <figure class="full-gallery-item">
    <a href="${originalImage}" target="_blank" rel="noopener" aria-label="Open full-size classroom photo ${imageNumber}">
      <img src="${smallImage}" srcset="${smallImage} 800w, ${largeImage} 1200w" sizes="(max-width: 600px) calc(100vw - 32px), (max-width: 850px) calc(50vw - 28px), (max-width: 1250px) calc(33.333vw - 42px), 381px" width="800" height="600" alt="ZK Educational Academy classroom interior" loading="lazy" decoding="async">
    </a>
  </figure>
`;
}).join('');

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const header = document.querySelector('.site-header');

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

navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNavigation));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeNavigation();
});
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });
document.querySelector('#year').textContent = new Date().getFullYear();
