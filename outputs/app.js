const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const googleReviewUrl = 'https://www.google.com/search?q=Timba+XO+Eldoret+Google+reviews';

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

document.querySelectorAll('[data-google-review-link]').forEach((link) => {
  link.href = googleReviewUrl;
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal, .reveal-card, .reveal-mask').forEach((node) => revealObserver.observe(node));

const hero = document.querySelector('[data-hero-slideshow]');
if (hero) {
  const slides = [...hero.querySelectorAll('[data-hero-slide]')];
  const kicker = hero.querySelector('[data-hero-kicker]');
  const title = hero.querySelector('[data-hero-title]');
  const copy = hero.querySelector('[data-hero-copy]');
  const current = hero.querySelector('[data-hero-current]');
  const total = hero.querySelector('[data-hero-total]');
  const dots = hero.querySelector('[data-hero-dots]');
  const progress = hero.querySelector('[data-hero-progress]');
  let active = 0;
  let timer;

  if (total) total.textContent = String(slides.length).padStart(2, '0');
  slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show hero slide ${index + 1}`);
    dot.addEventListener('click', () => showHero(index, true));
    dots?.append(dot);
  });

  const restartProgress = () => {
    if (!progress || reducedMotion) return;
    progress.classList.remove('is-running');
    void progress.offsetWidth;
    progress.classList.add('is-running');
  };

  function showHero(index, userInitiated = false) {
    active = (index + slides.length) % slides.length;
    const slide = slides[active];
    slides.forEach((item, itemIndex) => item.classList.toggle('is-active', itemIndex === active));
    dots?.querySelectorAll('button').forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === active);
      dot.setAttribute('aria-current', dotIndex === active ? 'true' : 'false');
    });
    if (kicker) kicker.innerHTML = `<span></span> ${slide.dataset.kicker || ''}`;
    if (title) title.innerHTML = slide.dataset.title || '';
    if (copy) copy.textContent = slide.dataset.copy || '';
    if (current) current.textContent = String(active + 1).padStart(2, '0');
    restartProgress();
    if (userInitiated && !reducedMotion) {
      clearInterval(timer);
      timer = window.setInterval(() => showHero(active + 1), 6500);
    }
  }

  showHero(0);
  if (!reducedMotion && slides.length > 1) {
    timer = window.setInterval(() => showHero(active + 1), 6500);
    document.addEventListener('visibilitychange', () => {
      clearInterval(timer);
      if (!document.hidden) timer = window.setInterval(() => showHero(active + 1), 6500);
    });
  }
}

document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('[data-carousel-track]');
  const slides = track ? [...track.children] : [];
  const prev = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');
  const dots = carousel.querySelector('[data-carousel-dots]');
  if (!track || slides.length === 0) return;

  carousel.tabIndex = 0;
  let active = 0;
  let startX = 0;
  let pointerDown = false;
  let autoplayTimer;
  const canAutoplay = carousel.hasAttribute('data-carousel-autoplay') && !reducedMotion && slides.length > 1;

  const pauseAutoplay = () => window.clearInterval(autoplayTimer);
  const startAutoplay = () => {
    if (!canAutoplay || document.hidden) return;
    pauseAutoplay();
    autoplayTimer = window.setInterval(() => setCarousel(active + 1), 5200);
  };

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show carousel item ${index + 1}`);
    dot.addEventListener('click', () => setCarousel(index, true));
    dots?.append(dot);
  });

  const getStep = () => {
    const first = slides[0].getBoundingClientRect();
    const styles = window.getComputedStyle(track);
    return first.width + Number.parseFloat(styles.columnGap || styles.gap || 0);
  };

  const setCarousel = (index, userInitiated = false) => {
    active = (index + slides.length) % slides.length;
    const step = getStep();
    const maxOffset = Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
    const offset = Math.min(active * step, maxOffset);
    track.style.transform = `translateX(${-offset}px)`;
    dots?.querySelectorAll('button').forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === active);
      dot.setAttribute('aria-current', dotIndex === active ? 'true' : 'false');
    });
    if (userInitiated) startAutoplay();
  };

  prev?.addEventListener('click', () => setCarousel(active - 1, true));
  next?.addEventListener('click', () => setCarousel(active + 1, true));
  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setCarousel(active - 1, true);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setCarousel(active + 1, true);
    }
  });
  carousel.addEventListener('pointerenter', pauseAutoplay);
  carousel.addEventListener('pointerleave', startAutoplay);
  carousel.addEventListener('focusin', pauseAutoplay);
  carousel.addEventListener('focusout', (event) => {
    if (!carousel.contains(event.relatedTarget)) startAutoplay();
  });
  track.addEventListener('pointerdown', (event) => {
    pointerDown = true;
    startX = event.clientX;
    pauseAutoplay();
  });
  window.addEventListener('pointerup', (event) => {
    if (!pointerDown) return;
    const distance = event.clientX - startX;
    pointerDown = false;
    if (Math.abs(distance) > 45) {
      setCarousel(active + (distance < 0 ? 1 : -1), true);
    } else {
      startAutoplay();
    }
  });
  window.addEventListener('resize', () => setCarousel(active), { passive: true });
  document.addEventListener('visibilitychange', () => {
    pauseAutoplay();
    if (!document.hidden) startAutoplay();
  });
  setCarousel(0);
  startAutoplay();
});

