'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          adminApi.getStats() as any,
          adminApi.getUsers() as any,
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data || []);
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBan = async (userId: string) => {
    const reason = prompt('Enter ban reason:');
    if (!reason) return;
    try {
      await adminApi.banUser(userId, reason);
      setUsers(users.map((u) => (u._id === userId ? { ...u, isBlocked: true, banReason: reason } : u)));
    } catch (err) {
      console.error('Failed to ban user:', err);
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await adminApi.unbanUser(userId);
      setUsers(users.map((u) => (u._id === userId ? { ...u, isBlocked: false } : u)));
    } catch (err) {
      console.error('Failed to unban user:', err);
    }
  };

  const handleApproveCompanion = async (userId: string) => {
    try {
      await adminApi.approveCompanion(userId);
      setUsers(users.map((u) => (u._id === userId ? { ...u, companionApproved: true } : u)));
    } catch (err) {
      console.error('Failed to approve companion:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>⚙️</span>
            <span className="font-bold text-lg">Dating02 Admin</span>
          </div>
          <Link href="/dashboard" className="text-gray-300 hover:text-white text-sm">
            ← Back to App
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        {loading ? (
          <div className="text-center py-20">
            <div className="text-4xl animate-pulse mb-4">⚙️</div>
            <p className="text-gray-600">Loading admin data...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="card text-center">
                  <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
                  <div className="text-gray-600 mt-1">👥 Total Users</div>
                </div>
                <div className="card text-center">
                  <div className="text-3xl font-bold text-red-600">{stats.blockedUsers}</div>
                  <div className="text-gray-600 mt-1">🚫 Blocked Users</div>
                </div>
                <div className="card text-center">
                  <div className="text-3xl font-bold text-primary-600">{stats.totalCompanions}</div>
                  <div className="text-gray-600 mt-1">✨ Companions</div>
                </div>
              </div>
            )}

            {/* Users Table */}
            <div className="card overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">User Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-t hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          {user.firstName || '—'} {user.lastName || ''}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'COMPANION' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {user.isBlocked ? '🚫 Blocked' : '✓ Active'}
                          </span>
                        </td>
                        <td className="py-3 px-4 space-x-3">
                          {user.isBlocked ? (
                            <button
                              onClick={() => handleUnban(user._id)}
                              className="text-green-600 hover:text-green-800 text-xs font-medium"
                            >
                              Unban
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBan(user._id)}
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              Ban
                            </button>
                          )}
                          {user.role === 'COMPANION' && (
                            <button
                              onClick={() => handleApproveCompanion(user._id)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400">No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
