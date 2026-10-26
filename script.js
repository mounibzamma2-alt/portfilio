/* =========================================================
   MIRA VOSS — PORTFOLIO INTERACTIONS
   Vanilla JS. No dependencies.
   ========================================================= */

(() => {
  'use strict';

  const body = document.body;
  const html = document.documentElement;
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Helpers ---------- */

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
  const padNumber = (value, length, character = '0') => String(value).padStart(length, character);

  /* ---------- Preloader ---------- */

  const preloader = $('#preloader');
  const loadBar = $('#load-bar');
  const loadCount = $('#load-count');
  let preloaderFinished = false;

  const finishPreloader = () => {
    if (preloaderFinished) return;
    preloaderFinished = true;

    if (loadBar) loadBar.style.width = '100%';
    if (loadCount) loadCount.textContent = '100';

    window.setTimeout(() => {
      body.classList.remove('is-loading');
      body.classList.add('is-ready');

      if (preloader) {
        preloader.classList.add('is-complete');
        window.setTimeout(() => {
          preloader.classList.add('is-hidden');
          preloader.setAttribute('aria-hidden', 'true');
        }, 1000);
      }
    }, 120);
  };

  if (prefersReducedMotion || !preloader) {
    finishPreloader();
  } else {
    const duration = 1150;
    const start = performance.now();

    const updatePreloader = (now) => {
      const progress = clamp((now - start) / duration, 0, 1);
      const eased = easeOutCubic(progress);
      const percentage = Math.round(eased * 100);

      if (loadBar) loadBar.style.width = `${percentage}%`;
      if (loadCount) loadCount.textContent = padNumber(percentage, 2);

      if (progress < 1) {
        requestAnimationFrame(updatePreloader);
      } else {
        finishPreloader();
      }
    };

    requestAnimationFrame(updatePreloader);
    window.setTimeout(finishPreloader, 4200);
  }

  /* ---------- Current year ---------- */

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header scroll state + scroll progress ---------- */

  const header = $('#site-header');
  const progressBar = $('#scroll-progress-bar');
  let scrollTicking = false;

  const updateScrollUI = () => {
    const scrollTop = window.scrollY || window.pageYOffset;
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = clamp(scrollTop / scrollable, 0, 1);

    if (header) header.classList.toggle('is-scrolled', scrollTop > 12);
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;

    scrollTicking = false;
  };

  const requestScrollUpdate = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(updateScrollUI);
  };

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  updateScrollUI();

  /* ---------- Mobile menu ---------- */

  const menu = $('#mobile-menu');
  const menuToggle = $('#menu-toggle');
  const mobileLinks = $$('[data-mobile-link]');
  let menuOpen = false;

  const menuFocusable = () => [
    menuToggle,
    ...$$('a, button', menu || document.createElement('div')),
  ].filter(Boolean);

  const setMenu = (open) => {
    menuOpen = open;

    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    if (menu) {
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', String(!open));
    }

    body.classList.toggle('menu-open', open);

    if (open) {
      window.setTimeout(() => {
        const firstLink = menu ? $('a', menu) : null;
        if (firstLink) firstLink.focus({ preventScroll: true });
      }, 350);
    }
  };

  if (menuToggle && menu) {
    menuToggle.addEventListener('click', () => setMenu(!menuOpen));

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('keydown', (event) => {
      if (!menuOpen) return;

      if (event.key === 'Escape') {
        setMenu(false);
        menuToggle.focus({ preventScroll: true });
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = menuFocusable();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1100 && menuOpen) setMenu(false);
    });
  }

  /* ---------- Custom cursor ---------- */

  const cursorDot = $('.cursor-dot');
  const cursorRing = $('.cursor-ring');

  if (cursorDot && cursorRing && finePointer && !prefersReducedMotion) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let cursorVisible = false;
    let cursorFrame = null;

    body.classList.add('has-cursor');

    const renderCursor = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;

      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

      if (Math.abs(mouseX - ringX) > 0.1 || Math.abs(mouseY - ringY) > 0.1) {
        cursorFrame = requestAnimationFrame(renderCursor);
      } else {
        cursorFrame = null;
      }
    };

    const wakeCursor = () => {
      if (!cursorVisible) {
        cursorVisible = true;
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
      }

      if (!cursorFrame) cursorFrame = requestAnimationFrame(renderCursor);
    };

    document.addEventListener('pointermove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      wakeCursor();
    }, { passive: true });

    document.addEventListener('pointerover', (event) => {
      const target = event.target.closest('a, button, input, textarea, select, .project-visual, [data-project]');
      if (target) cursorRing.classList.add('is-hover');
    });

    document.addEventListener('pointerout', (event) => {
      const target = event.target.closest('a, button, input, textarea, select, .project-visual, [data-project]');
      if (target && !target.contains(event.relatedTarget)) cursorRing.classList.remove('is-hover');
    });

    document.addEventListener('pointerdown', () => cursorRing.classList.add('is-down'));
    document.addEventListener('pointerup', () => cursorRing.classList.remove('is-down'));

    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
      cursorVisible = false;
    });

    document.addEventListener('mouseenter', wakeCursor);
  }

  /* ---------- Particle field ---------- */

  const canvas = $('#particle-canvas');

  if (canvas) {
    const context = canvas.getContext('2d');
    let particles = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frameId = null;
    let particleFrame = 0;
    const pointer = { x: -1000, y: -1000, active: false };

    const palette = [
      { r: 198, g: 255, b: 74 },
      { r: 88, g: 228, b: 255 },
      { r: 226, g: 235, b: 216 },
    ];

    const makeParticle = () => {
      const color = palette[Math.floor(Math.random() * palette.length)];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.24,
        vy: (Math.random() - 0.5) * 0.24,
        radius: Math.random() * 1.25 + 0.35,
        alpha: Math.random() * 0.34 + 0.12,
        color,
      };
    };

    const sizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const divisor = width < 640 ? 26000 : 19000;
      const count = clamp(Math.floor((width * height) / divisor), 24, 82);

      particles = Array.from({ length: count }, makeParticle);
    };

    const drawParticles = () => {
      context.clearRect(0, 0, width, height);

      const connectionDistance = width < 640 ? 105 : 132;
      const mouseDistance = 145;

      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i];

        if (!prefersReducedMotion) {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x < -20) particle.x = width + 20;
          if (particle.x > width + 20) particle.x = -20;
          if (particle.y < -20) particle.y = height + 20;
          if (particle.y > height + 20) particle.y = -20;

          if (pointer.active) {
            const dx = particle.x - pointer.x;
            const dy = particle.y - pointer.y;
            const distance = Math.hypot(dx, dy);

            if (distance < mouseDistance && distance > 0.1) {
              const force = (1 - distance / mouseDistance) * 0.075;
              particle.x += (dx / distance) * force;
              particle.y += (dy / distance) * force;
            }
          }
        }

        for (let j = i + 1; j < particles.length; j += 1) {
          const other = particles[j];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.hypot(dx, dy);

          if (distance < connectionDistance) {
            const alpha = (1 - distance / connectionDistance) * 0.12;
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(other.x, other.y);
            context.strokeStyle = `rgba(108, 213, 201, ${alpha.toFixed(3)})`;
            context.lineWidth = 0.55;
            context.stroke();
          }
        }

        const { color } = particle;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${particle.alpha})`;
        context.fill();

        if (particle.radius > 1.15) {
          context.beginPath();
          context.arc(particle.x, particle.y, particle.radius * 3.5, 0, Math.PI * 2);
          context.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.025)`;
          context.fill();
        }
      }

      if (!prefersReducedMotion) {
        frameId = requestAnimationFrame(drawParticles);
      }
    };

    sizeCanvas();
    drawParticles();

    if (!prefersReducedMotion) {
      window.addEventListener('resize', () => {
        sizeCanvas();
      }, { passive: true });

      window.addEventListener('pointermove', (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
      }, { passive: true });

      window.addEventListener('pointerleave', () => {
        pointer.active = false;
      });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (frameId) cancelAnimationFrame(frameId);
          frameId = null;
        } else if (!frameId) {
          frameId = requestAnimationFrame(drawParticles);
        }
      });
    } else {
      window.addEventListener('resize', () => {
        sizeCanvas();
        drawParticles();
      }, { passive: true });
    }
  }

  /* ---------- Reveal on scroll ---------- */

  const revealElements = $$('[data-reveal]');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -6% 0px',
    });

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  /* ---------- Animated counters ---------- */

  const counters = $$('[data-count]');

  const runCounter = (element) => {
    if (element.dataset.counted === 'true') return;
    element.dataset.counted = 'true';

    const target = Number.parseInt(element.dataset.count || '0', 10);
    const length = Number.parseInt(element.dataset.pad || '0', 10);

    if (prefersReducedMotion || Number.isNaN(target)) {
      element.textContent = padNumber(target, length);
      return;
    }

    const duration = 1500;
    const start = performance.now();

    const update = (now) => {
      const progress = clamp((now - start) / duration, 0, 1);
      const value = Math.round(target * easeOutCubic(progress));
      element.textContent = padNumber(value, length);

      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(runCounter);
  } else {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.45 });

    counters.forEach((counter) => counterObserver.observe(counter));
  }

  /* ---------- Scrollspy ---------- */

  const navLinks = $$('[data-nav]');
  const spySections = navLinks
    .map((link) => document.getElementById(link.dataset.nav))
    .filter(Boolean);

  if (navLinks.length && spySections.length && 'IntersectionObserver' in window) {
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          const active = link.dataset.nav === entry.target.id;
          link.classList.toggle('is-active', active);

          if (active) {
            link.setAttribute('aria-current', 'page');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, {
      rootMargin: '-35% 0px -55% 0px',
      threshold: 0,
    });

    spySections.forEach((section) => spyObserver.observe(section));
  }

  /* ---------- Magnetic buttons ---------- */

  if (finePointer && !prefersReducedMotion) {
    $$('[data-magnetic]').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        element.style.transform = `translate(${(x * 9).toFixed(2)}px, ${(y * 7).toFixed(2)}px)`;
      });

      element.addEventListener('pointerleave', () => {
        element.style.transform = '';
      });
    });
  }

  /* ---------- 3D tilt ---------- */

  if (finePointer && !prefersReducedMotion) {
    const strength = 5.5;

    $$('[data-tilt]').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        element.style.transitionDuration = '0.08s';
        element.style.transform = `perspective(1100px) rotateX(${(-y * strength).toFixed(2)}deg) rotateY(${(x * strength).toFixed(2)}deg)`;
      });

      element.addEventListener('pointerleave', () => {
        element.style.transitionDuration = '0.7s';
        element.style.transform = '';
      });
    });
  }

  /* ---------- Pointer glow on cards ---------- */

  if (finePointer) {
    $$('.glow-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        card.style.setProperty('--my', `${event.clientY - rect.top}px`);
      });
    });
  }

  /* ---------- Testimonial slider ---------- */

  const testimonialSlider = $('[data-testimonials]');

  if (testimonialSlider) {
    const slides = $$('.quote-slide', testimonialSlider);
    const dots = $$('.slider-dot', testimonialSlider);
    const countElement = $('.slider-count b', testimonialSlider);
    const prevButton = $('[data-slider-prev]', testimonialSlider);
    const nextButton = $('[data-slider-next]', testimonialSlider);
    let activeSlide = 0;
    let sliderTimer = null;

    const startSliderTimer = () => {
      if (prefersReducedMotion || slides.length < 2) return;
      window.clearInterval(sliderTimer);
      sliderTimer = window.setInterval(() => {
        showSlide(activeSlide + 1);
      }, 7200);
    };

    const stopSliderTimer = () => {
      window.clearInterval(sliderTimer);
      sliderTimer = null;
    };

    function showSlide(index) {
      activeSlide = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeSlide;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
      });

      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === activeSlide;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-pressed', String(isActive));
      });

      if (countElement) {
        countElement.textContent = padNumber(activeSlide + 1, 2);
      }
    }

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        showSlide(activeSlide - 1);
        startSliderTimer();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        showSlide(activeSlide + 1);
        startSliderTimer();
      });
    }

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        startSliderTimer();
      });

      dot.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (index + direction + dots.length) % dots.length;
        showSlide(nextIndex);
        dots[nextIndex].focus();
      });
    });

    testimonialSlider.addEventListener('pointerenter', stopSliderTimer);
    testimonialSlider.addEventListener('pointerleave', startSliderTimer);
    testimonialSlider.addEventListener('focusin', stopSliderTimer);
    testimonialSlider.addEventListener('focusout', (event) => {
      if (!testimonialSlider.contains(event.relatedTarget)) startSliderTimer();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopSliderTimer();
      } else {
        startSliderTimer();
      }
    });

    startSliderTimer();
  }

  /* ---------- Project dialog ---------- */

  const projectDialog = $('#project-dialog');
  const dialogClose = $('#dialog-close');
  const dialogTitle = $('#dialog-title');
  const dialogIndex = $('#dialog-index');
  const dialogCategory = $('#dialog-category');
  const dialogSummary = $('#dialog-summary');
  const dialogBody = $('#dialog-body');
  const dialogMeta = $('#dialog-meta');
  const dialogCta = $('#dialog-cta');
  const projectLinks = $$('[data-project]');
  let dialogTrigger = null;

  const projects = {
    arc: {
      index: '01',
      category: 'Infrastructure',
      title: 'The Arc',
      summary: 'A 240-metre cable-stayed crossing that gives Rotterdam\u2019s western waterfront a new pedestrian spine \u2014 and a reason to linger above the water.',
      body: [
        'Commissioned through an international competition, The Arc reconnects two post-industrial neighbourhoods across the Maas. The brief asked for a landmark; the city needed a shortcut. We designed for both.',
        'A single inclined steel pylon carries a shallow cable fan and a slender orthotropic deck, keeping the structure light enough to touch the river with only two piers. <strong>Every cable can be replaced without closing the bridge.</strong>',
      ],
      meta: [
        ['Location', 'Rotterdam, NL'],
        ['Completed', '2025'],
        ['Client', 'City of Rotterdam'],
        ['Role', 'Lead structural engineer'],
        ['Main span', '240 m'],
        ['Recognition', 'National Steel Award, 2025'],
      ],
    },
    terra: {
      index: '02',
      category: 'Structures',
      title: 'Terra 9',
      summary: 'A 14-storey mass-timber workplace that treats carbon as a design material \u2014 and gives its occupants a different relationship with the city.',
      body: [
        'Terra 9 replaces a conventional concrete frame with a hybrid glulam-and-CLT structure, wrapped in a naturally ventilated facade. The building stores more carbon than its construction released.',
        'The structural grid was developed alongside the lease plan, allowing whole floors to be reconfigured without touching the primary frame. <strong>What is efficient today should still be adaptable in forty years.</strong>',
      ],
      meta: [
        ['Location', 'Singapore'],
        ['Completed', '2024'],
        ['Client', 'Northbank Development'],
        ['Role', 'Structural + facade engineer'],
        ['Height', '14 storeys'],
        ['Structure', 'Hybrid mass timber'],
      ],
    },
    tidal: {
      index: '03',
      category: 'Public realm',
      title: 'Tidal Commons',
      summary: 'A coastal park that doubles as flood defence: 3.2 kilometres of terraced landscape, engineered to welcome the water rather than keep it out.',
      body: [
        'Instead of a single hard wall, Tidal Commons uses a sequence of planted terraces, permeable paths and controlled tidal basins. At ordinary tides it is a park; at storm surge it becomes a living buffer.',
        'The landscape structure is designed as a set of independent, repairable cells. <strong>The defence gets stronger as the ecology matures.</strong>',
      ],
      meta: [
        ['Location', 'Copenhagen, DK'],
        ['Completed', '2023'],
        ['Client', 'Port of Copenhagen'],
        ['Role', 'Civil + coastal engineer'],
        ['Length', '3.2 km'],
        ['Capacity', '100-year storm surge'],
      ],
    },
    halo: {
      index: '04',
      category: 'Public realm',
      title: 'Halo Pavilion',
      summary: 'A 22-metre timber gridshell that turns a forgotten Lisbon courtyard into the neighbourhood\u2019s open-air living room.',
      body: [
        'The pavilion began as a temporary structure for a summer festival. Its radial gridshell was designed for disassembly, with every timber member sized to be carried by two people.',
        'Three years later, Halo is still standing \u2014 now permanently. <strong>The structure was re-tensioned and re-skinned rather than replaced, proving that temporary can be a design strategy, not an excuse.</strong>',
      ],
      meta: [
        ['Location', 'Lisbon, PT'],
        ['Completed', '2022'],
        ['Client', 'Casa Onda / City of Lisbon'],
        ['Role', 'Structural engineer'],
        ['Span', '22 m'],
        ['Material', 'Reclaimed glulam'],
      ],
    },
  };

  const openProject = (key, trigger) => {
    if (!projectDialog || !projects[key]) return;

    const project = projects[key];
    dialogTrigger = trigger || null;

    if (dialogIndex) dialogIndex.textContent = project.index;
    if (dialogCategory) dialogCategory.textContent = project.category;
    if (dialogTitle) dialogTitle.textContent = project.title;
    if (dialogSummary) dialogSummary.textContent = project.summary;

    if (dialogBody) {
      dialogBody.innerHTML = project.body.map((paragraph) => `<p>${paragraph}</p>`).join('');
    }

    if (dialogMeta) {
      dialogMeta.innerHTML = project.meta.map(([label, value]) => (
        `<div><dt>${label}</dt><dd>${value}</dd></div>`
      )).join('');
    }

    if (typeof projectDialog.showModal === 'function') {
      if (!projectDialog.open) projectDialog.showModal();
      body.classList.add('dialog-open');
    }
  };

  projectLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const key = link.dataset.project;
      if (!projectDialog || !projects[key] || typeof projectDialog.showModal !== 'function') return;

      event.preventDefault();
      openProject(key, link);
    });
  });

  if (projectDialog) {
    const closeProject = () => {
      if (projectDialog.open) projectDialog.close();
    };

    if (dialogClose) dialogClose.addEventListener('click', closeProject);

    projectDialog.addEventListener('click', (event) => {
      if (event.target === projectDialog) closeProject();
    });

    projectDialog.addEventListener('close', () => {
      body.classList.remove('dialog-open');
      if (dialogTrigger) {
        dialogTrigger.focus({ preventScroll: true });
        dialogTrigger = null;
      }
    });

    if (dialogCta) {
      dialogCta.addEventListener('click', () => {
        window.setTimeout(closeProject, 0);
      });
    }
  }

  /* ---------- Project filters ---------- */

  const filterButtons = $$('.filter-btn');
  const projectCards = $$('.project-card');
  const filterStatus = $('#filter-status');

  if (filterButtons.length && projectCards.length) {
    const applyFilter = (filter) => {
      let visibleCount = 0;

      projectCards.forEach((card) => {
        const matches = filter === 'all' || card.dataset.category === filter;
        card.hidden = !matches;
        card.classList.remove('is-entering');

        if (matches) {
          visibleCount += 1;
          window.requestAnimationFrame(() => {
            card.classList.add('is-entering');
            window.setTimeout(() => card.classList.remove('is-entering'), 650);
          });
        }
      });

      filterButtons.forEach((button) => {
        const isActive = button.dataset.filter === filter;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });

      if (filterStatus) {
        const label = filter === 'all'
          ? 'all projects'
          : `${filter === 'public' ? 'public realm' : filter} projects`;
        filterStatus.textContent = `Showing ${visibleCount} ${label}.`;
      }
    };

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        applyFilter(button.dataset.filter || 'all');
      });
    });
  }

  /* ---------- Contact form ---------- */

  const contactForm = $('#contact-form');
  const formStatus = $('#form-status');

  if (contactForm) {
    const submitButton = $('.form-submit', contactForm);
    const submitLabel = $('.submit-label', contactForm);

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      const data = new FormData(contactForm);
      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const projectType = String(data.get('project-type') || '').trim();
      const location = String(data.get('location') || '').trim();
      const message = String(data.get('message') || '').trim();
      const subject = `Project enquiry${name ? ` from ${name}` : ''}`;
      const bodyLines = [`Name: ${name}`, `Email: ${email}`];

      if (projectType) bodyLines.push(`Project type: ${projectType}`);
      if (location) bodyLines.push(`Location: ${location}`);
      bodyLines.push('', message);

      const mailtoLink = `mailto:hello@miravoss.studio?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

      if (submitButton) {
        submitButton.classList.add('is-sending');
        submitButton.disabled = true;
      }

      if (submitLabel) submitLabel.textContent = 'Opening email...';

      if (formStatus) {
        formStatus.textContent = 'Your email app is opening with the enquiry prefilled. If nothing happens, email hello@miravoss.studio directly.';
        formStatus.classList.add('is-visible');
      }

      try {
        window.location.href = mailtoLink;
      } catch (error) {
        if (formStatus) {
          formStatus.textContent = 'Could not open your email app. Please email hello@miravoss.studio directly.';
        }
      }

      if (submitButton) {
        submitButton.classList.remove('is-sending');
        submitButton.classList.add('is-sent');
        submitButton.disabled = false;
      }

      if (submitLabel) submitLabel.textContent = 'Email drafted';

      window.setTimeout(() => {
        if (submitButton) submitButton.classList.remove('is-sent');
        if (submitLabel) submitLabel.textContent = 'Send enquiry';
      }, 4200);
    });

    contactForm.addEventListener('input', () => {
      if (!formStatus || !formStatus.classList.contains('is-visible')) return;
      formStatus.classList.remove('is-visible');
    });
  }

  /* ---------- Local clock ---------- */

  const localTime = $('#local-time');

  if (localTime) {
    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Amsterdam',
    });

    const updateClock = () => {
      localTime.textContent = timeFormatter.format(new Date());
    };

    updateClock();
    window.setInterval(updateClock, 30000);
  }

  /* ---------- Dialog keyboard polish ---------- */

  if (projectDialog) {
    projectDialog.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;

      const focusable = $$('a[href], button:not([disabled])', projectDialog)
        .filter((element) => element.offsetParent !== null);

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- Soft image fallback ---------- */

  const portraitImage = $('.portrait-frame img');

  if (portraitImage) {
    portraitImage.addEventListener('error', () => {
      portraitImage.style.display = 'none';
      const frame = portraitImage.closest('.portrait-frame');
      if (frame) frame.classList.add('is-missing');
    });
  }

})();
