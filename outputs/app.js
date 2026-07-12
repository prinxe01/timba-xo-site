const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const googleReviewUrl = 'https://www.google.com/search?q=Timba+XO+Eldoret+Google+reviews';
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const gsapCore = window.gsap;
const scrollTriggerPlugin = window.ScrollTrigger;

if (gsapCore && scrollTriggerPlugin) {
  gsapCore.registerPlugin(scrollTriggerPlugin);
}

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

const getSessionFlag = (key) => {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const setSessionFlag = (key, value) => {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Browsers can block storage in private modes; the animation can still run safely.
  }
};

const runTxoIntro = () => {
  if (!gsapCore || reducedMotion || getSessionFlag('txoIntroPlayed') === 'true') return;
  setSessionFlag('txoIntroPlayed', 'true');

  const intro = document.createElement('div');
  intro.className = 'txo-intro';
  intro.setAttribute('aria-hidden', 'true');
  intro.innerHTML = `
    <div class="txo-intro__inner">
      <div class="txo-intro__mark"><span>TIMBA</span><b>XO</b></div>
      <div class="txo-intro__line"></div>
      <div class="txo-intro__tag">Eldoret after dark</div>
    </div>
  `;
  document.body.append(intro);
  document.body.classList.add('is-intro-running');

  const mark = intro.querySelectorAll('.txo-intro__mark span, .txo-intro__mark b');
  const line = intro.querySelector('.txo-intro__line');
  const tag = intro.querySelector('.txo-intro__tag');

  gsapCore.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      document.body.classList.remove('is-intro-running');
      intro.remove();
    },
  })
    .set(intro, { autoAlpha: 1 })
    .from(mark, { yPercent: 120, duration: 0.82, stagger: 0.08 })
    .from(line, { scaleX: 0, duration: 0.62, transformOrigin: 'left center' }, '-=0.32')
    .from(tag, { autoAlpha: 0, y: 14, duration: 0.52 }, '-=0.28')
    .to(intro, { autoAlpha: 0, duration: 0.72, ease: 'power2.inOut' }, '+=0.45');
};

const setupPageTransitions = () => {
  if (!gsapCore || reducedMotion) return;

  const transition = document.createElement('div');
  transition.className = 'page-transition';
  transition.setAttribute('aria-hidden', 'true');
  transition.innerHTML = `
    <div class="page-transition__inner">
      <div class="page-transition__mark"><span>TIMBA XO</span></div>
      <div class="page-transition__line"></div>
      <div class="page-transition__tag">Loading the next scene</div>
    </div>
  `;
  document.body.append(transition);

  const isModifiedClick = (event) => event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || isModifiedClick(event) || link.target || link.hasAttribute('download')) return;

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.hash) return;
    if (url.href === window.location.href) return;

    event.preventDefault();
    gsapCore.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        window.location.href = url.href;
      },
    })
      .set(transition, { autoAlpha: 1, pointerEvents: 'auto' })
      .fromTo(transition.querySelector('.page-transition__line'), { scaleX: 0 }, { scaleX: 1, duration: 0.42, transformOrigin: 'left center' }, 0)
      .fromTo(transition.querySelector('.page-transition__mark span'), { yPercent: 112 }, { yPercent: 0, duration: 0.52 }, 0.04)
      .fromTo(transition.querySelector('.page-transition__tag'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.36 }, 0.14);
  });
};

runTxoIntro();
setupPageTransitions();

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

const featureVideo = document.querySelector('[data-feature-video]');
if (featureVideo) {
  let programmaticVideoPause = false;

  const pauseFeatureVideo = () => {
    programmaticVideoPause = true;
    featureVideo.pause();
    window.requestAnimationFrame(() => {
      programmaticVideoPause = false;
    });
  };

  const playFeatureVideo = () => {
    if (reducedMotion || featureVideo.dataset.userPaused === 'true') return;
    featureVideo.muted = true;
    featureVideo.play().catch(() => {
      // Autoplay can be blocked by browser policy; controls remain available.
    });
  };

  featureVideo.addEventListener('pause', () => {
    if (!programmaticVideoPause && !featureVideo.ended) featureVideo.dataset.userPaused = 'true';
  });
  featureVideo.addEventListener('play', () => {
    delete featureVideo.dataset.userPaused;
  });

  if ('IntersectionObserver' in window && !reducedMotion) {
    const videoObserver = new IntersectionObserver((entries) => {
      const visible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.55);
      if (visible) playFeatureVideo();
      else pauseFeatureVideo();
    }, { threshold: [0, 0.55, 0.8] });
    videoObserver.observe(featureVideo);
    window.addEventListener('pagehide', () => {
      pauseFeatureVideo();
      videoObserver.disconnect();
    });
  }
}

