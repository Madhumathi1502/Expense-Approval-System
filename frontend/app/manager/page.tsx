'use client';

import { useCallback, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import ExpenseCard from '@/components/ExpenseCard';
import { approveExpense, getPendingExpenses, rejectExpense } from '@/lib/api';
import type { ExpenseResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function ManagerDashboard() {
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<number | null>(null);

  const fetchPending = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPendingExpenses();
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending expenses.');
    } finally {
      setIsLoading(false);
    }
  }, []);

const { user } = useAuth();

useEffect(() => {
    if (!user) return;

    fetchPending();

}, [user, fetchPending]);

  async function handleApprove(id: number) {
    setActioningId(id);
    try {
      await approveExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve expense.');
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(id: number) {
    if (!confirm('Reject this expense?')) return;
    setActioningId(id);
    try {
      await rejectExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject expense.');
    } finally {
      setActioningId(null);
    }
  }

  return (
    <ProtectedRoute allowedRoles={['MANAGER']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Pending Approvals</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Review and approve or reject submitted expenses
              </p>
            </div>
            <button
              onClick={fetchPending}
              disabled={isLoading}
              className="text-sm border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {/* Expense List */}
          {isLoading ? (
            <p className="text-gray-500 text-sm text-center py-10">Loading pending expenses…</p>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
              {error}
              <button onClick={fetchPending} className="ml-3 underline text-red-600 text-xs">
                Retry
              </button>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-14 text-gray-400">
              <p className="text-sm">No pending expenses to review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  actions={
                    <>
                      <button
                        onClick={() => handleApprove(expense.id)}
                        disabled={actioningId === expense.id}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md disabled:opacity-50 transition-colors"
                      >
                        {actioningId === expense.id ? '…' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(expense.id)}
                        disabled={actioningId === expense.id}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md disabled:opacity-50 transition-colors"
                      >
                        {actioningId === expense.id ? '…' : 'Reject'}
                      </button>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
