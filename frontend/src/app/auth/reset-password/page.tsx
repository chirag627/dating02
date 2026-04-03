'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api';

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.resetPassword({ token, password: data.password });
      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (err: any) {
      setError(err?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Password Reset!</h2>
        <p className="text-gray-600 text-sm mb-6">
          Your password has been reset successfully. Redirecting to login...
        </p>
        <Link href="/auth/login" className="btn-primary inline-block">
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <>
      {!token && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
          No reset token found. Please use the link from your email.
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            className="input-field"
            placeholder="••••••••"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
            })}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            className="input-field"
            placeholder="••••••••"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !token}
          className="w-full btn-primary py-3 disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <p className="text-center mt-4 text-sm text-gray-600">
        <Link href="/auth/forgot-password" className="text-primary-500 hover:text-primary-600 font-medium">
          Request a new reset link
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <span className="text-3xl">💕</span>
            <span className="text-2xl font-bold text-primary-600">Dating02</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Reset Password</h1>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        <div className="card">
          <Suspense fallback={<div className="text-center py-4 text-gray-500">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
