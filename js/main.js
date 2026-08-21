// ── Vercel Speed Insights ──
(function(){
  var s = document.createElement('script');
  s.src = '/_vercel/speed-insights/script.js';
  s.defer = true;
  document.head.appendChild(s);
})();

// ── Vercel Analytics ──
(function(){
  var s = document.createElement('script');
  s.src = '/_vercel/insights/script.js';
  s.defer = true;
  document.head.appendChild(s);
})();

const PAGE_META = {
  'index.html': {
    title: 'HisabDo - Smart Khata & Ledger App',
    description: 'Manage khata, udhar, expenses, receivables and customers with HisabDo. Offline-first finance software for Pakistan, India and small businesses.',
    canonical: 'https://hisabdo.app/',
    type: 'website',
    schemaType: 'WebSite'
  },
  'about.html': {
    title: 'About HisabDo - Offline-first Khata & Ledger App',
    description: 'Learn about HisabDo, the offline-first khata and ledger app built for shopkeepers, freelancers and small businesses.',
    canonical: 'https://hisabdo.app/about.html',
    type: 'article',
    schemaType: 'WebPage'
  },
  'about-app.html': {
    title: 'About HisabDo App - Offline Ledger & Expense Manager',
    description: 'Discover how HisabDo helps you manage khata, receivables, payables and PDF reports without needing constant internet access.',
    canonical: 'https://hisabdo.app/about-app.html',
    type: 'article',
    schemaType: 'SoftwareApplication'
  },
  'mian-usman-khalid.html': {
    title: 'Mian Usman Khalid - Founder & Author of HisabDo',
    description: 'Learn about Mian Usman Khalid, the founder and author behind HisabDo and the practical finance content published on the site.',
    canonical: 'https://hisabdo.app/mian-usman-khalid.html',
    type: 'profile',
    schemaType: 'Person'
  },
  'blog.html': {
    title: 'HisabDo Blog - Finance Tips, Accounting Guides & Business Advice',
    description: 'Explore practical articles on khata, small business accounting, expense tracking, budgeting and digital bookkeeping.',
    canonical: 'https://hisabdo.app/blog.html',
    type: 'website',
    schemaType: 'Blog'
  },
  'faq.html': {
    title: 'FAQ - HisabDo Help Center',
    description: 'Find answers about offline use, backups, PDF exports, customer management, Urdu support and more on HisabDo.',
    canonical: 'https://hisabdo.app/faq.html',
    type: 'website',
    schemaType: 'FAQPage'
  },
  'privacy-policy.html': {
    title: 'Privacy Policy - HisabDo',
    description: 'Read HisabDo’s privacy policy covering data collection, app permissions, offline storage, analytics and user rights.',
    canonical: 'https://hisabdo.app/privacy-policy.html',
    type: 'article',
    schemaType: 'WebPage'
  },
  'terms.html': {
    title: 'Terms & Conditions - HisabDo',
    description: 'Review the terms of use for HisabDo and understand your rights, responsibilities and service limitations.',
    canonical: 'https://hisabdo.app/terms.html',
    type: 'article',
    schemaType: 'WebPage'
  },
  'disclaimer.html': {
    title: 'Disclaimer - HisabDo',
    description: 'Read the HisabDo disclaimer for informational, financial and app usage guidance.',
    canonical: 'https://hisabdo.app/disclaimer.html',
    type: 'article',
    schemaType: 'WebPage'
  },
  'contact.html': {
    title: 'Contact HisabDo',
    description: 'Get in touch with HisabDo for support, business inquiries, partnerships or general questions.',
    canonical: 'https://hisabdo.app/contact.html',
    type: 'website',
    schemaType: 'ContactPage'
  },
  'how-to-manage-daily-khata.html': { title: 'How to Manage Daily Khata - HisabDo Blog', description: 'Learn practical habits and routines to keep your daily khata accurate, organized and easy to review.', canonical: 'https://hisabdo.app/blog/how-to-manage-daily-khata.html', type: 'article', schemaType: 'Article' },
  'digital-ledger-vs-paper-ledger.html': { title: 'Digital Ledger vs Paper Ledger - HisabDo Blog', description: 'Compare traditional paper ledgers with digital systems and discover why small businesses are switching.', canonical: 'https://hisabdo.app/blog/digital-ledger-vs-paper-ledger.html', type: 'article', schemaType: 'Article' },
  'expense-tracking-for-small-business.html': { title: 'Expense Tracking for Small Business - HisabDo Blog', description: 'Learn how to capture daily spending, reduce waste and improve cash flow for your small business.', canonical: 'https://hisabdo.app/blog/expense-tracking-for-small-business.html', type: 'article', schemaType: 'Article' },
  'personal-budget-planning.html': { title: 'Personal Budget Planning - HisabDo Blog', description: 'Build a realistic personal budget that covers essentials, savings goals and unexpected costs.', canonical: 'https://hisabdo.app/blog/personal-budget-planning.html', type: 'article', schemaType: 'Article' },
  'why-offline-finance-apps-are-better.html': { title: 'Why Offline Finance Apps Are Better - HisabDo Blog', description: 'Discover why offline-first finance apps outperform cloud-dependent tools for privacy and reliability.', canonical: 'https://hisabdo.app/blog/why-offline-finance-apps-are-better.html', type: 'article', schemaType: 'Article' },
  'money-management-tips.html': { title: 'Money Management Tips - HisabDo Blog', description: 'Practical money management tips to improve spending discipline, build savings and plan for the future.', canonical: 'https://hisabdo.app/blog/money-management-tips.html', type: 'article', schemaType: 'Article' },
  'best-khata-app-in-pakistan.html': { title: 'Best Khata App in Pakistan - HisabDo Blog', description: 'What to look for in a khata app for Pakistan — offline support, Urdu language, PDF export and privacy.', canonical: 'https://hisabdo.app/blog/best-khata-app-in-pakistan.html', type: 'article', schemaType: 'Article' },
  'bookkeeping-basics.html': { title: 'Bookkeeping Basics - HisabDo Blog', description: 'Learn the core principles of bookkeeping that make financial records more accurate and easier to maintain.', canonical: 'https://hisabdo.app/blog/bookkeeping-basics.html', type: 'article', schemaType: 'Article' },
  'freelancer-expense-tracking.html': { title: 'Freelancer Expense Tracking - HisabDo Blog', description: 'How freelancers can track invoices, client payments, subscriptions and business costs without confusion.', canonical: 'https://hisabdo.app/blog/freelancer-expense-tracking.html', type: 'article', schemaType: 'Article' },
  'business-finance-tips.html': { title: 'Business Finance Tips - HisabDo Blog', description: 'Simple, actionable business finance tips to improve cash flow awareness and recordkeeping discipline.', canonical: 'https://hisabdo.app/blog/business-finance-tips.html', type: 'article', schemaType: 'Article' },
  'customer-credit-management.html': { title: 'Customer Credit Management - HisabDo Blog', description: 'Use better habits and tools to track customer balances and reduce missed collections.', canonical: 'https://hisabdo.app/blog/customer-credit-management.html', type: 'article', schemaType: 'Article' },
  'pdf-reports-for-businesses.html': { title: 'PDF Reports for Businesses - HisabDo Blog', description: 'How professional PDF reports support trust, clarity and easier administration for small businesses.', canonical: 'https://hisabdo.app/blog/pdf-reports-for-businesses.html', type: 'article', schemaType: 'Article' },
  'shopkeeper-accounting-guide.html': { title: 'Shopkeeper Accounting Guide - HisabDo Blog', description: 'A practical accounting guide for shopkeepers — build a daily routine that fits the fast pace of retail.', canonical: 'https://hisabdo.app/blog/shopkeeper-accounting-guide.html', type: 'article', schemaType: 'Article' },
  'receivable-payable-explained.html': { title: 'Receivable & Payable Explained - HisabDo Blog', description: 'Understand the difference between accounts receivable and payable and how to manage both effectively.', canonical: 'https://hisabdo.app/blog/receivable-payable-explained.html', type: 'article', schemaType: 'Article' },
  'complete-guide-to-hisabdo.html': { title: 'Complete Guide to HisabDo - HisabDo Blog', description: 'A complete guide to HisabDo — customer management, expense tracking, PDF reports and backup.', canonical: 'https://hisabdo.app/blog/complete-guide-to-hisabdo.html', type: 'article', schemaType: 'Article' },
  'default': {
    title: 'HisabDo - Smart Khata & Ledger App',
    description: 'Offline-first financial management for small businesses, freelancers and everyday users.',
    canonical: 'https://hisabdo.app/',
    type: 'website',
    schemaType: 'WebPage'
  }
};

