const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.textContent = open ? 'Menu' : 'Close';
  nav?.classList.toggle('is-open', !open);
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
  if (menuButton) menuButton.textContent = 'Menu';
}));

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));

const reviewStage = document.querySelector('[data-reviews]');
if (reviewStage) {
  const reviews = [...reviewStage.querySelectorAll('.review')];
  const count = reviewStage.querySelector('[data-review-count]');
  let active = 0;
  const showReview = (index) => {
    active = (index + reviews.length) % reviews.length;
    reviews.forEach((review, i) => review.classList.toggle('is-active', i === active));
    if (count) count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(reviews.length).padStart(2, '0')}`;
  };
  reviewStage.querySelector('[data-review-prev]')?.addEventListener('click', () => showReview(active - 1));
  reviewStage.querySelector('[data-review-next]')?.addEventListener('click', () => showReview(active + 1));
}

const lightbox = document.querySelector('[data-lightbox-dialog]');
if (lightbox) {
  const lightboxImage = lightbox.querySelector('[data-lightbox-image]');
  const lightboxLabel = lightbox.querySelector('[data-lightbox-label]');
  const lightboxTitle = lightbox.querySelector('[data-lightbox-title]');
  document.querySelectorAll('[data-lightbox]').forEach((figure) => {
    figure.querySelector('button')?.addEventListener('click', () => {
      const image = figure.querySelector('img');
      if (!image) return;
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      lightboxLabel.textContent = figure.querySelector('figcaption span')?.textContent || '';
      lightboxTitle.textContent = figure.querySelector('figcaption h2')?.textContent || '';
      lightbox.showModal();
    });
  });
  lightbox.querySelector('[data-lightbox-close]')?.addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });
}

const bookingForm = document.querySelector('[data-booking-form]');
const bookingDialog = document.querySelector('[data-booking-dialog]');
if (bookingForm && bookingDialog) {
  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(bookingForm);
    const summary = bookingDialog.querySelector('[data-booking-summary]');
    summary.textContent = `${data.get('name')} is planning ${String(data.get('plan')).toLowerCase()} for ${String(data.get('guests')).toLowerCase()}. Contact: ${data.get('phone')}.${data.get('notes') ? `\n\nNotes: ${data.get('notes')}` : ''}`;
    bookingDialog.showModal();
  });
  bookingDialog.querySelector('[data-dialog-close]')?.addEventListener('click', () => bookingDialog.close());
}
