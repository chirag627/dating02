'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { searchApi } from '@/lib/api';

export default function SearchPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    gender: '',
    minAge: '',
    maxAge: '',
    interests: '',
  });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.gender) params.gender = filters.gender;
      if (filters.minAge) params.minAge = parseInt(filters.minAge);
      if (filters.maxAge) params.maxAge = parseInt(filters.maxAge);
      if (filters.interests) params.interests = filters.interests;

      const response = await searchApi.users(params) as any;
      setUsers(response.data?.users || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span>💕</span>
            <span className="font-bold text-primary-600">Dating02</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Discover</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                className="input-field"
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              >
                <option value="">Any</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="NON_BINARY">Non-binary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Age</label>
              <input
                type="number"
                className="input-field"
                placeholder="18"
                value={filters.minAge}
                onChange={(e) => setFilters({ ...filters, minAge: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Age</label>
              <input
                type="number"
                className="input-field"
                placeholder="50"
                value={filters.maxAge}
                onChange={(e) => setFilters({ ...filters, maxAge: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
              <input
                type="text"
                className="input-field"
                placeholder="music, travel..."
                value={filters.interests}
                onChange={(e) => setFilters({ ...filters, interests: e.target.value })}
              />
            </div>
          </div>
          <button onClick={handleSearch} className="mt-4 btn-primary">
            Search
          </button>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-600">Searching...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {users.map((user) => (
              <div key={user._id} className="card hover:shadow-md transition-shadow text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl overflow-hidden">
                  {user.photos?.[0] ? (
                    <img
                      src={user.photos[0]}
                      alt={user.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    '👤'
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">
                  {user.firstName} {user.lastName?.charAt(0)}.
                </h3>
                {user.age && <p className="text-gray-500 text-sm">{user.age} years</p>}
                {user.bio && (
                  <p className="text-gray-600 text-xs mt-1 line-clamp-2">{user.bio}</p>
                )}
                {user.interests?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 justify-center">
                    {user.interests.slice(0, 2).map((interest: string) => (
                      <span key={interest} className="bg-primary-50 text-primary-700 text-xs px-2 py-0.5 rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
                <button className="w-full mt-3 btn-primary text-sm py-1.5">
                  💝 Like
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🌍</div>
            <p className="text-gray-600">No users found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
