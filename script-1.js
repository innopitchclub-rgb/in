// ---------- footer year ----------
const yearEl = document.getElementById('footerYear');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// ---------- mobile nav ----------
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
// starfield element
const starfield = document.querySelector('.starfield');

// Split text into spans for premium per-character animation
function initPremiumText() {
  document.querySelectorAll('.premium-text').forEach((el) => {
    if (el.dataset.splitDone) return;
    const originalNodes = Array.from(el.childNodes);
    el.textContent = '';
    let idx = 0;

    originalNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
        el.appendChild(document.createElement('br'));
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        // preserve element (e.g., <span class="highlight">) but split its text
        const clone = node.cloneNode(false);
        const txt = node.textContent || '';
        Array.from(txt).forEach((ch) => {
          const s = document.createElement('span');
          s.textContent = ch === ' ' ? '\u00A0' : ch;
          s.style.setProperty('--i', String(idx));
          idx += 1;
          clone.appendChild(s);
        });
        el.appendChild(clone);
        return;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        const txt = node.textContent || '';
        Array.from(txt).forEach((ch) => {
          const s = document.createElement('span');
          s.textContent = ch === ' ' ? '\u00A0' : ch;
          s.style.setProperty('--i', String(idx));
          idx += 1;
          el.appendChild(s);
        });
      }
    });

    el.dataset.splitDone = '1';
  });
}

// initialize premium text on load
window.addEventListener('load', () => {
  initPremiumText();
});

// generate simple stars once
if (starfield) {
  const STAR_COUNT = 110;
  for (let i = 0; i < STAR_COUNT; i += 1) {
    const s = document.createElement('span');
    s.className = 'star';
    const size = Math.random() * 2.8 + 0.6; // px
    s.style.width = `${size}px`;
    s.style.height = `${size}px`;
    s.style.left = `${Math.random() * 100}vw`;
    s.style.top = `${Math.random() * 100}vh`;
    s.style.opacity = `${0.25 + Math.random() * 0.8}`;
    // twinkle timing and slight blur for larger stars
    s.style.animationDuration = `${1.4 + Math.random() * 3.0}s`;
    s.style.animationDelay = `${Math.random() * 3}s`;
    if (size > 2.6) s.style.filter = 'blur(0.6px)';
    // parallax factor (larger => moves more with scroll)
    s.dataset.parallax = `${Math.random() * 0.9 + 0.2}`;
    starfield.appendChild(s);
  }
}

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ---------- premium interactions ----------
const header = document.querySelector('.site-header');
const progressBar = document.getElementById('scrollProgress');
const backToTop = document.getElementById('backToTop');
const revealItems = document.querySelectorAll('.hero-copy, .hero-card, .about-intro, .about-grid, .about-point, .detail-card, .leader-card, .team-card, .event-card, .apply-inner, .apply-form, .member-card, .events-empty');

const revealOnScroll = () => {
  const scrollTop = window.scrollY + window.innerHeight * 0.9;

  revealItems.forEach((item, index) => {
    if (!item.classList.contains('reveal')) {
      item.classList.add('reveal');
    }
    if (scrollTop > item.offsetTop) {
      item.classList.add('is-visible');
      item.style.transitionDelay = `${Math.min(index * 60, 220)}ms`;
    }
  });

  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 12);
  }

  // scroll progress used for parallax and rocket movement
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;

  // move starfield for subtle parallax
  if (starfield) {
    // translate the whole field slightly
    starfield.style.transform = `translateY(${ -progress * 12 }%)`;
    // layered per-star parallax for depth
    const stars = starfield.querySelectorAll('.star');
    stars.forEach((s) => {
      const p = parseFloat(s.dataset.parallax) || 0.6;
      s.style.transform = `translateY(${ -progress * 40 * p }px)`;
    });
  }

  // (rocket animations removed)

  if (progressBar) {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
    progressBar.style.transform = `scaleX(${Math.min(progress, 1)})`;
  }

  if (backToTop) {
    backToTop.classList.toggle('show', window.scrollY > 600);
  }
};

window.addEventListener('scroll', revealOnScroll, { passive: true });
window.addEventListener('load', revealOnScroll);

// ---------- ripple effect ----------
const rippleButtons = document.querySelectorAll('.btn, .filter-pill, .checkbox-pill, .nav-toggle, .back-to-top');

rippleButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height) * 1.1;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    ripple.className = 'ripple';
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });
});

// ---------- mouse spotlight ----------
const spotlight = document.querySelector('.spotlight');