const reviewStage = document.querySelector('[data-reviews]');
if (reviewStage) {
  const reviews = [...reviewStage.querySelectorAll('.review')];
  const count = reviewStage.querySelector('[data-review-count]');
  let active = 0;
  let reviewTimer;
  const canReviewAutoplay = reviewStage.hasAttribute('data-review-autoplay') && !reducedMotion && reviews.length > 1;
  const pauseReviewAutoplay = () => window.clearInterval(reviewTimer);
  const startReviewAutoplay = () => {
    if (!canReviewAutoplay || document.hidden) return;
    pauseReviewAutoplay();
    reviewTimer = window.setInterval(() => showReview(active + 1), 6200);
  };
  const showReview = (index, userInitiated = false) => {
    active = (index + reviews.length) % reviews.length;
    reviews.forEach((review, i) => review.classList.toggle('is-active', i === active));
    if (count) count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(reviews.length).padStart(2, '0')}`;
    if (userInitiated) startReviewAutoplay();
  };
  reviewStage.querySelector('[data-review-prev]')?.addEventListener('click', () => showReview(active - 1, true));
  reviewStage.querySelector('[data-review-next]')?.addEventListener('click', () => showReview(active + 1, true));
  reviewStage.addEventListener('pointerenter', pauseReviewAutoplay);
  reviewStage.addEventListener('pointerleave', startReviewAutoplay);
  reviewStage.addEventListener('focusin', pauseReviewAutoplay);
  reviewStage.addEventListener('focusout', (event) => {
    if (!reviewStage.contains(event.relatedTarget)) startReviewAutoplay();
  });
  document.addEventListener('visibilitychange', () => {
    pauseReviewAutoplay();
    if (!document.hidden) startReviewAutoplay();
  });
  showReview(0);
  startReviewAutoplay();
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
    const requestId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    if (whatsappLink) whatsappLink.href = `https://wa.me/254725919132?text=${encodeURIComponent(enquiry)}`;

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = 'Saving enquiry... <span>&rarr;</span>';
    }
    formNote?.classList.remove('is-error');
    if (formNote) formNote.textContent = 'Saving your enquiry securely...';

    try {
      const response = await fetch(reservationEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
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
        submitButton.innerHTML = 'Save and continue to WhatsApp <span>&rarr;</span>';
      }
    }
  });
  bookingDialog.querySelector('[data-dialog-close]')?.addEventListener('click', () => bookingDialog.close());
}