function setMetaTag(attr, key, value) {
  let tag = document.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.content = value;
}

function setCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
}

function getPageMeta() {
  const rawPath = (location.pathname || '/').replace(/^\/+|\/$/g, '');
  const pathKey = rawPath || 'index.html';
  const page = pathKey.split('/').pop() || 'index.html';
  const clean = pathKey === '' ? 'index.html' : pathKey;
  return PAGE_META[clean] || PAGE_META[page] || PAGE_META.default;
}

function addJsonLd(data) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

function applySeoMeta() {
  const meta = getPageMeta();
  document.title = meta.title;
  setMetaTag('name', 'description', meta.description);
  setMetaTag('property', 'og:title', meta.title);
  setMetaTag('property', 'og:description', meta.description);
  setMetaTag('property', 'og:type', meta.type || 'website');
  setMetaTag('property', 'og:url', meta.canonical);
  setMetaTag('property', 'og:image', 'https://hisabdo.app/assets/images/app-logo.webp');
  setMetaTag('property', 'og:site_name', 'HisabDo');
  setMetaTag('property', 'og:locale', 'en_US');
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', meta.title);
  setMetaTag('name', 'twitter:description', meta.description);
  setMetaTag('name', 'twitter:image', 'https://hisabdo.app/assets/images/app-logo.webp');
  setMetaTag('name', 'twitter:site', '@hisabdoapp');
  setMetaTag('name', 'twitter:creator', '@hisabdoapp');
  setCanonical(meta.canonical);
}

