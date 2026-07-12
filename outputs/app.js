const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const googleReviewUrl = 'https://www.google.com/search?q=Timba+XO+Eldoret+Google+reviews';
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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

if (finePointer && !reducedMotion) {
  const headerLogo = document.querySelector('.site-header .logo');
  if (headerLogo) {
    headerLogo.addEventListener('pointermove', (event) => {
      const rect = headerLogo.getBoundingClientRect();
      const relX = clamp((event.clientX - rect.left - rect.width / 2) / (rect.width / 2), -1, 1);
      const relY = clamp((event.clientY - rect.top - rect.height / 2) / (rect.height / 2), -1, 1);
      headerLogo.classList.add('is-magnetic');
      headerLogo.style.setProperty('--logo-x', `${(relX * 12).toFixed(2)}px`);
      headerLogo.style.setProperty('--logo-y', `${(relY * 8).toFixed(2)}px`);
      headerLogo.style.setProperty('--logo-rotate', `${(relX * 1.5).toFixed(2)}deg`);
      headerLogo.style.setProperty('--logo-depth-x', `${(relX * 4).toFixed(2)}px`);
      headerLogo.style.setProperty('--logo-depth-y', `${(relY * 3).toFixed(2)}px`);
    });

    headerLogo.addEventListener('pointerleave', () => {
      headerLogo.classList.remove('is-magnetic');
      headerLogo.style.setProperty('--logo-x', '0px');
      headerLogo.style.setProperty('--logo-y', '0px');
      headerLogo.style.setProperty('--logo-rotate', '0deg');
      headerLogo.style.setProperty('--logo-depth-x', '0px');
      headerLogo.style.setProperty('--logo-depth-y', '0px');
    });
  }

  const circleLink = document.querySelector('.home-hero .circle-link');
  if (circleLink) {
    circleLink.addEventListener('pointermove', (event) => {
      const rect = circleLink.getBoundingClientRect();
      const relX = clamp((event.clientX - rect.left - rect.width / 2) / (rect.width / 2), -1, 1);
      const relY = clamp((event.clientY - rect.top - rect.height / 2) / (rect.height / 2), -1, 1);
      circleLink.classList.add('is-magnetic');
      circleLink.style.setProperty('--circle-x', `${(relX * 9).toFixed(2)}px`);
      circleLink.style.setProperty('--circle-y', `${(relY * 9).toFixed(2)}px`);
      circleLink.style.setProperty('--circle-rotate', `${(relX * 3).toFixed(2)}deg`);
      circleLink.style.setProperty('--circle-text-x', `${(relX * 3).toFixed(2)}px`);
      circleLink.style.setProperty('--circle-text-y', `${(relY * 3).toFixed(2)}px`);
      circleLink.style.setProperty('--circle-arrow-y', '4px');
    });

    circleLink.addEventListener('pointerleave', () => {
      circleLink.classList.remove('is-magnetic');
      circleLink.style.setProperty('--circle-x', '0px');
      circleLink.style.setProperty('--circle-y', '0px');
      circleLink.style.setProperty('--circle-rotate', '0deg');
      circleLink.style.setProperty('--circle-text-x', '0px');
      circleLink.style.setProperty('--circle-text-y', '0px');
      circleLink.style.setProperty('--circle-arrow-y', '0px');
    });
  }
}

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
  let heroTextReady = false;
  let heroTextToken = 0;
  let heroTextTimeout;
  let heroTextFrame;

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

  const buildHeroTitle = (html) => String(html || '')
    .split(/<br\s*\/?>/i)
    .map((line) => {
      const accent = line.includes('<em>');
      return `<span class="hero-title-line${accent ? ' hero-title-line--accent' : ''}"><span>${line}</span></span>`;
    })
    .join('');

  const renderHeroText = (slide) => {
    if (kicker) kicker.innerHTML = `<span></span> ${slide.dataset.kicker || ''}`;
    if (title) title.innerHTML = buildHeroTitle(slide.dataset.title || '');
    if (copy) copy.textContent = slide.dataset.copy || '';
    if (current) current.textContent = String(active + 1).padStart(2, '0');
  };

  const updateHeroText = (slide, immediate = false) => {
    heroTextToken += 1;
    const token = heroTextToken;
    window.clearTimeout(heroTextTimeout);
    window.cancelAnimationFrame(heroTextFrame);
    hero.classList.remove('is-hero-text-entering', 'is-hero-text-exiting');

    if (immediate || reducedMotion) {
      renderHeroText(slide);
      return;
    }

    hero.classList.add('is-hero-text-exiting');
    heroTextTimeout = window.setTimeout(() => {
      if (token !== heroTextToken) return;
      hero.classList.remove('is-hero-text-exiting');
      hero.classList.add('is-hero-text-entering');
      renderHeroText(slide);
      heroTextFrame = window.requestAnimationFrame(() => {
        heroTextFrame = window.requestAnimationFrame(() => {
          if (token !== heroTextToken) return;
          hero.classList.remove('is-hero-text-entering');
        });
      });
    }, 320);
  };

  function showHero(index, userInitiated = false) {
    active = (index + slides.length) % slides.length;
    const slide = slides[active];
    slides.forEach((item, itemIndex) => item.classList.toggle('is-active', itemIndex === active));
    dots?.querySelectorAll('button').forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === active);
      dot.setAttribute('aria-current', dotIndex === active ? 'true' : 'false');
    });
    updateHeroText(slide, !heroTextReady);
    heroTextReady = true;
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

