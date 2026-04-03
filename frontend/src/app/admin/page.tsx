'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [banReason, setBanReason] = useState('');
  const [banUserId, setBanUserId] = useState('');

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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>💕</span>
            <span className="font-bold">Dating02 Admin</span>
          </div>
          <Link href="/dashboard" className="text-gray-300 hover:text-white text-sm">
            Back to App
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : (
          <>
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="card text-center">
                  <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
                  <div className="text-gray-600">Total Users</div>
                </div>
                <div className="card text-center">
                  <div className="text-3xl font-bold text-red-600">{stats.blockedUsers}</div>
                  <div className="text-gray-600">Blocked Users</div>
                </div>
                <div className="card text-center">
                  <div className="text-3xl font-bold text-primary-600">{stats.totalCompanions}</div>
                  <div className="text-gray-600">Companions</div>
                </div>
              </div>
            )}

            {/* Users Table */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Name</th>
                      <th className="text-left py-2 px-3">Email</th>
                      <th className="text-left py-2 px-3">Role</th>
                      <th className="text-left py-2 px-3">Status</th>
                      <th className="text-left py-2 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="py-2 px-3 text-gray-600">{user.email}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'COMPANION' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {user.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {user.isBlocked ? (
                            <button
                              onClick={() => handleUnban(user._id)}
                              className="text-green-600 hover:underline text-xs"
                            >
                              Unban
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBan(user._id)}
                              className="text-red-600 hover:underline text-xs"
                            >
                              Ban
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
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
