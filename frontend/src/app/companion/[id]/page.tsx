'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { companionApi, bookingApi, paymentApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CompanionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [companion, setCompanion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchCompanion = async () => {
      try {
        const response = await companionApi.getById(id) as any;
        setCompanion(response.data);
      } catch (err) {
        console.error('Failed to load companion:', err);
        setError('Companion not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompanion();
  }, [id]);

  const estimateAmount = () => {
    if (!booking.startDate || !booking.endDate || !companion?.hourlyRate) return 0;
    const hours =
      (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) /
      (1000 * 60 * 60);
    return Math.max(0, hours * companion.hourlyRate);
  };

  const handleBooking = async () => {
    if (!booking.startDate || !booking.endDate) {
      setError('Please select start and end dates.');
      return;
    }
    setBookingLoading(true);
    setError('');
    try {
      const bookingRes = await bookingApi.create({
        companionId: id,
        startDate: booking.startDate,
        endDate: booking.endDate,
        notes: booking.notes,
      }) as any;

      const createdBookingId = bookingRes.data?._id;

      // Create Razorpay order
      const orderRes = await paymentApi.createOrder(createdBookingId) as any;
      const { orderId, amount, currency } = orderRes.data;

      // Open Razorpay checkout
      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_key',
        amount,
        currency,
        order_id: orderId,
        name: 'Dating02',
        description: `Booking with ${companion?.userId?.firstName}`,
        handler: async (response: any) => {
          try {
            await paymentApi.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setBookingSuccess(true);
          } catch {
            setError('Payment verification failed. Contact support.');
          }
        },
        prefill: {},
        theme: { color: '#ec4899' },
      });
      razorpay.open();
    } catch (err: any) {
      setError(err?.message || 'Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-pulse">✨</div>
            <p className="text-gray-600">Loading companion profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !companion) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <div className="text-center">
            <div className="text-5xl mb-4">😔</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={() => router.back()} className="btn-primary">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <div className="text-center card max-w-md mx-4">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your booking with {companion?.userId?.firstName} has been confirmed and payment received.
            </p>
            <button onClick={() => router.push('/booking')} className="btn-primary w-full">
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const amount = estimateAmount();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Companion Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <div className="card flex items-start space-x-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center text-3xl overflow-hidden flex-shrink-0">
                {companion?.userId?.photos?.[0] ? (
                  <img
                    src={companion.userId.photos[0]}
                    alt={companion.userId.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  '👤'
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {companion?.userId?.firstName} {companion?.userId?.lastName}
                </h1>
                <h2 className="text-primary-600 font-medium mb-2">{companion?.title}</h2>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold">{companion?.averageRating?.toFixed(1) || '0.0'}</span>
                    <span>({companion?.totalReviews} reviews)</span>
                  </span>
                  <span>·</span>
                  <span>{companion?.totalBookings} bookings</span>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
              <p className="text-gray-600 leading-relaxed">
                {companion?.description || companion?.userId?.bio || 'No description provided.'}
              </p>
            </div>

            {/* Skills */}
            {companion?.skills?.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills & Services</h3>
                <div className="flex flex-wrap gap-2">
                  {companion.skills.map((skill: string) => (
                    <span key={skill} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            {companion?.availability?.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Availability</h3>
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
                    const slot = companion.availability.find((a: any) => a.dayOfWeek === i);
                    return (
                      <div
                        key={day}
                        className={`text-center p-2 rounded-lg text-sm ${
                          slot
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-gray-50 text-gray-400'
                        }`}
                      >
                        <div className="font-medium">{day}</div>
                        {slot && <div className="text-xs">{slot.startTime}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking Panel */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-primary-600">₹{companion?.hourlyRate}</span>
                <span className="text-gray-500 text-sm">/hour</span>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    className="input-field"
                    value={booking.startDate}
                    onChange={(e) => setBooking({ ...booking, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    className="input-field"
                    value={booking.endDate}
                    onChange={(e) => setBooking({ ...booking, endDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                  <textarea
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Any special requests..."
                    value={booking.notes}
                    onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                  />
                </div>

                {amount > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="flex justify-between text-gray-600 mb-1">
                      <span>Subtotal</span>
                      <span>₹{amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-gray-900 border-t pt-1 mt-1">
                      <span>Total</span>
                      <span>₹{amount.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBooking}
                  disabled={bookingLoading || !booking.startDate || !booking.endDate}
                  className="w-full btn-primary py-3 disabled:opacity-50"
                >
                  {bookingLoading ? 'Processing...' : '💳 Book & Pay Now'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Secure payment powered by Razorpay
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