if (spotlight) {
  window.addEventListener('mousemove', (event) => {
    const x = event.clientX / window.innerWidth;
    const y = event.clientY / window.innerHeight;
    spotlight.style.transform = `translate(${(x - 0.5) * 20}px, ${(y - 0.5) * 12}px)`;
    spotlight.style.opacity = '0.9';
  });

  window.addEventListener('mouseleave', () => {
    spotlight.style.transform = 'translate(0, 0)';
    spotlight.style.opacity = '0.6';
  });
}

// ---------- lightweight particles ----------
for (let i = 0; i < 16; i += 1) {
  const particle = document.createElement('span');
  particle.className = 'particle';
  particle.style.left = `${Math.random() * 100}vw`;
  particle.style.top = `${Math.random() * 100}vh`;
  particle.style.animationDelay = `${Math.random() * 8}s`;
  document.body.appendChild(particle);
}

// ---------- application form ----------
const applyForm = document.getElementById('applyForm');

// Helpers for the enhanced registration flow
function sanitizeText(value) {
  return String(value || '').replace(/<[^>]*>/g, '').trim();
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('Unable to read file.'));
    reader.readAsDataURL(file);
  });
}

function previewUploadedFile(input, previewBox, isImage = false) {
  const file = input.files && input.files[0];
  if (!file) {
    previewBox.hidden = true;
    previewBox.innerHTML = '';
    return;
  }
  previewBox.hidden = false;
  previewBox.innerHTML = isImage ? `<img src="" alt="Preview" />` : `<span>${file.name}</span>`;
  if (isImage) {
    const img = previewBox.querySelector('img');
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result; };
    reader.readAsDataURL(file);
  }
}

if (applyForm) {
  const formStatus = document.getElementById('formStatus');
  const submitBtn = applyForm.querySelector('button[type="submit"]');
  const cancelBtn = document.getElementById('cancelRegistrationBtn');
  const photoInput = document.getElementById('photo');
  const resumeInput = document.getElementById('resume');
  const photoPreview = document.getElementById('photoPreview');
  const resumePreview = document.getElementById('resumePreview');

  photoInput?.addEventListener('change', () => previewUploadedFile(photoInput, photoPreview, true));
  resumeInput?.addEventListener('change', () => previewUploadedFile(resumeInput, resumePreview));

  cancelBtn?.addEventListener('click', () => {
    applyForm.reset();
    photoPreview.hidden = true;
    resumePreview.hidden = true;
    photoPreview.innerHTML = '';
    resumePreview.innerHTML = '';
    formStatus.textContent = 'Form cleared. You can start again.';
    formStatus.style.color = '';
    window.location.href = 'index.html';
  });

  applyForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Basic validation
    const required = [
      ['fullName', 'Please enter your full name.'],
      ['regNumber', 'Please enter your register number.'],
      ['department', 'Please select your department.'],
      ['year', 'Please select your year.'],
      ['email', 'Please enter a valid email.'],
      ['phone', 'Please enter a valid phone number.'],
      ['gender', 'Please select your gender.'],
      ['skills', 'Please enter your skills.'],
      ['interest', 'Please enter your area of interest.'],
      ['experience', 'Please mention your previous experience.'],
      ['reason', 'Please explain why you want to join.']
    ];

    let ok = true;
    required.forEach(([id, msg]) => {
      const el = document.getElementById(id);
      if (!el || !sanitizeText(el.value)) {
        ok = false;
      }
    });

    if (!ok) {
      formStatus.style.color = '#E8483A';
      formStatus.textContent = 'Please complete the highlighted fields.';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';
    formStatus.style.color = '';
    formStatus.textContent = 'Saving your registration…';

    try {
      const payload = {
        fullName: sanitizeText(document.getElementById('fullName').value),
        regNumber: sanitizeText(document.getElementById('regNumber').value),
        department: sanitizeText(document.getElementById('department').value),
        year: sanitizeText(document.getElementById('year').value),
        email: sanitizeText(document.getElementById('email').value),
        phone: sanitizeText(document.getElementById('phone').value),
        gender: sanitizeText(document.getElementById('gender').value),
        skills: sanitizeText(document.getElementById('skills').value).split(',').map((s) => s.trim()).filter(Boolean),
        interest: sanitizeText(document.getElementById('interest').value),
        experience: sanitizeText(document.getElementById('experience').value),
        reason: sanitizeText(document.getElementById('reason').value),
        _gotcha: document.querySelector('input[name="_gotcha"]')?.value || ''
      };

      if (photoInput?.files?.[0]) {
        payload.photoBase64 = await readFileAsBase64(photoInput.files[0]);
        payload.photoName = photoInput.files[0].name;
        payload.photoType = photoInput.files[0].type;
      }
      if (resumeInput?.files?.[0]) {
        payload.resumeBase64 = await readFileAsBase64(resumeInput.files[0]);
        payload.resumeName = resumeInput.files[0].name;
        payload.resumeType = resumeInput.files[0].type;
      }

      const response = await fetch(applyForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok && data.ok) {
        formStatus.style.color = '';
        formStatus.textContent = `Thanks, ${payload.fullName.split(' ')[0]} — your application is in. Your ID: ${data.registrationId || ''}`;
        applyForm.reset();
        photoPreview.hidden = true; resumePreview.hidden = true;
        photoPreview.innerHTML = ''; resumePreview.innerHTML = '';
      } else {
        formStatus.style.color = '#E8483A';
        formStatus.textContent = data.error || (data.errors && data.errors[0]) || 'Submission failed. Please try again.';
      }
    } catch (err) {
      formStatus.style.color = '#E8483A';
      formStatus.textContent = 'Submission failed. Please try again.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit application';
    }
  });
}

