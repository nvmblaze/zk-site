const classroomImages = Array.from({ length: 10 }, (_, index) => `assets/class${index + 1}.jpeg`);
const galleryGrid = document.querySelector('#full-gallery-grid');

galleryGrid.innerHTML = classroomImages.map((src, index) => `
  <figure class="full-gallery-item">
    <a href="${src}" target="_blank" rel="noopener" aria-label="Open full-size classroom photo ${index + 1}">
      <img src="${src}" alt="ZK Educational Academy classroom interior" loading="${index < 3 ? 'eager' : 'lazy'}" decoding="async">
    </a>
  </figure>
`).join('');

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
