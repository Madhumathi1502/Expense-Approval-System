'use client';

import { useState } from 'react';
import { createExpense } from '@/lib/api';
import type { CreateExpenseRequest } from '@/lib/api';

const CATEGORIES = [
  'Travel',
  'Meals',
  'Accommodation',
  'Office Supplies',
  'Equipment',
  'Training',
  'Marketing',
  'Other',
];

interface Props {
  onSuccess: () => void;
}

export default function ExpenseForm({ onSuccess }: Props) {
  const [form, setForm] = useState<CreateExpenseRequest>({
    title: '',
    description: '',
    amount: 0,
    category: '',
    receiptReference: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) return setError('Title is required.');
    if (!form.category) return setError('Please select a category.');
    if (!form.amount || form.amount <= 0) return setError('Amount must be greater than 0.');
    if (form.amount > 2000 && !form.receiptReference?.trim()) {
      return setError('Receipt reference is required for amounts over ₹2,000.');
    }

    setIsSubmitting(true);
    try {
      await createExpense(form);
      setForm({ title: '', description: '', amount: 0, category: '', receiptReference: '' });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit expense.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4">New Expense</h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Title */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Flight to Chennai"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="amount">
            Amount (₹) <span className="text-red-500">*</span>
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={form.amount || ''}
            onChange={handleChange}
            placeholder="0.00"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            required
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={2}
            placeholder="Optional details about the expense"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Receipt Reference */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="receiptReference">
            Receipt Reference{' '}
            {form.amount > 2000 && <span className="text-red-500">*</span>}
            {form.amount > 0 && form.amount <= 2000 && (
              <span className="text-gray-400 font-normal">(optional)</span>
            )}
          </label>
          <input
            id="receiptReference"
            name="receiptReference"
            type="text"
            value={form.receiptReference}
            onChange={handleChange}
            placeholder="e.g. RCPT-2024-001"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {form.amount > 2000 && (
            <p className="mt-1 text-xs text-amber-600">Required for amounts over ₹2,000</p>
          )}
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-6 py-2 rounded-md transition-colors"
        >
          {isSubmitting ? 'Submitting…' : 'Submit Expense'}
        </button>
      </div>
    </form>
  );
}
