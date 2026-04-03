'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { profileApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await profileApi.getMe() as any;
        setProfile(response.data);
      } catch {
        logout();
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, router, logout]);

  const handleLogout = async () => {
    logout();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">💕</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const profileCompletion = profile?.profileCompletion || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl">💕</span>
              <span className="text-lg font-bold text-primary-600">Dating02</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/search" className="text-gray-600 hover:text-primary-500">
                🔍 Discover
              </Link>
              <Link href="/chat" className="text-gray-600 hover:text-primary-500">
                💬 Chat
              </Link>
              <Link href="/booking" className="text-gray-600 hover:text-primary-500">
                📅 Bookings
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-500 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.firstName || 'User'} 👋
          </h1>
          <p className="text-gray-600 mt-1">Here&apos;s what&apos;s happening in your world today.</p>
        </div>

        {/* Profile Completion */}
        {profileCompletion < 100 && (
          <div className="card mb-6 bg-gradient-to-r from-pink-50 to-purple-50 border-primary-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Complete Your Profile</h3>
              <span className="text-primary-600 font-bold">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <Link href="/onboarding" className="text-primary-500 text-sm font-medium hover:text-primary-600">
              Complete profile →
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Matches', value: profile?.matches?.length || 0, icon: '💝' },
            { label: 'Likes Sent', value: profile?.likesSent || 0, icon: '❤️' },
            { label: 'Likes Received', value: profile?.likesReceived || 0, icon: '🌟' },
            { label: 'Streak Days', value: profile?.streakDays || 0, icon: '🔥' },
          ].map((stat) => (
            <div key={stat.label} className="card text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/search" className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Discover People</h3>
            <p className="text-gray-600 text-sm">Browse profiles and find your match</p>
          </Link>

          <Link href="/companion" className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Find Companions</h3>
            <p className="text-gray-600 text-sm">Book verified companions for events</p>
          </Link>

          <Link href="/chat" className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Messages</h3>
            <p className="text-gray-600 text-sm">Chat with your connections</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
