import type { Metadata } from 'next';
import { AuthProvider } from '../context/AuthContext';
// @ts-ignore
import './globals.css';

export const metadata: Metadata = {
  title: 'HisabDo',
  description: 'Financial Management App',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen w-full overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}