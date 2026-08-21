import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'About HisabDo - Offline Khata & Ledger App',
  description: 'Learn how HisabDo helps shopkeepers, freelancers and small businesses manage khata, expenses, receivables and daily money records offline.',
};

export default function About() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="badge">📖 About HisabDo</div>
        <h1>Built for Practical Financial Tracking</h1>
        <p>HisabDo is an offline-first khata and ledger app created for shopkeepers, freelancers, small businesses and everyday users who need a simple way to manage money, customers and records.</p>
        <div className="hero-buttons">
          <a className="btn" href="https://play.google.com/store/apps/details?id=com.usman.hisabdo" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-google-play"></i> Download Free
          </a>
          <Link className="btn-outline" href="/contact">Contact Support</Link>
        </div>
      </section>

      {/* WHY IT EXISTS */}
      <section className="section">
        <div className="split fade-up">
          <div className="split-text">
            <div className="badge">Why It Exists</div>
            <h2>A digital alternative to paper khata</h2>
            <p>Many small businesses still rely on handwritten registers for daily payments, customer balances and expense tracking. HisabDo was built to bring that familiar process into a more organized, searchable and portable form without removing the simplicity that makes it useful.</p>
            <p>The app focuses on practical needs such as customer accounts, transaction history, receivables, payables, PDF statements and offline access.</p>
          </div>
          <div className="split-img">
            <Image src="/assets/images/dashboard.webp" alt="HisabDo dashboard" width={702} height={1600} style={{ width: '100%', height: 'auto' }} />
          </div>
        </div>
      </section>

      {/* WHAT THE APP HELPS WITH */}
      <section className="section" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(34,197,94,.04) 0%, transparent 70%)' }}>
        <h2 className="fade-up">What the App Helps With</h2>
        <div className="section-divider fade-up"></div>
        <div className="grid fade-up">
          <div className="card card-left"><h3>Daily Khata Management</h3><p>Record payments, dues and balances in a simple flow that fits daily business routines.</p></div>
          <div className="card card-left"><h3>Customer Records</h3><p>Keep customer history organized and easy to review when a balance needs follow-up.</p></div>
          <div className="card card-left"><h3>Expense Tracking</h3><p>Monitor income, expenses and outstanding amounts without needing complex accounting software.</p></div>
          <div className="card card-left"><h3>Reports and Statements</h3><p>Generate PDF statements and keep a clear overview of what has been paid and what remains outstanding.</p></div>
        </div>
      </section>

      {/* WHO USES HISABDO */}
      <section className="section" style={{ border: '1px solid rgba(34,197,94,.14)', background: 'rgba(34,197,94,.03)', borderRadius: '18px', padding: '32px 24px' }}>
        <h2 className="fade-up">Who Uses HisabDo?</h2>
        <div className="section-divider fade-up"></div>
        <div className="grid fade-up">
          <div className="card card-left"><h3>Shopkeepers</h3><p>Track daily sales, customer credit, and supplier payments in a reliable mobile ledger.</p></div>
          <div className="card card-left"><h3>Freelancers</h3><p>Keep project payments, receipts and expenses organized without needing a complex accounting tool.</p></div>
          <div className="card card-left"><h3>Home-Based Sellers</h3><p>Manage orders, customer balances and inventory costs from a simple, offline app.</p></div>
          <div className="card card-left"><h3>New Business Owners</h3><p>Build good financial habits early with clear records, reports and customer tracking.</p></div>
        </div>
      </section>

      {/* PRIVACY & TRUST */}
      <section className="section">
        <div className="split fade-up">
          <div className="split-text">
            <div className="badge">Privacy & Trust</div>
            <h2>Offline-first with optional signed-in features</h2>
            <p>HisabDo is designed around offline-first use. Core features can be used without an internet connection, and your records stay on your device by default. Optional signed-in features may support backup or sync when you choose to use them.</p>
            <p>We encourage users to review the Privacy Policy and Terms for full details on app behavior, data handling and third-party services.</p>
            <Link className="btn" href="/privacy-policy">Read Privacy Policy</Link>
          </div>
          <div className="split-img">
            <Image src="/assets/images/ledger.webp" alt="Ledger and backup concept" width={738} height={1600} style={{ width: '100%', height: 'auto' }} />
          </div>
        </div>
      </section>

      {/* LEARN MORE */}
      <section className="section">
        <h2 className="fade-up">Learn More</h2>
        <div className="section-divider fade-up"></div>
        <div className="grid fade-up">
          <div className="card"><h3>Founder</h3><p>Learn more about the person behind the project and the product vision.</p><Link className="btn-outline" href="/mian-usman-khalid">View Founder Profile</Link></div>
          <div className="card"><h3>FAQ</h3><p>Find answers about offline use, backups, reports, privacy and app support.</p><Link className="btn-outline" href="/faq">Read FAQs</Link></div>
          <div className="card"><h3>Contact</h3><p>Use the support page for feedback, questions, bug reports or feature requests.</p><Link className="btn-outline" href="/contact">Get in Touch</Link></div>
        </div>
      </section>
    </>
  );
}