/* ===========================================================
   PREMIUM UPGRADE LAYER (additive — does not remove or alter
   any existing behavior above)
=========================================================== */

// ---------- exit-intent opt-in ----------
(function initExitOptin() {
  const storageKey = 'innopitch-exit-optin-shown';
  if (sessionStorage.getItem(storageKey) === '1') return;

  const backdrop = document.createElement('div');
  backdrop.className = 'exit-optin-backdrop';
  backdrop.innerHTML = `
    <div class="exit-optin-modal" role="dialog" aria-modal="true" aria-labelledby="exitOptinTitle">
      <button type="button" class="exit-optin-close" aria-label="Close">×</button>
      <p class="eyebrow">Stay in the loop</p>
      <h3 id="exitOptinTitle">Before you go, join the club updates</h3>
      <p>Get notified about events, workshops, and new opportunities from InnoPitch &amp; Greenovation Mavericks Club.</p>
      <form class="exit-optin-form">
        <label class="sr-only" for="exitOptinEmail">Email address</label>
        <input id="exitOptinEmail" name="email" type="email" placeholder="Enter your email" required>
        <button type="submit" class="btn btn-primary">Notify me</button>
      </form>
      <button type="button" class="exit-optin-skip">No thanks</button>
    </div>
  `;

  const modal = backdrop.querySelector('.exit-optin-modal');
  const form = backdrop.querySelector('.exit-optin-form');
  const emailInput = backdrop.querySelector('#exitOptinEmail');
  const closeBtn = backdrop.querySelector('.exit-optin-close');
  const skipBtn = backdrop.querySelector('.exit-optin-skip');
  let isDismissed = false;

  const closePopup = (persist = true, redirect = false) => {
    if (isDismissed) return;
    isDismissed = true;
    if (persist) {
      sessionStorage.setItem(storageKey, '1');
    }
    backdrop.classList.remove('is-visible');
    document.body.classList.remove('is-exit-optin-open');
    document.removeEventListener('mouseleave', handleMouseLeave);
    setTimeout(() => backdrop.remove(), 220);
    if (redirect) {
      window.location.href = 'index.html';
    }
  };

  const openPopup = () => {
    if (isDismissed || backdrop.classList.contains('is-visible') || document.body.classList.contains('is-transitioning')) return;
    document.body.classList.add('is-exit-optin-open');
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add('is-visible'));
    emailInput?.focus();
  };

  const finishOptin = () => {
    closePopup(true);
    window.location.href = 'index.html';
  };

  const handleMouseLeave = (event) => {
    if (event.clientY <= 0 || event.relatedTarget === null) {
      openPopup();
    }
  };

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closePopup(true, true);
  });
  closeBtn?.addEventListener('click', () => closePopup(true, true));
  skipBtn?.addEventListener('click', finishOptin);
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = emailInput?.value.trim() || '';
    if (!value) {
      emailInput?.focus();
      return;
    }
    finishOptin();
  });

  document.body.appendChild(backdrop);
  backdrop.hidden = true;

  document.addEventListener('mouseleave', handleMouseLeave);
})();

