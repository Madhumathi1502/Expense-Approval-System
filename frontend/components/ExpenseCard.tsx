'use client';

import type { ExpenseResponse, ExpenseStatus } from '@/lib/api';

const STATUS_STYLES: Record<ExpenseStatus, string> = {
  SUBMITTED: 'bg-yellow-100 text-yellow-800',
  MANAGER_APPROVED: 'bg-blue-100 text-blue-800',
  FINANCE_APPROVED: 'bg-indigo-100 text-indigo-800',
  REJECTED: 'bg-red-100 text-red-800',
  PAID: 'bg-green-100 text-green-800',
};

const STATUS_LABEL: Record<ExpenseStatus, string> = {
  SUBMITTED: 'Submitted',
  MANAGER_APPROVED: 'Manager Approved',
  FINANCE_APPROVED: 'Finance Approved',
  REJECTED: 'Rejected',
  PAID: 'Paid',
};

interface Props {
  expense: ExpenseResponse;
  actions?: React.ReactNode;
}

export default function ExpenseCard({ expense, actions }: Props) {
  const date = new Date(expense.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-800 truncate">{expense.title}</h3>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[expense.status]}`}
            >
              {STATUS_LABEL[expense.status]}
            </span>
          </div>
          {expense.description && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{expense.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span>{expense.category}</span>
            <span>·</span>
            <span>{date}</span>
            {expense.employeeName && (
              <>
                <span>·</span>
                <span>{expense.employeeName}</span>
              </>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-bold text-gray-800">
            ₹{Number(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          {actions && <div className="mt-2 flex gap-2 justify-end">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
