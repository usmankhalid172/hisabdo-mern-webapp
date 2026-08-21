// ── NAV LINKS (single source of truth) ──
const NAV_LINKS = [
  { href: 'index.html',             label: 'Home'           },
  { href: 'about.html',             label: 'About'          },
  { href: 'about-app.html',         label: 'App'            },
  { href: 'mian-usman-khalid.html',  label: 'Founder'        },
  { href: 'leadership.html',        label: 'Leadership'     },
  { href: 'blog.html',              label: 'Blog'           },
  { href: 'faq.html',               label: 'FAQ'            },
  { href: 'careers.html',           label: 'Careers'        },
  { href: 'media.html',              label: 'Media'          },
  { href: 'contact.html',           label: 'Contact'        },
  { href: 'privacy-policy.html',    label: 'Privacy Policy' },
];

const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.usman.hisabdo';

// ── ACTIVE PAGE DETECTION ──
function isActive(href) {
  const page = location.pathname.split('/').pop() || 'index.html';
  return page === href;
}

// ── PATH PREFIX (handles blog/ subfolder) ──
function rootPath() {
  const path = location.pathname;
  return path.includes('/blog/') ? '../' : '';
}

// ── INJECT NAVBAR ──
function injectNav() {
  const base = rootPath();
  const links = NAV_LINKS.map(l =>
    `<a href="${base}${l.href}"${isActive(l.href) ? ' class="active-nav" aria-current="page"' : ''}>${l.label}</a>`
  ).join('');

  document.getElementById('site-nav').innerHTML = `
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <header class="nav">
      <a class="logo" href="${base}index.html">
        <img src="${base}assets/images/app-logo.webp" alt="HisabDo">
        HisabDo
      </a>
      <button class="hamburger" id="hamburger" type="button" aria-label="Toggle menu" aria-controls="nav-menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <div class="nav-menu" id="nav-menu">
        <nav aria-label="Primary navigation">${links}</nav>
        <a class="btn btn-sm" href="${PLAY_URL}">
          <i class="fab fa-google-play"></i> Get App
        </a>
      </div>
    </header>`;

  // hamburger toggle
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('nav-menu');
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    navMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close the mobile menu with Escape for keyboard users.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navMenu.classList.contains('open')) {
      hamburger.classList.remove('open');
      navMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.focus();
    }
  });
  navMenu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    })
  );
}

// ── INJECT FOOTER ──
function injectFooter() {
  const base = rootPath();
  document.getElementById('site-footer').innerHTML = `
    <footer>
      <div class="footer-col">
        <a class="logo footer-logo" href="${base}index.html">
          <img src="${base}assets/images/app-logo.webp" alt="HisabDo">
          HisabDo
        </a>
        <p>Offline-first khata and ledger management for shopkeepers, freelancers and small businesses in Pakistan and beyond.</p>
        <p class="footer-copy">&copy; 2025 HisabDo. All rights reserved.</p>
      </div>
      <div class="footer-col">
        <h4>Explore</h4>
        <a href="${base}index.html">Home</a>
        <a href="${base}about-app.html">App</a>
        <a href="${base}mian-usman-khalid.html">Founder</a>
        <a href="${base}leadership.html">Leadership</a>
        <a href="${base}blog.html">Blog</a>
        <a href="${base}faq.html">FAQ</a>
        <a href="${base}careers.html">Careers</a>
        <a href="${base}media.html">Media</a>
      </div>
      <div class="footer-col">
        <h4>Legal</h4>
        <a href="${base}privacy-policy.html">Privacy Policy</a>
        <a href="${base}terms.html">Terms &amp; Conditions</a>
        <a href="${base}contact.html">Contact</a>
        <a href="${base}disclaimer.html">Disclaimer</a>
        <a href="mailto:support@hisabdo.app">Support</a>
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <a href="mailto:support@hisabdo.app"><i class="fas fa-envelope"></i> support@hisabdo.app</a>
        <a href="https://maps.google.com/?q=Pakistan"><i class="fas fa-map-marker-alt"></i> Pakistan</a>
        <a href="https://play.google.com/store/apps/details?id=com.usman.hisabdo"><i class="fab fa-google-play"></i> Google Play</a>
        <div class="social footer-social">
          <a href="https://www.facebook.com/people/HisabDo-Udhar-Khata-App/61587841495265/" title="Facebook"><i class="fab fa-facebook-f"></i></a>
          <a href="https://www.instagram.com/hisabdo.app/" title="Instagram"><i class="fab fa-instagram"></i></a>
          <a href="https://www.linkedin.com/company/hisabdo-expense-management-app/" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
          <a href="https://www.youtube.com/channel/UCtYSl8MRwz-MK6ukBKZS9Rg" title="YouTube"><i class="fab fa-youtube"></i></a>
          <a href="https://www.tiktok.com/@hisabdo_udhar_khata_app" title="TikTok"><i class="fab fa-tiktok"></i></a>
        </div>
        <p class="footer-copy">Version 1.1 &bull; Updated August 2026</p>
      </div>
    </footer>`;
}

injectNav();
injectFooter();

// ── COOKIE CONSENT ──
(function(){
  const path = location.pathname;
  const base = path.includes('/blog/') ? '../' : '';
  var s = document.createElement('script');
  s.src = base + 'js/cookie-consent.js';
  document.body.appendChild(s);
})();