function applySchema() {
  const meta = getPageMeta();
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hisabdo.app/' },
      { '@type': 'ListItem', position: 2, name: meta.title, item: meta.canonical }
    ]
  };

  addJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'HisabDo',
    'url': 'https://hisabdo.app',
    'logo': 'https://hisabdo.app/assets/images/app-logo.webp',
    'sameAs': [
      'https://www.linkedin.com/company/hisabdo-expense-management-app/',
      'https://www.facebook.com/people/HisabDo-Udhar-Khata-App/61587841495265/'
    ],
    'founder': {
      '@type': 'Person',
      'name': 'Mian Usman Khalid'
    },
    'description': 'HisabDo is an offline-first khata and ledger app for shopkeepers, freelancers and small businesses.'
  });

  addJsonLd({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'HisabDo',
    'applicationCategory': 'FinanceApplication',
    'operatingSystem': 'Android',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'description': 'Offline-first khata and ledger app for small businesses, shopkeepers, freelancers and students.',
    'url': 'https://play.google.com/store/apps/details?id=com.usman.hisabdo',
    'publisher': {
      '@type': 'Organization',
      'name': 'HisabDo'
    }
  });

  addJsonLd({
    '@context': 'https://schema.org',
    '@type': meta.schemaType === 'Person' ? 'Person' : meta.schemaType === 'FAQPage' ? 'FAQPage' : 'WebPage',
    'name': meta.title,
    'url': meta.canonical,
    'description': meta.description,
    'publisher': {
      '@type': 'Organization',
      'name': 'HisabDo',
      'url': 'https://hisabdo.app'
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': meta.canonical
    }
  });

  addJsonLd(breadcrumb);

  if (meta.schemaType === 'FAQPage') {
    addJsonLd({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        { '@type': 'Question', 'name': 'What is HisabDo?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'HisabDo is a free offline-first khata and ledger app for Android that helps shopkeepers, freelancers and small business owners track money, customers and expenses.' } },
        { '@type': 'Question', 'name': 'Is HisabDo free?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes. HisabDo is free to download and use from Google Play.' } },
        { '@type': 'Question', 'name': 'Does HisabDo work offline?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes. HisabDo is built offline-first. All data is stored on your device and the app works fully without any internet connection.' } },
        { '@type': 'Question', 'name': 'Can I export PDF reports?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes. HisabDo lets you generate professional PDF statements for any customer account or time period and share them via WhatsApp or email.' } },
        { '@type': 'Question', 'name': 'Can I backup my data?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes. HisabDo includes a backup feature that lets you save your data to device storage, SD card or a cloud service of your choice.' } },
        { '@type': 'Question', 'name': 'Does HisabDo support Urdu?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes. HisabDo supports Urdu, English, Hindi, Arabic and Roman Urdu.' } },
        { '@type': 'Question', 'name': 'Who created HisabDo?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'HisabDo was created by Mian Usman Khalid, a Pakistani software engineer and entrepreneur.' } },
        { '@type': 'Question', 'name': 'Can I track receivables and payables?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes. HisabDo tracks both money customers owe you (receivables) and money you owe to others (payables).' } }
      ]
    });
  }
}

// ── Rounded Favicon ──
function setRoundedFavicon(src, radius) {
  radius = radius || 0.22;
  const img = new Image();
  img.onload = function () {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const r = size * radius;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(size, 0, size, size, r);
    ctx.arcTo(size, size, 0, size, r);
    ctx.arcTo(0, size, 0, 0, r);
    ctx.arcTo(0, 0, size, 0, r);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, 0, 0, size, size);
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = canvas.toDataURL('image/png');
    document.head.appendChild(link);
  };
  img.src = src;
}
// Resolve favicon path relative to root regardless of subfolder depth
const _faviconBase = location.pathname.includes('/blog/') ? '../' : '';
setRoundedFavicon(_faviconBase + 'assets/images/app-logo.webp');
applySeoMeta();
applySchema();

// ── Scroll Fade-Up Animations ──
const observer = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  }),
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);
document.querySelectorAll('.fade-up').forEach(el => {
  const rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight) {
    el.classList.add('visible');
  } else {
    observer.observe(el);
  }
});
