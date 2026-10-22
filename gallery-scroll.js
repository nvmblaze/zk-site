const galleryImagePaths = Array.from({ length: 10 }, (_, index) => `assets/class${index + 1}.jpeg`);
const galleryAspectRatios = [3 / 2, 4 / 3, 5 / 4, 7 / 5];
const galleryCaptions = [
  ['Spacious classrooms', 'SPACE TO LEARN', 'Room to settle in and focus on each lesson.'],
  ['Clean learning spaces', 'A WELL KEPT SETTING', 'A cared-for classroom for the school day.'],
  ['A place to focus', 'CLASSROOM ENVIRONMENT', 'A dedicated setting for lessons and practice.'],
  ['Made for daily learning', 'STUDENT SPACE', 'A comfortable space for regular classes.'],
  ['A welcoming classroom', 'LEARNING AT ZK', 'An inviting place to learn alongside classmates.'],
  ['Room for every lesson', 'CLASSROOMS', 'Space for teaching, note-taking and practice.'],
  ['Clean, bright spaces', 'STUDY ENVIRONMENT', 'A well-kept setting for focused classes.'],
  ['A focused setting', 'LEARNING SPACES', 'A classroom where students can work through ideas.'],
  ['Prepared for class', 'AT THE ACADEMY', 'A learning space ready for the school day.'],
  ['Comfortable classrooms', 'STUDENT EXPERIENCE', 'A dedicated environment for students to study.'],
];
const galleryImageHeight = 375;
const galleryWaves = {
  base: { amp: 0.1, freq: 1, speed: 1, phase: 5 },
  flow: { amp: 0.15, freq: 5, speed: 5, phase: 10 },
  detail: { amp: 0.025, freq: 5, speed: 1.5, phase: 2.5 },
};
const galleryImagesContainer = document.querySelector('#classroom-scroll-gallery');

if (galleryImagesContainer) {
  const galleryImageItems = galleryImagePaths.map((src, index) => {
    const row = document.createElement('div');
    row.className = 'spotlight-row';
    const item = document.createElement('figure');
    item.className = 'spotlight-image';

    const image = document.createElement('img');
    image.src = src;
    image.alt = `Classroom ${index + 1} at ZK Educational Academy`;
    image.loading = index < 2 ? 'eager' : 'lazy';
    image.decoding = 'async';
    item.appendChild(image);
    const copy = document.createElement('div');
    copy.className = 'spotlight-copy';
    copy.innerHTML = `<span>${galleryCaptions[index][1]}</span><h3>${galleryCaptions[index][0]}</h3><p>${galleryCaptions[index][2]}</p>`;
    row.append(item, copy);
    galleryImagesContainer.appendChild(row);
    return { row, item, copy };
  });

  const reduceGalleryMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let galleryFrameRequested = false;

  function sizeGalleryImages() {
    const sizeFactor = Math.min(window.innerWidth / 750, 1);
    const shrinkStartIndex = Math.floor(galleryImageItems.length * 0.75);

    galleryImageItems.forEach(({ row, item }, index) => {
      const shrinkFactor = index >= shrinkStartIndex
        ? (index - shrinkStartIndex + 1) / (galleryImageItems.length - shrinkStartIndex)
        : 0;
      const height = galleryImageHeight * sizeFactor * (1 - shrinkFactor * 0.5);
      const ratio = galleryAspectRatios[index % galleryAspectRatios.length];
      item.style.width = `${Math.round(height * ratio)}px`;
      item.style.height = `${Math.round(height)}px`;
      row.style.setProperty('--spotlight-image-height', `${Math.round(height)}px`);
    });
  }

  function updateGalleryWave() {
    galleryFrameRequested = false;
    if (reduceGalleryMotion.matches) {
      galleryImageItems.forEach(({ row, item, copy }) => {
        const rowRect = row.getBoundingClientRect();
        item.style.translate = `${Math.round((window.innerWidth - item.offsetWidth) / 2 - rowRect.left)}px 0`;
        item.style.clipPath = 'inset(0 0 0 0)';
        copy.style.opacity = '1';
        copy.style.clipPath = 'inset(0 0 0 0)';
        copy.style.translate = '0 0';
      });
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    galleryImageItems.forEach(({ row, item, copy }, index) => {
      const progress = Math.max(0, Math.min(1,
        (viewportHeight - item.getBoundingClientRect().top) / (viewportHeight + item.offsetHeight)));
      const normalizedIndex = index / Math.max(1, galleryImageItems.length - 1);
      const wave = (settings, progressFactor) => Math.sin(
        normalizedIndex * settings.freq + progressFactor * settings.speed + settings.phase,
      );
      const baseWave = wave(galleryWaves.base, 1 - progress);
      const flowWave = 0.5 + wave(galleryWaves.flow, progress);
      const detailWave = 0.5 + wave(galleryWaves.detail, progress);
      const desiredX = (viewportWidth - item.offsetWidth) / 2 - viewportWidth * 0.1
        + baseWave * viewportWidth * galleryWaves.base.amp
        + flowWave * viewportWidth * galleryWaves.flow.amp
        + detailWave * viewportWidth * galleryWaves.detail.amp;
      const rowRect = row.getBoundingClientRect();
      const minX = rowRect.left;
      const maxX = Math.max(minX, viewportWidth - item.offsetWidth - 8);
      const translateX = Math.max(minX, Math.min(maxX, desiredX)) - rowRect.left;
      const centerOffset = Math.abs(progress - 0.5) * 2;
      const clipAmount = centerOffset ** 2 * 20;

      item.style.translate = `${Math.round(translateX)}px 0`;
      item.style.clipPath = `inset(0 ${clipAmount.toFixed(2)}% 0 ${clipAmount.toFixed(2)}%)`;

      const imageRect = item.getBoundingClientRect();
      const leftSpace = imageRect.left - rowRect.left;
      const rightSpace = rowRect.right - imageRect.right;
      if (viewportWidth > 700) {
        if (leftSpace >= rightSpace) {
          copy.style.left = '0';
          copy.style.right = 'auto';
          copy.style.textAlign = 'left';
        } else {
          copy.style.left = 'auto';
          copy.style.right = '0';
          copy.style.textAlign = 'right';
        }
      }
      const textReveal = 1 - centerOffset;
      copy.style.opacity = String(0.3 + textReveal * 0.7);
      copy.style.clipPath = `inset(0 ${clipAmount.toFixed(2)}% 0 ${clipAmount.toFixed(2)}%)`;
      copy.style.translate = `0 ${Math.round((1 - textReveal) * 18)}px`;
    });
  }

  function requestGalleryUpdate() {
    if (galleryFrameRequested) return;
    galleryFrameRequested = true;
    requestAnimationFrame(updateGalleryWave);
  }

  sizeGalleryImages();
  requestGalleryUpdate();
  window.addEventListener('scroll', requestGalleryUpdate, { passive: true });
  window.addEventListener('resize', () => {
    sizeGalleryImages();
    requestGalleryUpdate();
  }, { passive: true });
  reduceGalleryMotion.addEventListener?.('change', requestGalleryUpdate);
}