const statCards = [...document.querySelectorAll('[data-stat-card]')];
if (statCards.length > 0) {
  const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
  const setFinalStat = (valueNode) => {
    const finalValue = valueNode.dataset.statFinal || valueNode.textContent;
    if (valueNode.dataset.statType === 'reveal') {
      const span = valueNode.querySelector('span');
      if (span) span.textContent = finalValue;
    } else {
      valueNode.textContent = finalValue;
    }
  };

  const animateStat = (card) => {
    if (card.dataset.statAnimated === 'true') return;
    card.dataset.statAnimated = 'true';
    const valueNode = card.querySelector('[data-stat-value]');
    if (!valueNode) return;

    if (reducedMotion) {
      setFinalStat(valueNode);
      card.classList.add('has-counted');
      return;
    }

    const type = valueNode.dataset.statType;
    const target = Number.parseFloat(valueNode.dataset.statTarget || '0');
    const duration = 1400;
    let startTime;
    card.classList.add('is-counting');

    if (type === 'reveal') {
      window.setTimeout(() => {
        setFinalStat(valueNode);
        card.classList.remove('is-counting');
        card.classList.add('has-counted');
      }, duration);
      return;
    }

    const tick = (time) => {
      if (!startTime) startTime = time;
      const progress = clamp((time - startTime) / duration, 0, 1);
      const eased = easeOutCubic(progress);

      if (type === 'decimal') {
        valueNode.textContent = (target * eased).toFixed(1);
      } else if (type === 'compact') {
        valueNode.textContent = `${Math.round(target * eased)}K+`;
      } else {
        valueNode.textContent = Math.round(target * eased).toLocaleString('en-US');
      }

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      } else {
        setFinalStat(valueNode);
        card.classList.remove('is-counting');
        card.classList.add('has-counted');
      }
    };

    window.requestAnimationFrame(tick);
  };

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      statCards.forEach(animateStat);
      statObserver.disconnect();
    });
  }, { threshold: 0.35 });

  statObserver.observe(statCards[0].closest('[data-stat-grid]') || statCards[0]);
}

