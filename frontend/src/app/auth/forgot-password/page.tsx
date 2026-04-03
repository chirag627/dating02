'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api';

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true);
    setError('');
    try {
      await authApi.forgotPassword(data.email);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <span className="text-3xl">💕</span>
            <span className="text-2xl font-bold text-primary-600">Dating02</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Forgot Password</h1>
          <p className="text-gray-600">Enter your email to receive a reset link</p>
        </div>

        <div className="card">
          {success ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📬</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-600 text-sm mb-6">
                If an account with that email exists, we&apos;ve sent a password reset link.
              </p>
              <Link href="/auth/login" className="btn-primary inline-block">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="you@example.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center mt-4 text-sm text-gray-600">
                Remember your password?{' '}
                <Link href="/auth/login" className="text-primary-500 hover:text-primary-600 font-medium">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
