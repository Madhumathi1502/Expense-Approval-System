'use client';

import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const roleLabel: Record<string, string> = {
    EMPLOYEE: 'Employee',
    MANAGER: 'Manager',
    FINANCE: 'Finance',
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-blue-600 font-bold text-lg">ExpenseFlow</span>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500">{roleLabel[user.role]} Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