const terrain = document.querySelector('.manifesto-terrain');
if (terrain) {
  const canvas = terrain.querySelector('[data-terrain-canvas]');
  const context = canvas?.getContext?.('2d');

  if (canvas && context) {
    let width = 0;
    let height = 0;
    let animationFrame;
    let visible = false;
    let running = false;
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let cameraX = 0;
    let cameraY = 0;
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    const rows = isMobile ? 18 : 26;
    const cols = isMobile ? 30 : 46;

    const resizeTerrain = () => {
      const rect = terrain.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawTerrain = (time = 0) => {
      context.clearRect(0, 0, width, height);
      const horizon = height * 0.14;
      const timeScale = reducedMotion ? 1200 : time * 0.00045;
      cameraX += (pointerTargetX - cameraX) * 0.045;
      cameraY += (pointerTargetY - cameraY) * 0.045;

      const projectPoint = (col, row) => {
        const depth = row / rows;
        const spread = 0.28 + depth * 1.42;
        const xBase = (col / cols - 0.5) * width * spread;
        const waveA = Math.sin(col * 0.42 + row * 0.38 + timeScale);
        const waveB = Math.cos(col * 0.18 - timeScale * 1.6) * 0.55;
        const yBase = horizon + Math.pow(depth, 1.72) * height * 0.98;
        const wave = (waveA + waveB) * (8 + depth * 23);
        return {
          x: width / 2 + xBase + cameraX * width * 0.035 * depth,
          y: yBase + wave + cameraY * height * 0.025 * depth,
          depth,
          peak: waveA,
        };
      };

      const fog = context.createLinearGradient(0, 0, 0, height);
      fog.addColorStop(0, 'rgba(8,10,12,0.92)');
      fog.addColorStop(0.36, 'rgba(8,10,12,0.08)');
      fog.addColorStop(1, 'rgba(8,10,12,0.88)');
      context.fillStyle = fog;
      context.fillRect(0, 0, width, height);

      for (let row = 0; row <= rows; row += 1) {
        context.beginPath();
        for (let col = 0; col <= cols; col += 1) {
          const point = projectPoint(col, row);
          if (col === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        }
        const depth = row / rows;
        context.strokeStyle = `rgba(87, 217, 255, ${0.04 + depth * 0.2})`;
        context.lineWidth = 0.65 + depth * 0.35;
        context.stroke();
      }

      for (let col = 0; col <= cols; col += 3) {
        context.beginPath();
        for (let row = 0; row <= rows; row += 1) {
          const point = projectPoint(col, row);
          if (row === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        }
        context.strokeStyle = 'rgba(87, 217, 255, 0.08)';
        context.lineWidth = 0.7;
        context.stroke();
      }

      for (let row = 5; row <= rows; row += 5) {
        for (let col = 2; col < cols; col += 9) {
          const point = projectPoint(col, row);
          if (point.peak < 0.72) continue;
          const glow = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, 38);
          glow.addColorStop(0, 'rgba(255, 91, 39, 0.34)');
          glow.addColorStop(1, 'rgba(255, 91, 39, 0)');
          context.fillStyle = glow;
          context.fillRect(point.x - 40, point.y - 40, 80, 80);
          context.beginPath();
          context.moveTo(point.x - 24, point.y);
          context.lineTo(point.x + 24, point.y + Math.sin(timeScale + col) * 4);
          context.strokeStyle = 'rgba(255, 91, 39, 0.48)';
          context.lineWidth = 1.2;
          context.stroke();
        }
      }
    };

    const stopTerrain = () => {
      running = false;
      window.cancelAnimationFrame(animationFrame);
    };

    const animateTerrain = (time) => {
      drawTerrain(time);
      if (running && !reducedMotion) animationFrame = window.requestAnimationFrame(animateTerrain);
    };

    const startTerrain = () => {
      if (running || document.hidden || !visible) return;
      running = true;
      animationFrame = window.requestAnimationFrame(animateTerrain);
    };

    resizeTerrain();
    drawTerrain(0);
    const resizeObserver = new ResizeObserver(() => {
      resizeTerrain();
      drawTerrain(0);
    });
    resizeObserver.observe(terrain);

    const terrainObserver = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) startTerrain();
      else stopTerrain();
    }, { threshold: 0.08 });
    terrainObserver.observe(terrain);

    if (finePointer && !reducedMotion) {
      terrain.closest('.manifesto')?.addEventListener('pointermove', (event) => {
        const rect = terrain.getBoundingClientRect();
        pointerTargetX = clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5) * 0.22;
        pointerTargetY = clamp((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5) * 0.16;
      });
      terrain.closest('.manifesto')?.addEventListener('pointerleave', () => {
        pointerTargetX = 0;
        pointerTargetY = 0;
      });
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopTerrain();
      else startTerrain();
    });

    window.addEventListener('pagehide', () => {
      stopTerrain();
      resizeObserver.disconnect();
      terrainObserver.disconnect();
    });
  }
}

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
