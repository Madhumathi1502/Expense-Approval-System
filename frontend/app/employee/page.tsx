'use client';

import { useCallback, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseCard from '@/components/ExpenseCard';
import { deleteExpense, getMyExpenses } from '@/lib/api';
import type { ExpenseResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function EmployeeDashboard() {

  const { user } = useAuth();

  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);


  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getMyExpenses();
      setExpenses(data);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load expenses.'
      );

    } finally {
      setIsLoading(false);
    }

  }, []);


  // Wait until authentication is loaded before calling API
  useEffect(() => {

    if (!user) return;

    fetchExpenses();

  }, [user, fetchExpenses]);



  async function handleDelete(id: number) {

    if (!confirm('Cancel this expense?')) return;

    setDeletingId(id);

    try {

      await deleteExpense(id);

      setExpenses((prev) =>
        prev.filter((e) => e.id !== id)
      );

    } catch (err) {

      alert(
        err instanceof Error
          ? err.message
          : 'Failed to cancel expense.'
      );

    } finally {

      setDeletingId(null);

    }
  }



  function handleFormSuccess() {

    setShowForm(false);
    fetchExpenses();

  }



  return (

    <ProtectedRoute allowedRoles={['EMPLOYEE']}>

      <div className="min-h-screen bg-gray-50">

        <Navbar />


        <main className="max-w-3xl mx-auto px-4 py-8">


          {/* Header */}

          <div className="flex items-center justify-between mb-6">

            <div>

              <h1 className="text-xl font-bold text-gray-900">
                My Expenses
              </h1>

              <p className="text-sm text-gray-500 mt-0.5">
                Submit and track your expense reimbursements
              </p>

            </div>


            <button

              onClick={() => setShowForm((v) => !v)}

              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"

            >

              {showForm ? 'Cancel' : '+ New Expense'}

            </button>


          </div>



          {/* Expense Form */}

          {showForm && (

            <div className="mb-6">

              <ExpenseForm onSuccess={handleFormSuccess} />

            </div>

          )}




          {/* Expense List */}

          {isLoading ? (

            <p className="text-gray-500 text-sm text-center py-10">
              Loading your expenses…
            </p>


          ) : error ? (

            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">

              {error}

              <button

                onClick={fetchExpenses}

                className="ml-3 underline text-red-600 text-xs"

              >
                Retry
              </button>

            </div>


          ) : expenses.length === 0 ? (

            <div className="text-center py-14 text-gray-400">

              <p className="text-sm">
                No expenses submitted yet.
              </p>


              <button

                onClick={() => setShowForm(true)}

                className="mt-3 text-blue-600 text-sm underline"

              >
                Submit your first expense
              </button>

            </div>


          ) : (


            <div className="space-y-3">

              {expenses.map((expense) => (

                <ExpenseCard

                  key={expense.id}

                  expense={expense}

                  actions={

                    expense.status === 'SUBMITTED' ? (

                      <button

                        onClick={() => handleDelete(expense.id)}

                        disabled={deletingId === expense.id}

                        className="text-xs text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-3 py-1 rounded-md disabled:opacity-50 transition-colors"

                      >

                        {deletingId === expense.id
                          ? 'Cancelling…'
                          : 'Cancel'}

                      </button>

                    ) : null

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