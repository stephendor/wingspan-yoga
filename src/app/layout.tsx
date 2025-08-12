import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/ui/navigation';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Wingspan Yoga - Transform Your Practice with Anna Dorman',
  description: 'Join Anna Dorman for trauma-informed, alignment-focused yoga classes. 15+ years experience, RYT-500 certified. Hatha, Vinyasa, and Restorative yoga in a safe, inclusive environment.',
};

const navigationItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Meet Anna', href: '/instructor' },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Membership', href: '/membership' },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation items={navigationItems} />
        {children}
      </body>
    </html>
  );
}
