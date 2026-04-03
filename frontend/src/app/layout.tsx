import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/layout/AuthProvider';

export const metadata: Metadata = {
  title: 'Dating02 - Find Your Perfect Companion',
  description: 'A companion marketplace and dating platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
