import Link from 'next/link';

const links = [['/', 'Home'], ['/about', 'About'], ['/about-app', 'App'], ['/founder', 'Founder'], ['/leadership', 'Leadership'], ['/media', 'Media']];

export default function SiteShell({ children }) {
  return <>
    <header className="site-nav">
      <Link className="brand" href="/"><img src="/assets/images/app-logo.png" alt="" />HisabDo<span>.</span></Link>
      <nav aria-label="Main navigation">{links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</nav>
      <a className="nav-cta" href="https://play.google.com/store/apps/details?id=com.usman.hisabdo">Get the app</a>
    </header>
    {children}
    <footer className="site-footer">
      <div><Link className="brand" href="/"><img src="/assets/images/app-logo.png" alt="" />HisabDo<span>.</span></Link><p>Offline-first finance tools for the businesses that keep communities moving.</p></div>
      <div><strong>Explore</strong><Link href="/about">About HisabDo</Link><Link href="/about-app">The app</Link><Link href="/leadership">Leadership</Link></div>
      <div><strong>Contact</strong><a href="mailto:support@hisabdo.app">support@hisabdo.app</a><Link href="/media">Press &amp; media</Link></div>
      <small>© 2026 HisabDo. All rights reserved.</small>
    </footer>
  </>;
}
