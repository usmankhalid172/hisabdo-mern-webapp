import Link from 'next/link';

export const metadata = {
  title: 'Contact HisabDo Support - Help, Inquiries & Partnerships',
  description: 'Get in touch with HisabDo for support, partnerships, questions about the app or help with your account and business needs.',
};

export default function Contact() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="badge">💬 Support &amp; Inquiries</div>
        <h1>Get in Touch</h1>
        <p>Have questions, feedback, or support needs? We are here to help you.</p>
      </section>

      {/* CONTACT CARDS */}
      <section className="section">
        <h2 className="fade-up">How to Reach Us</h2>
        <div className="section-divider fade-up"></div>
        <div className="grid fade-up" style={{ maxWidth: '860px', margin: '16px auto 0' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="contact-icon"><i className="fas fa-envelope"></i></div>
            <h3>Email Support</h3>
            <p style={{ marginBottom: '20px' }}>support@hisabdo.app</p>
            <a className="btn" href="mailto:support@hisabdo.app"><i className="fas fa-paper-plane"></i> Send Email</a>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="contact-icon"><i className="fab fa-google-play"></i></div>
            <h3>App Support</h3>
            <p style={{ marginBottom: '20px' }}>For Play Store issues, installation help and feedback</p>
            <a className="btn" href="https://play.google.com/store/apps/details?id=com.usman.hisabdo" target="_blank" rel="noopener noreferrer">Open App Page</a>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="contact-icon"><i className="fas fa-clock"></i></div>
            <h3>Response Time</h3>
            <p>Usually within <strong style={{ color: 'var(--green)' }}>24–48 hours</strong></p>
            <p style={{ marginTop: '8px' }}>We respond to every query personally, and we follow up until your issue is resolved.</p>
          </div>
        </div>
      </section>

      {/* WHAT WE CAN HELP WITH */}
      <section className="section" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(34,197,94,.04) 0%, transparent 70%)' }}>
        <h2 className="fade-up">What We Can Help With</h2>
        <div className="section-divider fade-up"></div>
        <div className="grid fade-up" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="card card-left"><h3>Getting Started</h3><p>Need help installing HisabDo, setting up your first customer, or saving your first PDF report? We can guide you step-by-step.</p></div>
          <div className="card card-left"><h3>Account & Backup</h3><p>Questions about backup, data sync, restoring records, or account issues are handled directly by our support team.</p></div>
          <div className="card card-left"><h3>Feedback & Features</h3><p>Have an idea for the app or want to share how HisabDo is helping your business? We welcome your suggestions.</p></div>
          <div className="card card-left"><h3>Partnerships</h3><p>For business inquiries, media requests, or educational partnerships, send us a message and we will respond promptly.</p></div>
        </div>
      </section>

      {/* FASTER REPLY */}
      <section className="section">
        <div className="card fade-up" style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 28px', textAlign: 'center' }}>
          <h3>Need a Faster Reply?</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '20px', lineHeight: '1.8' }}>Include your device model, Android version, and a short description of the issue when you write to us. This helps us resolve your request more quickly.</p>
          <a className="btn" href="mailto:support@hisabdo.app"><i className="fas fa-envelope"></i> Email Support Now</a>
        </div>
      </section>

      {/* NEED HELP */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="card fade-up" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', padding: '40px 32px' }}>
          <div className="contact-icon"><i className="fas fa-headset"></i></div>
          <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Need Help With the App?</h3>
          <p style={{ color: 'var(--muted)', lineHeight: '1.8', marginBottom: '24px' }}>If you are facing any issue in HisabDo related to ledger, customers, transactions, or backup — feel free to reach out. We continuously improve based on your feedback.</p>
          <a className="btn" href="mailto:support@hisabdo.app"><i className="fas fa-envelope"></i> Email Us</a>
        </div>
      </section>

      {/* SOCIAL */}
      <section className="section" style={{ paddingTop: '56px', paddingBottom: '56px' }}>
        <h2 className="fade-up">Follow Us</h2>
        <div className="section-divider fade-up"></div>
        <div className="social fade-up">
          <a href="https://www.facebook.com/people/HisabDo-Udhar-Khata-App/61587841495265/" title="Facebook" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
          <a href="https://www.instagram.com/hisabdo.app/" title="Instagram" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
          <a href="https://www.linkedin.com/company/hisabdo-expense-management-app/" title="LinkedIn" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>
          <a href="https://www.tiktok.com/@hisabdo_udhar_khata_app" title="TikTok" target="_blank" rel="noopener noreferrer"><i className="fab fa-tiktok"></i></a>
          <a href="https://www.youtube.com/channel/UCtYSl8MRwz-MK6ukBKZS9Rg" title="YouTube" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>
        </div>
      </section>

      {/* CTA */}
      <section className="hero" style={{ padding: '80px 24px' }}>
        <h2>We're Always Here to Help</h2>
        <p>Reach out anytime — we will get back to you as soon as possible.</p>
        <div className="hero-buttons">
          <a className="btn" href="mailto:support@hisabdo.app"><i className="fas fa-envelope"></i> Contact Support</a>
        </div>
      </section>
    </>
  );
}