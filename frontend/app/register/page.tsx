'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<
    'EMPLOYEE' | 'MANAGER' | 'FINANCE'
  >('EMPLOYEE');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      setSuccess(true);

      setTimeout(() => {
        router.push('/login');
      }, 1500);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Registration failed.'
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600">
            ExpenseFlow
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Create your account
          </p>
        </div>


        <div className="bg-white border border-gray-200 rounded-lg px-8 py-8 shadow-sm">

          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Register
          </h2>


          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
              {error}
            </div>
          )}


          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-md">
              Account created. Redirecting...
            </div>
          )}


          <form onSubmit={handleSubmit}>

            <input
              className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
              placeholder="Name"
              value={name}
              onChange={(e)=>setName(e.target.value)}
            />


            <input
              className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />


            <input
              className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />


            <select
              className="w-full border rounded-md px-3 py-2 mb-6 text-sm"
              value={role}
              onChange={(e)=>setRole(e.target.value as any)}
            >
              <option value="EMPLOYEE">
                Employee
              </option>

              <option value="MANAGER">
                Manager
              </option>

              <option value="FINANCE">
                Finance
              </option>

            </select>


            <button
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>

          </form>


          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:underline"
            >
              Sign in
            </Link>
          </p>

        </div>

      </div>

    </main>
  );
}