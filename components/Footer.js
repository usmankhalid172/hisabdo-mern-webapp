import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer" style={{ background: '#060d1a', padding: '40px 24px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--muted)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <p style={{ marginBottom: '16px', fontSize: '15px', color: '#e2e8f0', fontWeight: '600' }}>HisabDo: Khata &amp; Ledger</p>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
          <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Home</Link>
          <Link href="/about" style={{ color: 'var(--muted)', textDecoration: 'none' }}>About</Link>
          <Link href="/careers" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Careers</Link>
          <Link href="/blog" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Blog</Link>
          <Link href="/faq" style={{ color: 'var(--muted)', textDecoration: 'none' }}>FAQ</Link>
          <Link href="/contact" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Contact</Link>
          <Link href="/privacy-policy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacy Policy</Link>
        </div>
        <div className="social" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
          <a href="https://www.facebook.com/people/HisabDo-Udhar-Khata-App/61587841495265/" title="Facebook" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted)' }}><i className="fab fa-facebook-f"></i></a>
          <a href="https://www.instagram.com/hisabdo.app/" title="Instagram" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted)' }}><i className="fab fa-instagram"></i></a>
          <a href="https://www.linkedin.com/company/hisabdo-expense-management-app/" title="LinkedIn" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted)' }}><i className="fab fa-linkedin-in"></i></a>
          <a href="https://www.tiktok.com/@hisabdo_udhar_khata_app" title="TikTok" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted)' }}><i className="fab fa-tiktok"></i></a>
          <a href="https://www.youtube.com/channel/UCtYSl8MRwz-MK6ukBKZS9Rg" title="YouTube" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted)' }}><i className="fab fa-youtube"></i></a>
        </div>
        <p style={{ fontSize: '13px' }}>&copy; 2026 HisabDo. All rights reserved.</p>
      </div>
    </footer>
  );
}