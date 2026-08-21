import './globals.css';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export const metadata = {
    title: 'HisabDo - Smart Khata & Ledger App',
    description: 'Manage Khata, Udhar, Expenses, Receivables & Customers with a powerful offline-first digital ledger.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="stylesheet" href="/assets/css/style.css" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
            </head>
            <body>
                <Navigation />
                <main id="main-content">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}