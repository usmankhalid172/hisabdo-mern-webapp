<<<<<<< HEAD
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <Image src="/assets/images/app-logo.webp" className="hero-logo" alt="HisabDo Logo" width={768} height={768} priority />
        <div className="badge">📱 Smart Offline Financial Management</div>
        <h1>HisabDo: Khata &amp; Ledger</h1>
        <p>Manage Khata, Udhar, Expenses, Receivables &amp; Customers with a powerful offline-first digital ledger — built for shopkeepers, freelancers &amp; small businesses.</p>
        <div className="hero-buttons">
          <a className="btn" href="https://play.google.com/store/apps/details?id=com.usman.hisabdo" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-google-play"></i> Download Free
          </a>
          <Link className="btn-outline" href="/about-app">Learn More</Link>
        </div>
        <p style={{ marginTop: '12px', fontSize: '13.5px', color: 'var(--green)', fontWeight: '600' }}>
          📱 Available on Android
        </p>
        <p className="hero-note">🔒 Offline First &nbsp;•&nbsp; 📄 PDF Reports &nbsp;•&nbsp; ☁ Backup &amp; Restore</p>
      </section>

      {/* STARTUPBASE BADGES */}
      <section className="section" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          <a href="https://startupbase.io/products/hisabdo?utm_source=startupbase&utm_medium=badge&utm_campaign=featured-badge-light" target="_blank" rel="noopener noreferrer">
            <img src="https://statics.startupbase.io/site/badges/featured-on-sb.svg" alt="Featured on StartupBase" style={{ height: '52px', width: 'auto' }} loading="lazy" decoding="async" />
          </a>
          <a href="https://startupbase.io/products/hisabdo?utm_source=startupbase&utm_medium=badge&utm_campaign=launch-badge-light" target="_blank" rel="noopener noreferrer">
            <img src="https://statics.startupbase.io/site/badges/launched-on-sb.svg" alt="Launched on StartupBase" style={{ height: '52px', width: 'auto' }} loading="lazy" decoding="async" />
          </a>
        </div>
      </section>

      {/* STATS */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: '60px' }}>
        <div className="stats fade-up">
          <div className="stat-item"><strong>5+</strong><span>Languages Supported</span></div>
          <div className="stat-item"><strong>3</strong><span>Currencies (PKR, USD, INR)</span></div>
          <div className="stat-item"><strong>Offline-first</strong><span>Built for low-connectivity use</span></div>
        </div>
      </section>

      {/* ABOUT / SPLIT */}
      <section className="section">
        <div className="split fade-up">
          <div className="split-text">
            <div className="badge">Built For Modern Businesses</div>
            <h2>Replace Your Paper Khata With a Smarter System</h2>
            <p>HisabDo is designed to replace traditional paper registers with a modern, organized digital ledger. Core records work locally on your device, and optional signed-in features can support backup or sync when you choose to use them.</p>
            <ul className="split-list">
              <li>Track money given and received in real time</li>
              <li>Manage customers and their complete history</li>
              <li>Export professional PDF reports anytime</li>
              <li>Works fully offline — no internet needed</li>
            </ul>
            <Link className="btn" href="/about-app">Explore Features</Link>
          </div>
          <div className="split-img">
            <Image src="/assets/images/dashboard.webp" alt="HisabDo Dashboard" width={702} height={1600} style={{ width: '100%', height: 'auto' }} />
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section className="section" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(34,197,94,.04) 0%, transparent 70%)' }}>
        <h2 className="fade-up">Everything You Need</h2>
        <div className="section-divider fade-up"></div>
        <p className="section-sub fade-up">A complete toolkit for managing your business finances — offline, secure and easy to use.</p>
        <div className="grid fade-up">
          <div className="card card-left"><div className="card-icon"><i className="fas fa-book"></i></div><h3>Khata &amp; Ledger</h3><p>Track every transaction — money given and received — with detailed records.</p></div>
          <div className="card card-left"><div className="card-icon"><i className="fas fa-users"></i></div><h3>Customer Management</h3><p>Add customers, manage balances and view complete financial histories.</p></div>
          <div className="card card-left"><div className="card-icon"><i className="fas fa-chart-line"></i></div><h3>Analytics</h3><p className="screenshot-caption">Visual insights into business performance.</p><p>Understand your business performance with clear visual insights.</p></div>
          <div className="card card-left"><div className="card-icon"><i className="fas fa-file-pdf"></i></div><h3>PDF Export</h3><p>Create professional reports and transaction statements instantly.</p></div>
          <div className="card card-left"><div className="card-icon"><i className="fas fa-microphone"></i></div><h3>Voice Entry</h3><p className="screenshot-caption">Quick transaction entry using voice input.</p><p>Create records faster with built-in voice input support.</p></div>
          <div className="card card-left"><div className="card-icon"><i className="fas fa-cloud-upload-alt"></i></div><h3>Backup &amp; Restore</h3><p>Protect your business records and restore them anytime.</p></div>
        </div>
      </section>

      {/* SCREENSHOTS */}
      <section className="section">
        <h2 className="fade-up">Application Screens</h2>
        <div className="section-divider fade-up"></div>
        <div className="grid fade-up">
          <div className="card"><Image src="/assets/images/dashboard.webp" alt="Dashboard" width={702} height={1600} style={{ width: '100%', height: 'auto' }} /><h3>Dashboard</h3><p className="screenshot-caption">Overview of balances and daily activity.</p></div>
          <div className="card"><Image src="/assets/images/customer.webp" alt="Customers" width={590} height={1280} style={{ width: '100%', height: 'auto' }} /><h3>Customers</h3><p className="screenshot-caption">Customer records and outstanding balances.</p></div>
          <div className="card"><Image src="/assets/images/transaction.webp" alt="Transactions" width={590} height={1280} style={{ width: '100%', height: 'auto' }} /><h3>Transactions</h3><p className="screenshot-caption">Review money received, paid and recorded.</p></div>
          <div className="card"><Image src="/assets/images/analytics.webp" alt="Analytics" width={702} height={1600} style={{ width: '100%', height: 'auto' }} /><h3>Analytics</h3></div>
          <div className="card"><Image src="/assets/images/ledger.webp" alt="Ledger" width={738} height={1600} style={{ width: '100%', height: 'auto' }} /><h3>Ledger</h3><p className="screenshot-caption">Detailed customer and transaction history.</p></div>
          <div className="card"><Image src="/assets/images/voice-entry.webp" alt="Voice Entry" width={702} height={1600} style={{ width: '100%', height: 'auto' }} /><h3>Voice Entry</h3><p className="screenshot-caption">Quick transaction entry using voice input.</p></div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="section">
        <h2 className="fade-up">Why Choose HisabDo?</h2>
        <div className="section-divider fade-up"></div>
        <div className="grid fade-up">
          <div className="card"><h3>🔒 Offline First</h3><p>Core features work without internet, which helps in low-connectivity environments.</p></div>
          <div className="card"><h3>📄 PDF Export</h3><p>Create professional reports instantly.</p></div>
          <div className="card"><h3>☁ Backup &amp; Restore</h3><p>Protect important business records.</p></div>
          <div className="card"><h3>🌍 Multi Language</h3><p>Urdu, English, Hindi, Arabic &amp; Roman Urdu.</p></div>
          <div className="card"><h3>💱 Multi Currency</h3><p>PKR, USD and INR support.</p></div>
          <div className="card"><h3>🎤 Voice Entry</h3><p>Create records faster using voice support.</p></div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="section">
        <h2 className="fade-up">Meet The Founder</h2>
        <div className="section-divider fade-up"></div>
        <div className="split fade-up" style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div className="split-img">
            <Image src="/assets/images/founder.webp" alt="Mian Usman Khalid" width={768} height={1024} style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', aspectRatio: '3/4', height: 'auto' }} />
          </div>
          <div className="split-text">
            <div className="badge">👤 Founder &amp; CEO</div>
            <h2>Mian Usman Khalid</h2>
            <p className="founder-title">Software Engineer &nbsp;•&nbsp; Entrepreneur &nbsp;•&nbsp; Youth Leader</p>
            <p>Founder &amp; CEO of HisabDo, focused on building practical technology solutions for businesses and individuals across Pakistan and beyond.</p>
            <br />
            <Link className="btn" href="/mian-usman-khalid">View Full Profile</Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section">
        <h2 className="fade-up">Practical Tools for Shopkeepers, Freelancers & Small Business Owners</h2>
        <div className="section-divider fade-up"></div>
        <p className="section-sub fade-up">A simple way to track khata, expenses, customers and receivables without relying on a complicated setup.</p>
        <div className="grid fade-up">
          <div className="card review-card">
            <div className="blog-meta">Use Case</div>
            <h3>Daily khata tracking</h3>
            <p>Useful for shopkeepers who want a more organized record of payments, dues and balances without relying entirely on paper.</p>
          </div>
          <div className="card review-card">
            <div className="blog-meta">Use Case</div>
            <h3>Freelance expense tracking</h3>
            <p>Helpful for freelancers who need a simple way to record income, expenses and client balances in one place.</p>
          </div>
          <div className="card review-card">
            <div className="blog-meta">Use Case</div>
            <h3>Small business recordkeeping</h3>
            <p>Supports day-to-day tracking for businesses that want cleaner records and faster statement sharing.</p>
          </div>
        </div>
      </section>

      {/* DOWNLOAD STATS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="stat-grid fade-up">
          <div className="stat-card"><strong>Offline-first</strong><span>Built for local use and low-connectivity environments</span></div>
          <div className="stat-card"><strong>5+</strong><span>Languages supported</span></div>
          <div className="stat-card"><strong>3</strong><span>Currencies supported</span></div>
          <div className="stat-card"><strong>24/7</strong><span>Local access and backup</span></div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="fade-up">Frequently Asked Questions</h2>
        <div className="section-divider fade-up"></div>
        <div className="faq-list fade-up">
          <details className="faq-item">
            <summary>Is HisabDo free to use?</summary>
            <p>Yes. The app is available as a free download and is designed to help individuals and business owners manage everyday finances without unnecessary friction.</p>
          </details>
          <details className="faq-item">
            <summary>Does it work without the internet?</summary>
            <p>Absolutely. HisabDo is built to work offline so your records stay available even in low-connectivity situations.</p>
          </details>
          <details className="faq-item">
            <summary>Can I export reports?</summary>
            <p>Yes. You can generate PDF reports for transactions, balances and customer activity when you need a professional record.</p>
          </details>
        </div>
        <div className="hero-buttons" style={{ marginTop: '24px' }}>
          <Link className="btn-outline" href="/faq">Read More FAQs</Link>
        </div>
      </section>

      {/* WHO SHOULD USE */}
      <section className="section">
        <h2 className="fade-up">Who Should Use HisabDo?</h2>
        <div className="section-divider fade-up"></div>
        <div className="tag-grid fade-up">
          <span className="tag">Shopkeepers</span>
          <span className="tag">Freelancers</span>
          <span className="tag">Students</span>
          <span className="tag">Small Businesses</span>
          <span className="tag">Home-Based Sellers</span>
          <span className="tag">Service Providers</span>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <h2 className="fade-up">How It Works</h2>
        <div className="section-divider fade-up"></div>
        <div className="grid fade-up">
          <div className="card"><div className="card-icon"><i className="fas fa-user-plus"></i></div><h3>1. Add Customers</h3><p>Start by creating customer profiles and keeping their dues organized from day one.</p></div>
          <div className="card"><div className="card-icon"><i className="fas fa-money-bill-wave"></i></div><h3>2. Record Transactions</h3><p>Track money given, money received, expenses and balances in a simple journal flow.</p></div>
          <div className="card"><div className="card-icon"><i className="fas fa-file-pdf"></i></div><h3>3. Export Reports</h3><p>Generate clean PDF summaries whenever you need a business-ready record or statement.</p></div>
          <div className="card"><div className="card-icon"><i className="fas fa-shield-alt"></i></div><h3>4. Stay Secure</h3><p>Protect sensitive financial data locally and restore it whenever needed with trusted backups.</p></div>
        </div>
      </section>

      {/* LATEST BLOG POSTS */}
      <section className="section">
        <h2 className="fade-up">Latest Blog Posts</h2>
        <div className="section-divider fade-up"></div>
        <div className="grid fade-up">
          <div className="card"><div className="blog-meta">Guide</div><h3>How to Manage Daily Khata</h3><p>A practical guide for keeping your daily ledger accurate and easy to follow.</p><Link className="btn-outline" href="/blog/how-to-manage-daily-khata">Read Article</Link></div>
          <div className="card"><div className="blog-meta">Comparison</div><h3>Digital Ledger vs Paper Ledger</h3><p>Understand the advantages of switching from manual records to a smarter digital process.</p><Link className="btn-outline" href="/blog/digital-ledger-vs-paper-ledger">Read Article</Link></div>
          <div className="card"><div className="blog-meta">Guide</div><h3>Expense Tracking for Small Business</h3><p>Learn how to capture daily spending, spot waste and improve cash flow with confidence.</p><Link className="btn-outline" href="/blog/expense-tracking-for-small-business">Read Article</Link></div>
        </div>
      </section>

      {/* BUSINESS CATEGORIES */}
      <section className="section">
        <h2 className="fade-up">Built for Many Business Types</h2>
        <div className="section-divider fade-up"></div>
        <div className="tag-grid fade-up">
          <span className="tag">Retail Stores</span>
          <span className="tag">Grocery Shops</span>
          <span className="tag">Wholesale Businesses</span>
          <span className="tag">Service Providers</span>
          <span className="tag">Freelance Teams</span>
          <span className="tag">Small Clinics</span>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="fade-up">Trusted for Everyday Finance</h2>
        <div className="section-divider fade-up"></div>
        <div className="tag-grid fade-up">
          <span className="tag"><i className="fas fa-lock"></i> Secure Local Storage</span>
          <span className="tag"><i className="fas fa-mobile-alt"></i> Mobile Friendly</span>
          <span className="tag"><i className="fas fa-file-pdf"></i> PDF Export</span>
          <span className="tag"><i className="fas fa-globe"></i> Multi-Region Support</span>
        </div>
      </section>

      {/* CTA */}
      <section className="hero" style={{ padding: '80px 24px' }}>
        <div className="badge">🚀 Available on Google Play</div>
        <h2>Ready To Manage Your Finances Smarter?</h2>
        <p>Download HisabDo today — free, offline and built for your business.</p>
        <div className="hero-buttons">
          <a className="btn" href="https://play.google.com/store/apps/details?id=com.usman.hisabdo" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-google-play"></i> Download Now — Free
          </a>
        </div>
      </section>

      {/* SOCIAL */}
      <section className="section" style={{ paddingTop: '56px', paddingBottom: '56px' }}>
        <h2 className="fade-up">Follow HisabDo</h2>
        <div className="section-divider fade-up"></div>
        <div className="social fade-up">
          <a href="https://www.facebook.com/people/HisabDo-Udhar-Khata-App/61587841495265/" title="Facebook" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
          <a href="https://www.instagram.com/hisabdo.app/" title="Instagram" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
          <a href="https://www.linkedin.com/company/hisabdo-expense-management-app/" title="LinkedIn" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>
          <a href="https://www.tiktok.com/@hisabdo_udhar_khata_app" title="TikTok" target="_blank" rel="noopener noreferrer"><i className="fab fa-tiktok"></i></a>
          <a href="https://www.youtube.com/channel/UCtYSl8MRwz-MK6ukBKZS9Rg" title="YouTube" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>
        </div>
      </section>
    </>
  );
}
=======
export default function Home() {
  return (
    <section className="hero">
      <h1>Welcome to HisabDo</h1>
      <p>
        {/*
          TODO: Replace this placeholder with the actual content
          from index.html once it is available in the repo.
        */}
        Track your hisab (accounts) simply and quickly.
      </p>
    </section>
  );
}
>>>>>>> 77a6bbef670ea34c632d614aad094a8b51ad4a59
