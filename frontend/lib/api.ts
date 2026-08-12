const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  // Token expired or invalid — force re-login
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.message || body.error || JSON.stringify(body);
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'FINANCE';
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<AuthResponse>(res);
}

// ─── Expenses ────────────────────────────────────────────────────────────────

export type ExpenseStatus =
  | 'SUBMITTED'
  | 'MANAGER_APPROVED'
  | 'FINANCE_APPROVED'
  | 'REJECTED'
  | 'PAID';

export interface ExpenseResponse {
  id: number;
  title: string;
  description: string;
  amount: number;
  category: string;
  receiptReference: string | null;
  status: ExpenseStatus;
  employeeId: number;
  employeeName: string;
  createdAt: string;
}

export interface CreateExpenseRequest {
  title: string;
  description?: string;
  amount: number;
  category: string;
  receiptReference?: string;
}

// EMPLOYEE: create expense
export async function createExpense(
  payload: CreateExpenseRequest
): Promise<ExpenseResponse> {
  const res = await fetch(`${BASE_URL}/api/expenses`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<ExpenseResponse>(res);
}

// EMPLOYEE: get my expenses
export async function getMyExpenses(): Promise<ExpenseResponse[]> {
  const res = await fetch(`${BASE_URL}/api/expenses/my`, {
    headers: authHeaders(),
  });
  return handleResponse<ExpenseResponse[]>(res);
}

// EMPLOYEE: delete/cancel expense
export async function deleteExpense(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/expenses/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse<void>(res);
}

// MANAGER: get pending expenses
export async function getPendingExpenses(): Promise<ExpenseResponse[]> {
  const res = await fetch(`${BASE_URL}/api/expenses/pending`, {
    headers: authHeaders(),
  });
  return handleResponse<ExpenseResponse[]>(res);
}

// MANAGER: approve expense
export async function approveExpense(id: number): Promise<ExpenseResponse> {
  const res = await fetch(`${BASE_URL}/api/expenses/${id}/approve`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({}),
  });
  return handleResponse<ExpenseResponse>(res);
}

// MANAGER: reject expense
export async function rejectExpense(id: number): Promise<ExpenseResponse> {
  const res = await fetch(`${BASE_URL}/api/expenses/${id}/reject`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({}),
  });
  return handleResponse<ExpenseResponse>(res);
}

// FINANCE: get finance queue
export async function getFinanceQueue(): Promise<ExpenseResponse[]> {
  const res = await fetch(`${BASE_URL}/api/expenses/finance`, {
    headers: authHeaders(),
  });
  return handleResponse<ExpenseResponse[]>(res);
}

// FINANCE: pay expense
export async function payExpense(id: number): Promise<ExpenseResponse> {
  const res = await fetch(`${BASE_URL}/api/expenses/${id}/pay`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({}),
  });
  return handleResponse<ExpenseResponse>(res);
}
