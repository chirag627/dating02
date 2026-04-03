'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { companionApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';

export default function CompanionPage() {
  const [companions, setCompanions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanions = async () => {
      try {
        const response = await companionApi.list() as any;
        setCompanions(response.data || []);
      } catch (err) {
        console.error('Failed to fetch companions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Find Companions</h1>

        {loading ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 animate-pulse">✨</div>
            <p className="text-gray-600">Loading companions...</p>
          </div>
        ) : companions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-600">No companions available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {companions.map((companion) => (
              <Link
                key={companion._id}
                href={`/companion/${companion._id}`}
                className="card hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center text-2xl overflow-hidden">
                    {companion.userId?.photos?.[0] ? (
                      <img
                        src={companion.userId.photos[0]}
                        alt="companion"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      '👤'
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {companion.userId?.firstName} {companion.userId?.lastName}
                    </h3>
                    <div className="flex items-center space-x-1 text-sm text-yellow-500">
                      <span>⭐</span>
                      <span>{companion.averageRating?.toFixed(1) || '0.0'}</span>
                      <span className="text-gray-400">({companion.totalReviews})</span>
                    </div>
                  </div>
                </div>

                <h4 className="font-medium text-gray-900 mb-1">{companion.title}</h4>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{companion.description}</p>

                {companion.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {companion.skills.slice(0, 3).map((skill: string) => (
                      <span
                        key={skill}
                        className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-primary-600 font-bold">
                    ₹{companion.hourlyRate}/hr
                  </span>
                  <span className="text-sm text-gray-500">
                    {companion.totalBookings} bookings
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
