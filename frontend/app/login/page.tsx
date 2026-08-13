'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { setUser } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      return setError('Email is required.');
    }

    if (!password) {
      return setError('Password is required.');
    }

    setIsLoading(true);

    try {
      const data = await login({
        email: email.trim(),
        password,
      });

      setUser(data);

      const dashboardMap: Record<string, string> = {
        EMPLOYEE: '/employee',
        MANAGER: '/manager',
        FINANCE: '/finance',
      };

      router.push(dashboardMap[data.role] || '/');

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Login failed. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600">
            ExpenseFlow
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Expense Approval & Reimbursement System
          </p>
        </div>


        {/* Login Card */}
        <div className="bg-white border border-gray-200 rounded-lg px-8 py-8 shadow-sm">

          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Sign in
          </h2>


          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
              {error}
            </div>
          )}


          <form onSubmit={handleSubmit} noValidate>

            <div className="mb-4">

              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>


              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

            </div>


            <div className="mb-6">

              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>


              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

            </div>


            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-md text-sm transition-colors"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>

          </form>


          {/* Register Link */}
          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Create account
            </Link>
          </p>

        </div>


        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} ExpenseFlow. All rights reserved.
        </p>

      </div>

    </main>
  );
}