if (gsapCore && scrollTriggerPlugin && !reducedMotion) {
  const motionMedia = gsapCore.matchMedia();

  motionMedia.add('(min-width: 760px)', () => {
    const videoFrame = document.querySelector('.video-feature__frame');
    const videoSection = videoFrame?.closest('.video-feature');
    if (videoFrame && videoSection) {
      gsapCore.fromTo(videoFrame,
        { scale: 0.94, y: 34 },
        {
          scale: 1.045,
          y: -26,
          ease: 'none',
          scrollTrigger: {
            trigger: videoSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
    }

    const gallery = document.querySelector('[data-gallery]');
    const galleryItems = gallery ? [...gallery.querySelectorAll('.gallery-item')] : [];
    if (galleryItems.length > 0) {
      gsapCore.set(galleryItems, { willChange: 'transform' });
      gsapCore.fromTo(galleryItems,
        {
          x: (index) => (index % 2 === 0 ? -34 : 34),
          y: (index) => (index % 2 === 0 ? 58 : -58),
        },
        {
          x: (index) => (index % 2 === 0 ? 28 : -28),
          y: (index) => (index % 2 === 0 ? -42 : 42),
          ease: 'none',
          scrollTrigger: {
            trigger: gallery,
            start: 'top 88%',
            end: 'bottom 20%',
            scrub: 1,
          },
        });
    }

    return () => {
      if (videoFrame) gsapCore.set(videoFrame, { clearProps: 'transform' });
      if (galleryItems.length > 0) gsapCore.set(galleryItems, { clearProps: 'transform,willChange' });
    };
  });

  window.addEventListener('load', () => {
    scrollTriggerPlugin.refresh();
  });
}

const getAutoplayDelay = (node, fallback) => {
  const value = Number.parseInt(node.dataset.autoplayMs || '', 10);
  return Number.isFinite(value) && value >= 1000 ? value : fallback;
};

document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('[data-carousel-track]');
  const slides = track ? [...track.children] : [];
  const prev = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');
  const dots = carousel.querySelector('[data-carousel-dots]');
  const viewport = carousel.querySelector('.carousel-viewport') || track?.parentElement;
  if (!track || !viewport || slides.length === 0) return;

  if (!carousel.hasAttribute('tabindex')) carousel.tabIndex = 0;
  if (!carousel.hasAttribute('role')) carousel.setAttribute('role', 'region');
  if (!carousel.hasAttribute('aria-label')) carousel.setAttribute('aria-label', 'Image carousel');

  let active = 0;
  let startX = 0;
  let pointerDown = false;
  let autoplayTimer = 0;
  let transitionTimer = 0;
  let resizeTimer = 0;
  let isVisible = false;
  let isHoverPaused = false;
  let isFocusPaused = false;
  let isTransitioning = false;
  const canAutoplay = carousel.hasAttribute('data-carousel-autoplay') && !reducedMotion && slides.length > 1;
  const autoplayDelay = getAutoplayDelay(carousel, 2200);
  const transitionMs = reducedMotion ? 0 : 620;

  const stopAutoplay = () => {
    window.clearTimeout(autoplayTimer);
    autoplayTimer = 0;
  };

  const shouldAutoplay = () => (
    canAutoplay
    && isVisible
    && !isHoverPaused
    && !isFocusPaused
    && !pointerDown
    && !document.hidden
  );

  const scheduleAutoplay = () => {
    stopAutoplay();
    if (!shouldAutoplay()) return;
    autoplayTimer = window.setTimeout(() => {
      if (!shouldAutoplay()) return;
      setCarousel(active + 1, { source: 'autoplay' });
      scheduleAutoplay();
    }, autoplayDelay);
  };

  dots?.replaceChildren();
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show carousel item ${index + 1}`);
    dot.addEventListener('click', () => setCarousel(index, { source: 'manual', force: true }));
    dots?.append(dot);
  });

  const getMaxOffset = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

  const getOffsetForIndex = (index) => {
    const slide = slides[index];
    if (!slide || !viewport) return 0;
    return clamp(slide.offsetLeft, 0, getMaxOffset());
  };

  const setCarousel = (index, options = {}) => {
    const { source = 'system', force = false, immediate = false } = options;
    if (isTransitioning && !force && !immediate) return;

    active = (index + slides.length) % slides.length;
    const offset = getOffsetForIndex(active);
    track.style.transform = `translateX(${-offset}px)`;
    slides.forEach((slide, slideIndex) => {
      slide.setAttribute('aria-hidden', slideIndex === active ? 'false' : 'true');
    });
    dots?.querySelectorAll('button').forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === active);
      dot.setAttribute('aria-current', dotIndex === active ? 'true' : 'false');
    });

    window.clearTimeout(transitionTimer);
    if (!immediate && transitionMs > 0) {
      isTransitioning = true;
      transitionTimer = window.setTimeout(() => {
        isTransitioning = false;
      }, transitionMs);
    } else {
      isTransitioning = false;
    }

    if (source === 'manual') scheduleAutoplay();
  };

  prev?.addEventListener('click', () => setCarousel(active - 1, { source: 'manual', force: true }));
  next?.addEventListener('click', () => setCarousel(active + 1, { source: 'manual', force: true }));
  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setCarousel(active - 1, { source: 'manual', force: true });
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setCarousel(active + 1, { source: 'manual', force: true });
    }
  });

  carousel.addEventListener('pointerenter', () => {
    isHoverPaused = true;
    stopAutoplay();
  });
  carousel.addEventListener('pointerleave', () => {
    isHoverPaused = false;
    scheduleAutoplay();
  });
  carousel.addEventListener('focusin', () => {
    isFocusPaused = true;
    stopAutoplay();
  });
  carousel.addEventListener('focusout', (event) => {
    if (carousel.contains(event.relatedTarget)) return;
    isFocusPaused = false;
    scheduleAutoplay();
  });

  track.addEventListener('pointerdown', (event) => {
    pointerDown = true;
    startX = event.clientX;
    stopAutoplay();
  });

  const finishPointer = (event) => {
    if (!pointerDown) return;
    const distance = event.clientX - startX;
    pointerDown = false;
    if (Math.abs(distance) > 45) {
      setCarousel(active + (distance < 0 ? 1 : -1), { source: 'manual', force: true });
    } else {
      scheduleAutoplay();
    }
  };

  window.addEventListener('pointerup', finishPointer);
  window.addEventListener('pointercancel', finishPointer);
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => setCarousel(active, { immediate: true, force: true }), 120);
  }, { passive: true });
  window.addEventListener('orientationchange', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => setCarousel(active, { immediate: true, force: true }), 180);
  });
  slides.forEach((slide) => {
    slide.querySelector('img')?.addEventListener('load', () => setCarousel(active, { immediate: true, force: true }), { once: true });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      scheduleAutoplay();
    }
  });

  let carouselObserver;
  if (canAutoplay && 'IntersectionObserver' in window) {
    carouselObserver = new IntersectionObserver((entries) => {
      isVisible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.35);
      if (isVisible) scheduleAutoplay();
      else stopAutoplay();
    }, { threshold: [0, 0.35, 0.7] });
    carouselObserver.observe(carousel);
  } else if (canAutoplay) {
    isVisible = true;
    scheduleAutoplay();
  }

  window.addEventListener('pagehide', () => {
    stopAutoplay();
    window.clearTimeout(transitionTimer);
    window.clearTimeout(resizeTimer);
    carouselObserver?.disconnect();
  });

  setCarousel(0, { immediate: true, force: true });
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
  let reviewTimer = 0;
  let reviewTransitionTimer = 0;
  let isReviewVisible = false;
  let isReviewHoverPaused = false;
  let isReviewFocusPaused = false;
  let isReviewTransitioning = false;
  const canReviewAutoplay = reviewStage.hasAttribute('data-review-autoplay') && !reducedMotion && reviews.length > 1;
  const reviewAutoplayDelay = getAutoplayDelay(reviewStage, 6200);
  const reviewTransitionMs = reducedMotion ? 0 : 540;

  if (!reviewStage.hasAttribute('tabindex')) reviewStage.tabIndex = 0;
  if (!reviewStage.hasAttribute('role')) reviewStage.setAttribute('role', 'region');
  if (!reviewStage.hasAttribute('aria-label')) reviewStage.setAttribute('aria-label', 'Guest reviews');

  const stopReviewAutoplay = () => {
    window.clearTimeout(reviewTimer);
    reviewTimer = 0;
  };

  const shouldReviewAutoplay = () => (
    canReviewAutoplay
    && isReviewVisible
    && !isReviewHoverPaused
    && !isReviewFocusPaused
    && !document.hidden
  );

  const scheduleReviewAutoplay = () => {
    stopReviewAutoplay();
    if (!shouldReviewAutoplay()) return;
    reviewTimer = window.setTimeout(() => {
      if (!shouldReviewAutoplay()) return;
      showReview(active + 1, { source: 'autoplay' });
      scheduleReviewAutoplay();
    }, reviewAutoplayDelay);
  };

  const showReview = (index, options = {}) => {
    const { source = 'system', force = false, immediate = false } = options;
    if (isReviewTransitioning && !force && !immediate) return;

    active = (index + reviews.length) % reviews.length;
    reviews.forEach((review, i) => {
      review.classList.toggle('is-active', i === active);
      review.setAttribute('aria-hidden', i === active ? 'false' : 'true');
    });
    if (count) count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(reviews.length).padStart(2, '0')}`;

    window.clearTimeout(reviewTransitionTimer);
    if (!immediate && reviewTransitionMs > 0) {
      isReviewTransitioning = true;
      reviewTransitionTimer = window.setTimeout(() => {
        isReviewTransitioning = false;
      }, reviewTransitionMs);
    } else {
      isReviewTransitioning = false;
    }

    if (source === 'manual') scheduleReviewAutoplay();
  };

  reviewStage.querySelector('[data-review-prev]')?.addEventListener('click', () => showReview(active - 1, { source: 'manual', force: true }));
  reviewStage.querySelector('[data-review-next]')?.addEventListener('click', () => showReview(active + 1, { source: 'manual', force: true }));
  reviewStage.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showReview(active - 1, { source: 'manual', force: true });
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showReview(active + 1, { source: 'manual', force: true });
    }
  });
  reviewStage.addEventListener('pointerenter', () => {
    isReviewHoverPaused = true;
    stopReviewAutoplay();
  });
  reviewStage.addEventListener('pointerleave', () => {
    isReviewHoverPaused = false;
    scheduleReviewAutoplay();
  });
  reviewStage.addEventListener('focusin', () => {
    isReviewFocusPaused = true;
    stopReviewAutoplay();
  });
  reviewStage.addEventListener('focusout', (event) => {
    if (reviewStage.contains(event.relatedTarget)) return;
    isReviewFocusPaused = false;
    scheduleReviewAutoplay();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopReviewAutoplay();
    } else {
      scheduleReviewAutoplay();
    }
  });

  let reviewObserver;
  if (canReviewAutoplay && 'IntersectionObserver' in window) {
    reviewObserver = new IntersectionObserver((entries) => {
      isReviewVisible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.35);
      if (isReviewVisible) scheduleReviewAutoplay();
      else stopReviewAutoplay();
    }, { threshold: [0, 0.35, 0.7] });
    reviewObserver.observe(reviewStage);
  } else if (canReviewAutoplay) {
    isReviewVisible = true;
    scheduleReviewAutoplay();
  }

  window.addEventListener('pagehide', () => {
    stopReviewAutoplay();
    window.clearTimeout(reviewTransitionTimer);
    reviewObserver?.disconnect();
  });

  showReview(0, { immediate: true, force: true });
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
