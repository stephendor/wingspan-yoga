import type { Metadata } from 'next';
import { Geist, Geist_Mono, Playfair_Display, Lato } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/ui/navigation';
import { Footer } from '@/components/ui/footer';
import { NextAuthProvider } from '@/components/auth/NextAuthProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

const lato = Lato({
  variable: '--font-lato',
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Wingspan Yoga - Transform Your Practice with Anna Dorman',
  description: 'Join Anna Dorman for trauma-informed, alignment-focused yoga classes. 15+ years experience, RYT-500 certified. Hatha, Vinyasa, and Restorative yoga in a safe, inclusive environment.',
};

const navigationItems = [
  { label: 'Home', href: '/' },
  { label: 'Meet Anna', href: '/instructor' },
  { label: 'Classes', href: '/classes' },
  { label: 'Membership', href: '/membership' },
  { label: 'Retreats', href: '/retreats' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
  // Only show E2E test page link in development
  ...(process.env.NODE_ENV === 'development' || process.env.E2E_TEST === 'true' ? [
    { label: 'E2E Test', href: '/e2e-test' }
  ] : []),
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${lato.variable} antialiased`}
      >
        <NextAuthProvider>
          <Navigation items={navigationItems} />
          {children}
          <Footer />
        </NextAuthProvider>
      </body>
    </html>
  );
}
