// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Theme toggle with persistence
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');
if (savedTheme) root.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  if (next === 'dark') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', 'light');
  }
  localStorage.setItem('theme', next);
});

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Scroll progress bar
const progressBar = document.getElementById('progressBar');
function updateProgress() {
  const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  progressBar.style.width = scrolled + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });

// Active nav link on scroll
const sections = document.querySelectorAll('main section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');
function updateActiveNav() {
  let current = '';
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 120 && rect.bottom >= 120) current = section.id;
  });
  navLinkEls.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });

// Back to top button
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 600);
}, { passive: true });
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Typewriter effect
const roles = [
  'Site Reliability Engineer',
  'Incident Response Lead',
  'Kubernetes Troubleshooter',
  'AWS Cloud Operator',
  'Automation Builder'
];
const typewriterEl = document.getElementById('typewriter');
let roleIndex = 0, charIndex = 0, deleting = false;

function typeLoop() {
  const current = roles[roleIndex];
  if (!deleting) {
    charIndex++;
    typewriterEl.textContent = current.slice(0, charIndex);
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1800);
      return;
    }
  } else {
    charIndex--;
    typewriterEl.textContent = current.slice(0, charIndex);
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }
  setTimeout(typeLoop, deleting ? 40 : 70);
}
typeLoop();

// Animated counters. HTML already contains the correct final value in each element
// (e.g. "250+") so that content is accurate even if this script never runs; here we
// reset to the start value only at the moment we're actually about to animate it.
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'), 10);
  const prefix = el.getAttribute('data-prefix') || '';
  const suffix = el.getAttribute('data-suffix') || '';

  const finish = () => { el.textContent = prefix + target + suffix; };

  // Background/hidden tabs throttle requestAnimationFrame — skip straight to the final value.
  if (document.hidden) {
    finish();
    return;
  }

  el.textContent = prefix + '0' + suffix;
  const duration = 1400;
  const start = performance.now();
  let done = false;
  function tick(now) {
    if (done) return;
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + Math.round(eased * target) + suffix;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      done = true;
    }
  }
  requestAnimationFrame(tick);

  // Safety net: if the tab gets backgrounded mid-count, snap to final value once visible again.
  document.addEventListener('visibilitychange', function onVisible() {
    if (!document.hidden) {
      done = true;
      finish();
      document.removeEventListener('visibilitychange', onVisible);
    }
  });
}

// Scroll-reveal, counters, and skill bars are progressive enhancements layered on top of
// HTML that already shows correct, final content. Only opt into the JS-driven versions
// (which temporarily hide/zero things to animate them back in) when IntersectionObserver
// is actually available, so disabled/blocked/erroring JS never leaves content invisible.
if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('js-reveal-enabled');

  const revealTargets = document.querySelectorAll('.fade-up');
  const counters = document.querySelectorAll('[data-count]');
  const bars = document.querySelectorAll('.bar-fill');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.15 });
  revealTargets.forEach(el => observer.observe(el));

  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterObserver.observe(el));

  const barsObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        bars.forEach(bar => { bar.style.width = '0%'; });
        void bars[0].offsetWidth; // force reflow so 0% commits before animating to target
        requestAnimationFrame(() => {
          bars.forEach(bar => {
            bar.style.width = bar.getAttribute('data-width') + '%';
          });
        });
        obs.disconnect();
      }
    });
  }, { threshold: 0.3 });
  if (bars.length) barsObserver.observe(bars[0]);
}

// Radar chart for skills
function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function initRadarChart() {
  const canvas = document.getElementById('skillsRadar');
  if (!canvas || typeof Chart === 'undefined') return;
  const accent = getCSSVar('--accent') || '#44e0c4';
  const accent2 = getCSSVar('--accent-2') || '#7c9aff';
  const textMuted = getCSSVar('--text-muted') || '#9aa6c2';
  const border = getCSSVar('--border') || '#232f4d';

  new Chart(canvas, {
    type: 'radar',
    data: {
      labels: ['Incident Mgmt', 'Kubernetes', 'AWS Cloud', 'Observability', 'Automation', 'CI/CD'],
      datasets: [{
        label: 'Proficiency',
        data: [95, 88, 85, 90, 80, 78],
        backgroundColor: accent + '33',
        borderColor: accent,
        pointBackgroundColor: accent2,
        borderWidth: 2,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 1200, easing: 'easeOutQuart' },
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { display: false },
          grid: { color: border },
          angleLines: { color: border },
          pointLabels: { color: textMuted, font: { size: 11 } }
        }
      }
    }
  });
}

// Rendered immediately rather than lazily on scroll-into-view: a canvas-based chart with
// no <noscript> equivalent should not depend on a scroll observer to ever appear at all.
initRadarChart();
