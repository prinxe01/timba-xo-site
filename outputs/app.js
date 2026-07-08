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
const reservationEndpoint = 'https://iliokwwipkcoytjdryty.supabase.co/functions/v1/reservation-enquiry';
if (bookingForm && bookingDialog) {
  bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(bookingForm);
    const summary = bookingDialog.querySelector('[data-booking-summary]');
    const whatsappLink = bookingDialog.querySelector('[data-booking-whatsapp]');
    const submitButton = bookingForm.querySelector('[data-booking-submit]');
    const formNote = bookingForm.querySelector('[data-booking-note]');
    const enquiry = `Hello Timba XO, my name is ${data.get('name')}. I'd like to arrange ${String(data.get('plan')).toLowerCase()} for ${String(data.get('guests')).toLowerCase()}. My phone number is ${data.get('phone')}.${data.get('notes') ? ` Notes: ${data.get('notes')}` : ''}`;
    const baseSummary = `${data.get('name')} is planning ${String(data.get('plan')).toLowerCase()} for ${String(data.get('guests')).toLowerCase()}. Contact: ${data.get('phone')}.${data.get('notes') ? `\n\nNotes: ${data.get('notes')}` : ''}`;
    if (whatsappLink) whatsappLink.href = `https://wa.me/254725919132?text=${encodeURIComponent(enquiry)}`;

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = 'Saving enquiry… <span>↗</span>';
    }
    formNote?.classList.remove('is-error');
    if (formNote) formNote.textContent = 'Saving your enquiry securely…';

    try {
      const response = await fetch(reservationEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: crypto.randomUUID(),
          name: data.get('name'),
          phone: data.get('phone'),
          guests: data.get('guests'),
          plan: data.get('plan'),
          notes: data.get('notes'),
          website: data.get('website'),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'The enquiry could not be saved.');

      const reference = result.id ? String(result.id).slice(0, 8).toUpperCase() : 'SAVED';
      summary.textContent = `${baseSummary}\n\nSaved reference: ${reference}`;
      if (formNote) formNote.textContent = 'Enquiry saved. Continue to WhatsApp to speak with the team.';
      bookingDialog.showModal();
    } catch (error) {
      summary.textContent = `${baseSummary}\n\nDatabase status: not saved.`;
      formNote?.classList.add('is-error');
      if (formNote) formNote.textContent = 'We could not save the enquiry, but you can still continue on WhatsApp.';
      bookingDialog.showModal();
      console.error(error);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Save and continue to WhatsApp <span>↗</span>';
      }
    }
  });
  bookingDialog.querySelector('[data-dialog-close]')?.addEventListener('click', () => bookingDialog.close());
}
