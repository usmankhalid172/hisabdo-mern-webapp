import Link from 'next/link';

export default function Navigation() {
    return (
        <nav style={{ padding: '20px 24px', background: '#060d1a', borderBottom: '1px solid rgba(34,197,94,.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ color: '#fff', fontWeight: 'bold', fontSize: '20px', textDecoration: 'none' }}>
                HisabDo
            </Link>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Link href="/about" style={{ color: '#cbd5e1', textDecoration: 'none' }}>About</Link>
                <Link href="/blog" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Blog</Link>
                <Link href="/careers" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Careers</Link>
                <Link href="/faq" style={{ color: '#cbd5e1', textDecoration: 'none' }}>FAQ</Link>
                <Link href="/contact" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Contact</Link>
            </div>
        </nav>
    );
}