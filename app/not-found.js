import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: '#fff' }}>
            <h2>404 - Page Not Found</h2>
            <p style={{ margin: '16px 0', color: 'var(--muted)' }}>
                The page you are looking for does not exist.
            </p>
            <Link href="/" className="btn">
                Return Home
            </Link>
        </div>
    );
}