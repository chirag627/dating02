'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

const navLinks = [
  { href: '/search', label: '🔍 Discover' },
  { href: '/companion', label: '✨ Companions' },
  { href: '/chat', label: '💬 Chat' },
  { href: '/booking', label: '📅 Bookings' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl">💕</span>
            <span className="text-lg font-bold text-primary-600">Dating02</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:text-primary-500 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            ))}
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="px-3 py-2 rounded-md text-sm font-medium text-purple-600 hover:bg-purple-50"
              >
                ⚙️ Admin
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/onboarding" className="hidden md:block text-gray-600 hover:text-primary-500 text-sm">
              {user?.firstName || 'Profile'}
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
