// Image zoom/lightbox functionality for markdown images
document.addEventListener('DOMContentLoaded', () => {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'image-zoom-overlay';
  overlay.innerHTML = `
    <div class="zoom-container">
      <img src="" alt="" class="zoom-image">
      <button class="zoom-close" aria-label="Close">&times;</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const zoomImage = overlay.querySelector('.zoom-image') as HTMLImageElement;
  const closeBtn = overlay.querySelector('.zoom-close') as HTMLButtonElement;

  // Close modal function
  const closeModal = () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Close on button click
  closeBtn.addEventListener('click', closeModal);

  // Close on overlay click (not on image)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeModal();
    }
  });

  // Add click handlers to all markdown images
  const addZoomHandlers = () => {
    const images = document.querySelectorAll('.markdown-img-zoomable');
    images.forEach((img) => {
      img.addEventListener('click', function(this: HTMLImageElement) {
        zoomImage.src = this.src;
        zoomImage.alt = this.alt;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });
  };

  addZoomHandlers();

  // Re-run on view transitions
  document.addEventListener('astro:page-load', addZoomHandlers);
});
