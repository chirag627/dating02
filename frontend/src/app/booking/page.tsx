'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { bookingApi } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

export default function BookingPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingApi.history() as any;
        setBookings(response.data || []);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleComplete = async (id: string) => {
    try {
      await bookingApi.complete(id);
      setBookings(bookings.map((b) =>
        b._id === id ? { ...b, status: 'COMPLETED' } : b,
      ));
    } catch (err) {
      console.error('Failed to complete booking:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span>💕</span>
            <span className="font-bold text-primary-600">Dating02</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">My Bookings</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📅</div>
            <p className="text-gray-600 mb-4">No bookings yet</p>
            <Link href="/companion" className="btn-primary">
              Browse Companions
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[booking.status]}`}>
                    {booking.status}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Start:</span>{' '}
                    <span className="font-medium">{new Date(booking.startDate).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">End:</span>{' '}
                    <span className="font-medium">{new Date(booking.endDate).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount:</span>{' '}
                    <span className="font-bold text-primary-600">₹{booking.amount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Payment:</span>{' '}
                    <span className={booking.isPaid ? 'text-green-600' : 'text-red-600'}>
                      {booking.isPaid ? 'Paid ✓' : 'Pending'}
                    </span>
                  </div>
                </div>

                {booking.notes && (
                  <p className="text-gray-600 text-sm mt-2 italic">{booking.notes}</p>
                )}

                {booking.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleComplete(booking._id)}
                    className="mt-3 btn-primary text-sm"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
