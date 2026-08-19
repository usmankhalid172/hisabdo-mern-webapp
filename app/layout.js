import './globals.css';
import SiteShell from '../components/SiteShell';

export const metadata = {
  metadataBase: new URL('https://hisabdo.app'),
  title: 'HisabDo | Smart Khata & Ledger App',
  description: 'Offline-first khata and ledger management for small businesses.',
};

export default function RootLayout({ children }) {
  return <html lang="en"><body><SiteShell>{children}</SiteShell></body></html>;
}
