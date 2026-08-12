'use client';

import { useCallback, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import ExpenseCard from '@/components/ExpenseCard';
import { getFinanceQueue, payExpense } from '@/lib/api';
import type { ExpenseResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';


export default function FinanceDashboard() {

  const { user } = useAuth();

  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);


  const fetchQueue = useCallback(async () => {

    setIsLoading(true);
    setError(null);

    try {

      const data = await getFinanceQueue();
      setExpenses(data);

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load finance queue.'
      );

    } finally {

      setIsLoading(false);

    }

  }, []);



  // Wait until authentication is ready
  useEffect(() => {

    if (!user) return;

    fetchQueue();

  }, [user, fetchQueue]);



  async function handlePay(id: number) {

    if (!confirm('Mark this expense as paid?')) return;

    setPayingId(id);

    try {

      await payExpense(id);

      setExpenses((prev) =>
        prev.filter((e) => e.id !== id)
      );

    } catch (err) {

      alert(
        err instanceof Error
          ? err.message
          : 'Failed to process payment.'
      );

    } finally {

      setPayingId(null);

    }

  }



  return (

    <ProtectedRoute allowedRoles={['FINANCE']}>

      <div className="min-h-screen bg-gray-50">

        <Navbar />


        <main className="max-w-3xl mx-auto px-4 py-8">


          {/* Page Header */}

          <div className="flex items-center justify-between mb-6">

            <div>

              <h1 className="text-xl font-bold text-gray-900">
                Finance Queue
              </h1>

              <p className="text-sm text-gray-500 mt-0.5">
                Process reimbursements for manager-approved expenses
              </p>

            </div>


            <button

              onClick={fetchQueue}

              disabled={isLoading}

              className="text-sm border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-md transition-colors disabled:opacity-50"

            >
              Refresh

            </button>


          </div>



          {/* Summary */}

          {!isLoading && !error && expenses.length > 0 && (

            <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">

              <span>

                <strong>{expenses.length}</strong> expense
                {expenses.length !== 1 ? 's' : ''} awaiting payment

              </span>


              <span className="text-gray-400">
                ·
              </span>


              <span>

                Total:{' '}

                <strong>

                  ₹
                  {expenses
                    .reduce(
                      (sum, e) => sum + Number(e.amount),
                      0
                    )
                    .toLocaleString('en-IN', {
                      minimumFractionDigits: 2
                    })}

                </strong>

              </span>

            </div>

          )}




          {/* Expense List */}

          {isLoading ? (

            <p className="text-gray-500 text-sm text-center py-10">
              Loading finance queue…
            </p>


          ) : error ? (

            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">

              {error}

              <button

                onClick={fetchQueue}

                className="ml-3 underline text-red-600 text-xs"

              >
                Retry
              </button>

            </div>


          ) : expenses.length === 0 ? (

            <div className="text-center py-14 text-gray-400">

              <p className="text-sm">
                No expenses awaiting payment.
              </p>

            </div>


          ) : (

            <div className="space-y-3">

              {expenses.map((expense) => (

                <ExpenseCard

                  key={expense.id}

                  expense={expense}

                  actions={

                    <button

                      onClick={() => handlePay(expense.id)}

                      disabled={payingId === expense.id}

                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-md disabled:opacity-50 transition-colors"

                    >

                      {payingId === expense.id
                        ? 'Processing…'
                        : 'Mark Paid'}

                    </button>

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