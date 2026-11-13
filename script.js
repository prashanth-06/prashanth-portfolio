/* =========================================================
   Prashanth Punna — Portfolio Interactions
   ========================================================= */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const htmlEl = document.documentElement;

  /* -------------------------------------------------------
     0. Smooth Dual-Ring Custom Cursor (Lerp + rAF)
     ------------------------------------------------------- */
  const cursorOuter = document.getElementById('cursorOuter');
  const cursorInner = document.getElementById('cursorInner');

  if (cursorOuter && cursorInner && hasFinePointer && !prefersReducedMotion) {
    let mouseX = -100;
    let mouseY = -100;
    let outerX = -100;
    let outerY = -100;
    let innerX = -100;
    let innerY = -100;
    let isActive = false;

    const interactiveSelector = 'a, button, input, textarea, [role="button"], .project-item, .pill-tab, .scroll-stamp';

    window.addEventListener(
      'mousemove',
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!isActive) {
          isActive = true;
          outerX = innerX = mouseX;
          outerY = innerY = mouseY;
          cursorOuter.classList.add('is-visible');
          cursorInner.classList.add('is-visible');
        }
      },
      { passive: true }
    );

    document.addEventListener('mouseleave', () => {
      isActive = false;
      cursorOuter.classList.remove('is-visible');
      cursorInner.classList.remove('is-visible');
    });

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelector)) {
        cursorOuter.classList.add('is-hover');
        cursorInner.classList.add('is-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelector)) {
        cursorOuter.classList.remove('is-hover');
        cursorInner.classList.remove('is-hover');
      }
    });

    window.addEventListener('mousedown', () => {
      cursorOuter.classList.add('is-pressed');
      cursorInner.classList.add('is-pressed');
    });

    window.addEventListener('mouseup', () => {
      cursorOuter.classList.remove('is-pressed');
      cursorInner.classList.remove('is-pressed');
    });

    const tickCursor = () => {
      innerX += (mouseX - innerX) * 0.42;
      innerY += (mouseY - innerY) * 0.42;
      outerX += (mouseX - outerX) * 0.14;
      outerY += (mouseY - outerY) * 0.14;

      cursorInner.style.transform = `translate3d(${innerX}px, ${innerY}px, 0)`;
      cursorOuter.style.transform = `translate3d(${outerX}px, ${outerY}px, 0)`;

      requestAnimationFrame(tickCursor);
    };

    requestAnimationFrame(tickCursor);
  }

  /* -------------------------------------------------------
     0b. Antigravity Character-by-Character Typed Header
     ------------------------------------------------------- */
  class AntigravityTypedHeader {
    constructor(container) {
      this.container = container;
      this.content = container.querySelector('.typed-content');
      this.cursorContainer = container.querySelector('.typed-cursor-container');
      if (!this.content || !this.cursorContainer) return;

      this.rawText = this.content.textContent.trim();
      this.chars = [];
      this.charPositions = [];
      this.done = false;

      this.setupChars();
      this.cachePositions();
      this.startTyping();

      window.addEventListener('resize', () => this.onResize(), { passive: true });
    }

    setupChars() {
      const words = this.rawText.split(' ');
      this.content.innerHTML = '';
      this.chars = [];

      words.forEach((word, wIdx) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'typed-word';
        wordSpan.style.display = 'inline-block';
        wordSpan.style.whiteSpace = 'nowrap';

        for (let i = 0; i < word.length; i++) {
          const charSpan = document.createElement('span');
          charSpan.className = 'typed-char';
          charSpan.textContent = word[i];
          charSpan.style.opacity = '0';
          charSpan.style.display = 'inline-block';
          wordSpan.appendChild(charSpan);
          this.chars.push(charSpan);
        }

        this.content.appendChild(wordSpan);

        if (wIdx < words.length - 1) {
          const space = document.createTextNode(' ');
          this.content.appendChild(space);
        }
      });
    }

    cachePositions() {
      if (!this.chars.length) return;
      const parentRect = this.container.getBoundingClientRect();
      this.charPositions = this.chars.map((char) => {
        const rect = char.getBoundingClientRect();
        return {
          x: rect.right - parentRect.left + 3,
          y: rect.top - parentRect.top
        };
      });

      if (this.charPositions.length > 0) {
        const firstRect = this.chars[0].getBoundingClientRect();
        this.updateCursor(firstRect.left - parentRect.left, firstRect.top - parentRect.top);
      }
    }

    updateCursor(x, y) {
      this.cursorContainer.style.setProperty('--cursor-pos-x', `${x}px`);
      this.cursorContainer.style.setProperty('--cursor-pos-y', `${y}px`);
    }

    onResize() {
      this.cachePositions();
      if (this.done) {
        const last = this.charPositions[this.charPositions.length - 1];
        if (last) this.updateCursor(last.x, last.y);
      }
    }

    startTyping() {
      if (prefersReducedMotion) {
        this.chars.forEach((c) => (c.style.opacity = '1'));
        this.cursorContainer.style.display = 'none';
        return;
      }

      this.cursorContainer.classList.add('is-typing');
      let idx = 0;
      const speed = 42;

      const typeStep = () => {
        if (idx < this.chars.length) {
          const char = this.chars[idx];
          char.style.opacity = '1';
          const pos = this.charPositions[idx];
          if (pos) {
            this.updateCursor(pos.x, pos.y);
          }
          idx++;
          setTimeout(typeStep, speed);
        } else {
          this.done = true;
          setTimeout(() => {
            this.cursorContainer.classList.add('is-done');
          }, 2400);
        }
      };

      setTimeout(typeStep, 320);
    }
  }

  document.querySelectorAll('[data-typed-header]').forEach((el) => new AntigravityTypedHeader(el));

  /* -------------------------------------------------------
     0B. CodeNova Hero Canvas — Interactive Matrix Dot Grid
     ------------------------------------------------------- */
  (() => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dots = [];
    let W = 0, H = 0;
    let mouseX = -9999, mouseY = -9999;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const hero = canvas.parentElement;
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeDots();
    };

    const makeDots = () => {
      dots = [];
      const step = W < 768 ? 60 : 75;
      const cols = Math.floor(W / step);
      const rows = Math.floor(H / step);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * step + step / 2;
          const y = r * step + step / 2;
          dots.push({
            x, y,
            ox: x, oy: y,
            vx: 0, vy: 0,
            r: Math.random() * 1.3 + 0.7
          });
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const dotColor = isDark ? 'rgba(222, 255, 0, 0.28)' : 'rgba(26, 115, 232, 0.22)';
      const lineColor = isDark ? 'rgba(222, 255, 0, 0.04)' : 'rgba(26, 115, 232, 0.04)';

      const len = dots.length;
      for (let i = 0; i < len; i++) {
        const d = dots[i];
        const dx = mouseX - d.x;
        const dy = mouseY - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = Math.max(0, 1 - dist / 140);

        d.vx += -dx * force * 0.015 + (d.ox - d.x) * 0.05;
        d.vy += -dy * force * 0.015 + (d.oy - d.y) * 0.05;
        d.vx *= 0.85;
        d.vy *= 0.85;
        d.x += d.vx;
        d.y += d.vy;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r + force * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();
      }

      for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    };

    window.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouseX = -9999;
      mouseY = -9999;
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    }, { passive: true });

    resize();
    draw();
  })();

  /* -------------------------------------------------------
     1. Theme Toggle (Dark #0E0E0E+#DEFF00 / Light #FFFFFF)
     ------------------------------------------------------- */
  const themeToggle = document.getElementById('themeToggle');
  let savedTheme = localStorage.getItem('prashanth-theme-v5');

  if (!savedTheme) {
    savedTheme = 'dark';
    localStorage.setItem('prashanth-theme-v5', 'dark');
    localStorage.setItem('prashanth-theme', 'dark');
  }

  htmlEl.setAttribute('data-theme', savedTheme);

  themeToggle?.addEventListener('click', () => {
    const current = htmlEl.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', next);
    localStorage.setItem('prashanth-theme', next);
    localStorage.setItem('prashanth-theme-v5', next);
  });

  /* -------------------------------------------------------
     2. Navbar Scroll State & Scroll Progress
     ------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scrollProgress');

  const updateScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct = maxScroll > 0 ? Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100)) : 0;

    if (scrollProgress) scrollProgress.style.width = `${pct}%`;
    if (navbar) navbar.classList.toggle('scrolled', scrollTop > 12);

    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
      scrollToTopBtn.classList.toggle('scroll-top-active', scrollTop > 320);
    }
  };

  const scrollToTopBtn = document.getElementById('scrollToTopBtn');
  scrollToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  /* -------------------------------------------------------
     3. Active Section Highlighting
     ------------------------------------------------------- */
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const sections = document.querySelectorAll('main section[id]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('data-section') === id);
        });
      });
    },
    { rootMargin: '-35% 0px -55% 0px' }
  );

  sections.forEach((sec) => sectionObserver.observe(sec));

  /* -------------------------------------------------------
     4. Mobile Navigation Drawer
     ------------------------------------------------------- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta');

  const setMenuOpen = (open) => {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  hamburger?.addEventListener('click', () => {
    setMenuOpen(!mobileMenu?.classList.contains('open'));
  });

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  /* -------------------------------------------------------
     5. Smooth Scroll Reveal & Counters
     ------------------------------------------------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');

  const animateCounter = (el) => {
    const target = Number(el.dataset.target || 0);
    if (prefersReducedMotion || !target) return;

    const duration = 900;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = String(target);
      }
    };

    requestAnimationFrame(step);
  };

  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        entry.target.querySelectorAll?.('.counter').forEach((counter) => {
          if (!counter.dataset.counted) {
            counter.dataset.counted = 'true';
            animateCounter(counter);
          }
        });
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  /* -------------------------------------------------------
     6. Skills Pill Tabs Filter
     ------------------------------------------------------- */
  const filterTabs = document.querySelectorAll('.pill-tab[data-filter]');
  const skillItems = document.querySelectorAll('#skillsGrid .card-item');

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;

      filterTabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });

      skillItems.forEach((item) => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('hidden', !match);
        if (match) item.classList.add('revealed');
      });
    });
  });

  /* -------------------------------------------------------
     6b. Live Client Websites Filter & Spotlight Hover
     ------------------------------------------------------- */
  const siteFilterTabs = document.querySelectorAll('.pill-tab[data-site-filter]');
  const showcaseCards = document.querySelectorAll('#liveShowcaseGrid .showcase-card');

  siteFilterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.siteFilter;

      siteFilterTabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });

      showcaseCards.forEach((card) => {
        const match = filter === 'all' || card.dataset.siteCategory === filter;
        card.classList.toggle('hidden', !match);
        if (match) card.classList.add('revealed');
      });
    });
  });

  if (hasFinePointer && !prefersReducedMotion) {
    document.querySelectorAll('.spotlight-item').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
      });
    });
  }

  /* -------------------------------------------------------
     6c. Interactive Project Slider (Delhi International School)
     ------------------------------------------------------- */
  const slider = document.getElementById('delhiSchoolSlider');
  if (slider) {
    const slides = slider.querySelectorAll('.slider-slide');
    const dots = slider.querySelectorAll('.slider-dot');
    const prevBtn = slider.querySelector('.slider-nav-btn.prev');
    const nextBtn = slider.querySelector('.slider-nav-btn.next');
    const counterCur = slider.querySelector('.slider-counter .current-slide');
    let currentIndex = 0;
    let autoPlayTimer = null;
    let isHovered = false;

    function goToSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentIndex = index;

      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentIndex);
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });

      if (counterCur) {
        counterCur.textContent = String(currentIndex + 1);
      }
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(() => {
        if (!isHovered) {
          nextSlide();
        }
      }, 4000);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        prevSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        nextSlide();
      });
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const slideIdx = parseInt(dot.dataset.slide, 10);
        goToSlide(slideIdx);
      });
    });

    const parentCard = slider.closest('.showcase-card') || slider;
    parentCard.addEventListener('mouseenter', () => { isHovered = true; });
    parentCard.addEventListener('mouseleave', () => { isHovered = false; });

    let touchStartX = 0;
    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
    }, { passive: true });

    startAutoPlay();
  }

  /* -------------------------------------------------------
     7. Project Details Modal
     ------------------------------------------------------- */
  const projectData = {
    'business-site': {
      badge: '2024',
      title: 'Responsive Multi-Page Business Website',
      desc: 'Built a responsive multi-page client website focused on cross-device usability, fast asset loading, and spam-protected customer inquiries.',
      bullets: [
        'Developed responsive layouts across pages using HTML5, CSS3, Bootstrap, and JavaScript.',
        'Integrated contact and brochure request forms with PHP mailer.',
        'Added Google reCAPTCHA to protect forms against automated spam.',
        'Compressed images and optimized asset loading across pages.'
      ],
      outcome: 'Improved the Google PageSpeed score by 30% while maintaining consistent cross-browser rendering.',
      tags: ['HTML5', 'CSS3', 'Bootstrap', 'JavaScript', 'PHP Mailer', 'Google reCAPTCHA']
    },
    'crm-portal': {
      badge: '2024',
      title: 'CRM-Integrated Lead Capture Portal',
      desc: 'Developed a lead capture portal that connects website forms directly to a CRM system via REST API to automate sales pipeline updates.',
      bullets: [
        'Connected web form submissions directly to the CRM endpoint through a REST API.',
        'Implemented real-time client-side validation in JavaScript for immediate user feedback.',
        'Added server-side PHP validation to keep lead submissions reliable and secure.'
      ],
      outcome: 'Eliminated manual lead entry for the sales team and streamlined pipeline updates.',
      tags: ['JavaScript', 'REST API', 'CRM Integration', 'PHP Validation', 'HTML5', 'CSS3']
    },
    'revamp-suite': {
      badge: 'G-Rank · 2024–Present',
      title: 'Website Revamps, QR & SEO Audits',
      desc: 'Ongoing production client work at G-Rank Digital Service Pvt. Ltd. spanning UI/UX revamps, legacy code cleanup, dynamic QR workflows, and WordPress maintenance.',
      bullets: [
        'Redesigned UI/UX layouts, refactored legacy code, and migrated client website content.',
        'Integrated dynamic QR code generation and automated PHP brochure delivery workflows.',
        'Ran technical audits using W3C Validator, Google PageSpeed Insights, and Semrush.',
        'Managed WordPress plugin updates, theme customization, and content deployment.'
      ],
      outcome: 'Delivered 10+ responsive client web applications with improved load scores, SEO health, and visual consistency.',
      tags: ['HTML5/CSS3', 'JavaScript', 'PHP', 'WordPress', 'PageSpeed Insights', 'Semrush', 'W3C Validator']
    }
  };

  const modal = document.getElementById('projectModal');
  const modalClose = document.getElementById('modalClose');
  const modalBadge = document.getElementById('modalBadge');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalBullets = document.getElementById('modalBullets');
  const modalOutcome = document.getElementById('modalOutcome');
  const modalTags = document.getElementById('modalTags');

  const openModal = (id) => {
    const data = projectData[id];
    if (!data || !modal) return;

    modalBadge.textContent = data.badge;
    modalTitle.textContent = data.title;
    modalDesc.textContent = data.desc;
    modalOutcome.textContent = data.outcome;
    modalBullets.innerHTML = data.bullets.map((b) => `<li>${b}</li>`).join('');
    modalTags.innerHTML = data.tags.map((t) => `<span class="chip">${t}</span>`).join('');

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.open-modal-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      openModal(btn.dataset.projectId);
    });
  });

  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('open')) closeModal();
  });

  /* -------------------------------------------------------
     8. Copy to Clipboard & Toast
     ------------------------------------------------------- */
  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  const showToast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  };

  document.querySelectorAll('.copy-trigger').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      const label = btn.dataset.label || 'Copied';
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        showToast(label);
      } catch {
        showToast(text);
      }
    });
  });

  /* -------------------------------------------------------
     9. Kinetic Heading Animations (Character-by-Character Split, PrimeFPrint Style)
     ------------------------------------------------------- */
  function splitElementIntoChars(el) {
    if (!el || el.dataset.splitDone) return [];
    el.dataset.splitDone = 'true';

    function walkNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (!text.trim() && text.includes('\n')) return;

        const fragment = document.createDocumentFragment();
        const parts = text.split(/(\s+)/);

        parts.forEach((part) => {
          if (/^\s+$/.test(part)) {
            fragment.appendChild(document.createTextNode(part));
          } else {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'prime-split-word';

            for (let i = 0; i < part.length; i++) {
              const charSpan = document.createElement('span');
              charSpan.className = 'prime-split-char';
              charSpan.textContent = part[i];
              wordSpan.appendChild(charSpan);
            }
            fragment.appendChild(wordSpan);
          }
        });

        node.parentNode.replaceChild(fragment, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList.contains('prime-no-split') || node.tagName === 'I' || node.tagName === 'SVG') {
          return;
        }
        Array.from(node.childNodes).forEach(walkNode);
      }
    }

    walkNode(el);
    return el.querySelectorAll('.prime-split-char');
  }

  function initKineticHeadingAnimations() {
    if (prefersReducedMotion) return;

    // 1. Hero Heading Kinetic Cascade on load (PRASHANTH PUNNA)
    const l1 = document.getElementById('hl1');
    const l2 = document.getElementById('hl2');

    if (l1 || l2) {
      const chars1 = l1 ? Array.from(splitElementIntoChars(l1)) : [];
      const chars2 = l2 ? Array.from(splitElementIntoChars(l2)) : [];
      const allHeroChars = [...chars1, ...chars2];

      if (typeof gsap !== 'undefined') {
        // Character-by-character slide-in with kinetic stagger wave
        gsap.from(allHeroChars, {
          x: 35,
          opacity: 0,
          duration: 0.8,
          stagger: 0.018,
          ease: 'power2.out',
          delay: 0.15,
          clearProps: 'all'
        });

        // Sequential hero elements entrance
        gsap.from('.hero-tag', {
          y: -15,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          delay: 0.08
        });

        gsap.from('.hero-tagline', {
          y: 20,
          opacity: 0,
          duration: 0.75,
          ease: 'power2.out',
          delay: 0.5
        });

        gsap.from('.hero-cta-row', {
          y: 20,
          opacity: 0,
          duration: 0.75,
          ease: 'power2.out',
          delay: 0.65
        });

        gsap.from('.hero-person-col', {
          opacity: 0,
          scale: 0.96,
          duration: 0.85,
          ease: 'power2.out',
          delay: 0.3
        });

        gsap.from('.tech-badge', {
          y: 25,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          delay: 0.55
        });
      } else {
        // Pure Web Animations API / CSS fallback for instant reliable execution
        allHeroChars.forEach((ch, idx) => {
          ch.style.opacity = '0';
          ch.style.transform = 'translateX(35px)';
          setTimeout(() => {
            ch.style.transition = 'opacity 0.65s ease, transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
            ch.style.opacity = '1';
            ch.style.transform = 'translateX(0)';
          }, 150 + idx * 18);
        });
      }
    }

    // 2. Scroll-triggered kinetic animations for section titles throughout page
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      document.querySelectorAll('.section-heading').forEach((h) => {
        const chars = splitElementIntoChars(h);
        if (!chars || chars.length === 0) return;

        gsap.from(chars, {
          x: 30,
          opacity: 0,
          duration: 0.75,
          stagger: 0.012,
          ease: 'power2.out',
          clearProps: 'all',
          scrollTrigger: {
            trigger: h,
            start: 'top 88%',
            once: true
          }
        });
      });
    }
  }

  /* -------------------------------------------------------
     12. Web Developer Minimalist Preloader Controller
     ------------------------------------------------------- */
  function initSimplePreloader(onComplete) {
    const preloader = document.getElementById('sitePreloader');
    if (!preloader) {
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    const fill = document.getElementById('preloaderFill');
    const percentEl = document.getElementById('preloaderPercent');

    let current = 0;
    let dismissed = false;

    const dismissPreloader = () => {
      if (dismissed) return;
      dismissed = true;

      if (fill) fill.style.width = '100%';
      if (percentEl) percentEl.textContent = '100';

      preloader.classList.add('done');

      // Trigger hero kinetic cascade smoothly as preloader lifts
      if (typeof onComplete === 'function') {
        setTimeout(onComplete, 120);
      }

      setTimeout(() => {
        preloader.style.display = 'none';
      }, 700);
    };

    // Click or Escape to skip instantly
    preloader.addEventListener('click', dismissPreloader);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !dismissed) dismissPreloader();
    }, { once: true });

    // Safety fallback: dismiss within 1.6s max
    const safetyTimer = setTimeout(dismissPreloader, 1600);

    if (prefersReducedMotion) {
      clearTimeout(safetyTimer);
      dismissPreloader();
      return;
    }

    const startTime = performance.now();
    const duration = 850; // Snappy 850ms count up

    function step(timestamp) {
      if (dismissed) return;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.min(100, Math.floor(eased * 100));

      if (fill) fill.style.width = current + '%';
      if (percentEl) percentEl.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        clearTimeout(safetyTimer);
        setTimeout(dismissPreloader, 90);
      }
    }

    requestAnimationFrame(step);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initSimplePreloader(initKineticHeadingAnimations);
    });
  } else {
    initSimplePreloader(initKineticHeadingAnimations);
  }

  // End of initialization
})();