// ---------- page loader ----------
(function initLoader() {
  const loader = document.createElement('div');
  loader.className = 'page-loader';
  loader.innerHTML = '<span class="loader-mark" aria-hidden="true"></span>';
  document.body.prepend(loader);

  const hideLoader = () => {
    loader.classList.add('loaded');
    document.body.classList.add('page-ready');
    setTimeout(() => loader.remove(), 700);
  };
  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 150);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, 150));
  }
})();

// ---------- hero particle field ----------
(function initHeroParticles() {
  const host = document.querySelector('.hero-particle-layer');
  if (!host) return;

  const particleCount = window.innerWidth < 700 ? 28 : 46;
  for (let i = 0; i < particleCount; i += 1) {
    const p = document.createElement('span');
    p.className = 'hero-particle';
    const size = 2 + Math.random() * 7;
    const dx = `${(Math.random() - 0.5) * 220}px`;
    const dy = `${(Math.random() - 0.5) * 220}px`;
    const opacity = 0.16 + Math.random() * 0.48;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${Math.random() * 100}%`;
    p.style.setProperty('--dx', dx);
    p.style.setProperty('--dy', dy);
    p.style.setProperty('--opacity', String(opacity));
    p.style.setProperty('--duration', `${5 + Math.random() * 7}s`);
    host.appendChild(p);
  }
})();

// ---------- smooth page-leave transition for same-site links ----------
document.querySelectorAll('a[href$=".html"], a[href^="index.html"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const url = link.getAttribute('href');
    if (!url || link.target === '_blank' || event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    document.body.classList.add('is-transitioning');
    setTimeout(() => { window.location.href = url; }, 260);
  });
});

// ---------- aurora background blobs ----------
(function initAurora() {
  const wrap = document.createElement('div');
  wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML = '<span class="aurora-blob b1"></span><span class="aurora-blob b2"></span><span class="aurora-blob b3"></span>';
  document.body.prepend(...wrap.children);
})();

// ---------- cursor glow (fine pointers only) ----------
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  let glowX = window.innerWidth / 2;
  let glowY = window.innerHeight / 2;
  let targetX = glowX;
  let targetY = glowY;

  window.addEventListener('mousemove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    glow.classList.add('active');
  });
  window.addEventListener('mouseleave', () => glow.classList.remove('active'));

  const animateGlow = () => {
    glowX += (targetX - glowX) * 0.12;
    glowY += (targetY - glowY) * 0.12;
    glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;
    requestAnimationFrame(animateGlow);
  };
  requestAnimationFrame(animateGlow);
}

// ---------- directional scroll reveals (fade-up/left/right/scale/blur/rotate) ----------
(function initDirectionalReveals() {
  const autoTargets = document.querySelectorAll(
    '.section-head, .section-visual, .about-intro, .about-point, .detail-card, .leader-card, .team-card, .event-card, .member-card, .events-empty, .apply-inner, .hero-visual'
  );

  const patternBySelector = [
    ['.about-point:nth-child(odd)', 'fade-left'],
    ['.about-point:nth-child(even)', 'fade-right'],
    ['.detail-card:nth-child(odd)', 'fade-left'],
    ['.detail-card:nth-child(even)', 'fade-right'],
    ['.leader-card', 'fade-up'],
    ['.team-card', 'scale'],
    ['.event-card', 'blur'],
    ['.member-card', 'fade-up'],
    ['.section-visual', 'scale'],
    ['.section-head', 'blur'],
    ['.hero-visual', 'rotate'],
  ];

  autoTargets.forEach((el) => {
    if (el.dataset.reveal) return;
    const match = patternBySelector.find(([sel]) => el.matches(sel));
    el.dataset.reveal = match ? match[1] : 'fade-up';
  });

  // stagger siblings inside common grids
  document.querySelectorAll('.about-points, .detail-grid, .leader-grid, .team-grid, .event-list, .member-grid').forEach((grid) => {
    grid.classList.add('stagger-parent');
    Array.from(grid.children).forEach((child, i) => {
      child.style.setProperty('--stagger-i', String(i));
    });
  });

  const revealTargets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }
})();

// ---------- 3D tilt on cards ----------
(function initTilt() {
  const tiltSelectors = '.leader-card, .team-card, .event-card, .member-card, .detail-card, .about-point, .hero-card, .section-visual';
  const cards = document.querySelectorAll(tiltSelectors);
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  cards.forEach((card) => {
    card.classList.add('tilt-el');
    let rect = null;

    card.addEventListener('mouseenter', () => {
      rect = card.getBoundingClientRect();
    });

    card.addEventListener('mousemove', (event) => {
      if (!rect) rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      const rotateY = px * 10;
      const rotateX = py * -10;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.015)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      rect = null;
    });
  });
})();

// ---------- magnetic buttons ----------
(function initMagnetic() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const magnets = document.querySelectorAll('.btn, .nav-cta');

  magnets.forEach((el) => {
    let rect = null;
    el.addEventListener('mouseenter', () => { rect = el.getBoundingClientRect(); });
    el.addEventListener('mousemove', (event) => {
      if (!rect) rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      rect = null;
    });
  });
})();

// ---------- checkbox pill checked-state fallback ----------
document.querySelectorAll('.checkbox-pill').forEach((pill) => {
  const input = pill.querySelector('input[type="checkbox"]');
  if (!input) return;
  const sync = () => pill.classList.toggle('is-checked', input.checked);
  input.addEventListener('change', sync);
  sync();
});

// ---------- input focus glow ----------
document.querySelectorAll('.field input, .field textarea').forEach((input) => {
  const field = input.closest('.field');
  if (!field) return;
  input.addEventListener('focus', () => field.classList.add('field-active'));
  input.addEventListener('blur', () => field.classList.remove('field-active'));
});

// ---------- form success/error micro animation (hooks into existing formStatus element) ----------
(function initFormStatusAnimation() {
  const formStatus = document.getElementById('formStatus');
  if (!formStatus) return;
  const observer = new MutationObserver(() => {
    formStatus.classList.remove('is-success', 'is-error');
    if (!formStatus.textContent) return;
    if (formStatus.style.color && formStatus.style.color.includes('232, 72, 58')) {
      formStatus.classList.add('is-error');
    } else if (formStatus.textContent.toLowerCase().includes('thanks') && !formStatus.querySelector('.success-check')) {
      const check = document.createElement('span');
      check.className = 'success-check';
      check.textContent = '✓';
      check.setAttribute('aria-hidden', 'true');
      formStatus.prepend(check);
      formStatus.classList.add('is-success');
    }
  });
  observer.observe(formStatus, { childList: true, characterData: true, subtree: true });
})();

// ---------- nav scroll-spy (index page sections) ----------
(function initScrollSpy() {
  const links = document.querySelectorAll('.main-nav a[href^="#"]');
  if (!links.length) return;
  const sections = Array.from(links)
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if (!sections.length || !('IntersectionObserver' in window)) return;

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = document.querySelector(`.main-nav a[href="#${entry.target.id}"]`);
        if (!link || link.classList.contains('nav-cta')) return;
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
  );
  sections.forEach((sec) => spy.observe(sec));
})();

// ---------- toast notifications (surfaces the same success/error as a corner toast) ----------
(function initToasts() {
  const formStatus = document.getElementById('formStatus');
  if (!formStatus) return;

  const stack = document.createElement('div');
  stack.className = 'toast-stack';
  stack.setAttribute('aria-live', 'polite');
  document.body.appendChild(stack);

  const showToast = (message, tone) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-dot" style="background:${tone === 'error' ? '#E8483A' : '#34d399'}"></span><span></span>`;
    toast.querySelector('span:last-child').textContent = message;
    stack.appendChild(toast);
    setTimeout(() => toast.remove(), 4200);
  };

  let lastText = '';
  let debounce = null;
  const observer = new MutationObserver(() => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const text = formStatus.textContent.replace(/^✓\s*/, '').trim();
      if (!text || text === lastText) return;
      lastText = text;
      const isError = formStatus.style.color && formStatus.style.color.includes('232, 72, 58');
      showToast(text, isError ? 'error' : 'success');
    }, 60);
  });
  observer.observe(formStatus, { childList: true, characterData: true, subtree: true });
})();

// ---------- invalid-field shake on failed native validation ----------
(function initInvalidShake() {
  const form = document.getElementById('applyForm');
  if (!form) return;
  form.querySelectorAll('input, textarea').forEach((el) => {
    el.addEventListener('invalid', () => {
      const field = el.closest('.field');
      if (!field) return;
      field.classList.add('field-invalid');
      setTimeout(() => field.classList.remove('field-invalid'), 450);
    });
  });
})();

// ---------- preload the hero image for a faster first paint ----------
(function preloadHeroImage() {
  const heroImg = document.querySelector('.hero-visual img');
  if (!heroImg) return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = heroImg.currentSrc || heroImg.src;
  document.head.appendChild(link);
})();
