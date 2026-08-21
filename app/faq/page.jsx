import Link from 'next/link';

export const metadata = {
  title: 'HisabDo FAQ - Offline App Help & Common Questions',
  description: 'Find clear answers about HisabDo offline use, backups, PDF exports, customer management, Urdu support, privacy and more.',
};

export default function FAQ() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="badge">❓ Help Center</div>
        <h1>Frequently Asked Questions</h1>
        <p>Everything you need to know about HisabDo — from getting started to advanced features, privacy and support.</p>
      </section>

      {/* FAQ CONTENT */}
      <section className="section">
        <div className="faq-list fade-up" style={{ maxWidth: '860px', margin: '0 auto' }}>

          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>
            30 questions answered. Can't find what you need? <Link href="/contact" style={{ color: 'var(--green)' }}>Contact us</Link>.
          </p>

          {/* GENERAL */}
          <h2 style={{ fontSize: '18px', color: 'var(--green)', margin: '8px 0 12px', textAlign: 'left' }}>General</h2>

          <details className="faq-item">
            <summary>What is HisabDo?</summary>
            <p>HisabDo is a free offline-first khata and ledger app for Android. It helps shopkeepers, freelancers and small business owners track money given, money received, customer balances, expenses and generate PDF reports — all without needing an internet connection.</p>
          </details>

          <details className="faq-item">
            <summary>Is HisabDo free to use?</summary>
            <p>Yes. HisabDo is free to download and use from Google Play. Core features including khata management, customer accounts, PDF export and backup are available at no cost.</p>
          </details>

          <details className="faq-item">
            <summary>Who created HisabDo?</summary>
            <p>HisabDo was created by Mian Usman Khalid, a Pakistani software engineer and entrepreneur. He built the app to address the gap between enterprise financial tools and the practical needs of small shopkeepers and business owners across Pakistan and South Asia.</p>
          </details>

          <details className="faq-item">
            <summary>Who is HisabDo designed for?</summary>
            <p>HisabDo is designed for shopkeepers, freelancers, small business owners, home-based sellers, service providers and students — anyone who needs a simple, reliable way to track money, customers and expenses.</p>
          </details>

          <details className="faq-item">
            <summary>Where can I download HisabDo?</summary>
            <p>HisabDo is available on Google Play. Search for "HisabDo" or use the download link on this website. It is available for free on Android devices.</p>
          </details>

          {/* FEATURES */}
          <h2 style={{ fontSize: '18px', color: 'var(--green)', margin: '32px 0 12px', textAlign: 'left' }}>Features</h2>

          <details className="faq-item">
            <summary>Does HisabDo work without the internet?</summary>
            <p>Yes. HisabDo is built offline-first. All your data is stored on your device and the app works fully without any internet connection. This makes it reliable in areas with poor connectivity and ensures your records are always accessible.</p>
          </details>

          <details className="faq-item">
            <summary>Can I manage customers in HisabDo?</summary>
            <p>Yes. You can create individual profiles for each customer with their name and contact details. Each customer has their own transaction history and running balance, so you can instantly see what they owe or have paid.</p>
          </details>

          <details className="faq-item">
            <summary>Can I track receivables (money owed to me)?</summary>
            <p>Yes. HisabDo tracks money that customers owe you with a complete history of each transaction and the current outstanding balance. You can see all outstanding receivables at a glance.</p>
          </details>

          <details className="faq-item">
            <summary>Can I track payables (money I owe)?</summary>
            <p>Yes. HisabDo also tracks money you owe to suppliers or others, giving you a complete picture of your financial obligations alongside your receivables.</p>
          </details>

          <details className="faq-item">
            <summary>Can I export PDF reports?</summary>
            <p>Yes. HisabDo lets you generate professional PDF statements for any customer account or time period. You can share them via WhatsApp, email or any messaging app directly from your phone — no additional software needed.</p>
          </details>

          <details className="faq-item">
            <summary>Does HisabDo support voice entry?</summary>
            <p>Yes. HisabDo includes voice entry support so you can create records by speaking rather than typing. This is especially useful in busy environments where typing is slow or disruptive.</p>
          </details>

          <details className="faq-item">
            <summary>Does HisabDo have analytics?</summary>
            <p>Yes. HisabDo provides visual analytics showing your income trends, expense patterns and outstanding balances. These insights help you understand your financial health without manual calculation.</p>
          </details>

          <details className="faq-item">
            <summary>Can I add notes to transactions?</summary>
            <p>Yes. You can add descriptive notes to any transaction entry, making your records more useful when you review them later or share them with others.</p>
          </details>

          {/* LANGUAGE & CURRENCY */}
          <h2 style={{ fontSize: '18px', color: 'var(--green)', margin: '32px 0 12px', textAlign: 'left' }}>Language &amp; Currency</h2>

          <details className="faq-item">
            <summary>Does HisabDo support Urdu?</summary>
            <p>Yes. HisabDo supports Urdu, English, Hindi, Arabic and Roman Urdu. You can switch between languages in the app settings at any time.</p>
          </details>

          <details className="faq-item">
            <summary>Does HisabDo support English?</summary>
            <p>Yes. English is one of the supported languages. The app interface can be used in English alongside Urdu, Hindi, Arabic and Roman Urdu.</p>
          </details>

          <details className="faq-item">
            <summary>Which currencies does HisabDo support?</summary>
            <p>HisabDo supports Pakistani Rupee (PKR), US Dollar (USD) and Indian Rupee (INR). You can select your preferred currency in the app settings.</p>
          </details>

          {/* DATA & BACKUP */}
          <h2 style={{ fontSize: '18px', color: 'var(--green)', margin: '32px 0 12px', textAlign: 'left' }}>Data &amp; Backup</h2>

          <details className="faq-item">
            <summary>Can I backup my data?</summary>
            <p>Yes. HisabDo includes a backup feature that lets you save your data to your device storage, SD card or a cloud service of your choice. Regular backups protect your records from device loss or damage.</p>
          </details>

          <details className="faq-item">
            <summary>Can I restore a backup?</summary>
            <p>Yes. If you have created a backup, you can restore it to any Android device running HisabDo. This is useful when changing phones or recovering from a device problem.</p>
          </details>

          <details className="faq-item">
            <summary>Does HisabDo require cloud storage?</summary>
            <p>No. HisabDo does not require cloud storage. Core data is stored locally on your device, and optional signed-in features may support backup or sync when you choose to enable them.</p>
          </details>

          <details className="faq-item">
            <summary>What happens to my data if I uninstall the app?</summary>
            <p>If you uninstall HisabDo without creating a backup first, your local data may be lost. We strongly recommend creating a backup before uninstalling or changing devices.</p>
          </details>

          {/* PRIVACY & SECURITY */}
          <h2 style={{ fontSize: '18px', color: 'var(--green)', margin: '32px 0 12px', textAlign: 'left' }}>Privacy &amp; Security</h2>

          <details className="faq-item">
            <summary>How secure is my data in HisabDo?</summary>
            <p>HisabDo is designed around local storage and offline-first use. Core data is stored on your device, and optional signed-in features may use cloud services for backup or sync when you choose to enable them. Security also depends on your device protection, so we recommend using a device PIN or biometric lock and keeping regular backups.</p>
          </details>

          <details className="faq-item">
            <summary>Does HisabDo share my financial data with third parties?</summary>
            <p>No. HisabDo does not sell or share your personal financial records with third parties for advertising or commercial purposes. Your khata data stays on your device.</p>
          </details>

          <details className="faq-item">
            <summary>Does HisabDo collect personal information?</summary>
            <p>HisabDo primarily processes information you enter directly in the app. Depending on how you use it, limited account or technical data may be handled by service providers such as Supabase, Google Play Services or advertising partners. See our Privacy Policy for full details.</p>
          </details>

          <details className="faq-item">
            <summary>Is HisabDo suitable for children?</summary>
            <p>HisabDo is not intended for children under the age of 13. The app is designed for business and personal finance management by adults and older teenagers.</p>
          </details>

          {/* DEVICE & PLATFORM */}
          <h2 style={{ fontSize: '18px', color: 'var(--green)', margin: '32px 0 12px', textAlign: 'left' }}>Device &amp; Platform</h2>

          <details className="faq-item">
            <summary>Is HisabDo available on Android?</summary>
            <p>Yes. HisabDo is available for Android devices and can be downloaded from Google Play. It is compatible with most modern Android smartphones and tablets.</p>
          </details>

          <details className="faq-item">
            <summary>Is HisabDo available on iOS (iPhone)?</summary>
            <p>Currently HisabDo is available on Android only. iOS support may be considered in future development. Follow our social media channels for updates.</p>
          </details>

          <details className="faq-item">
            <summary>What Android version is required?</summary>
            <p>HisabDo is compatible with Android 6.0 and above. For the best experience, we recommend using a device running Android 8.0 or later.</p>
          </details>

          {/* SUPPORT */}
          <h2 style={{ fontSize: '18px', color: 'var(--green)', margin: '32px 0 12px', textAlign: 'left' }}>Support</h2>

          <details className="faq-item">
            <summary>How do I contact HisabDo support?</summary>
            <p>You can reach us at <a href="mailto:support@hisabdo.app" style={{ color: 'var(--green)' }}>support@hisabdo.app</a> or through our <Link href="/contact" style={{ color: 'var(--green)' }}>Contact page</Link>. We aim to respond within 48 hours.</p>
          </details>

          <details className="faq-item">
            <summary>How do I report a bug or suggest a feature?</summary>
            <p>Send your bug reports or feature suggestions to <a href="mailto:support@hisabdo.app" style={{ color: 'var(--green)' }}>support@hisabdo.app</a>. We review all feedback and use it to improve the app.</p>
          </details>

          <details className="faq-item">
            <summary>Where can I follow HisabDo for updates?</summary>
            <p>Follow HisabDo on Facebook, Instagram, LinkedIn, YouTube and TikTok for the latest updates, tips and announcements. Links are available in the footer of this website.</p>
          </details>

        </div>
      </section>

      {/* CTA */}
      <section className="hero" style={{ padding: '80px 24px' }}>
        <div className="badge">🚀 Available on Google Play</div>
        <h2>Ready to Get Started?</h2>
        <p>Download HisabDo free and start managing your finances smarter today.</p>
        <div className="hero-buttons">
          <a className="btn" href="https://play.google.com/store/apps/details?id=com.usman.hisabdo" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-google-play"></i> Download Free
          </a>
          <Link className="btn-outline" href="/contact">Contact Support</Link>
        </div>
      </section>
    </>
  );
}