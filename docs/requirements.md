# Expense Approval System

## Problem
A company needs a controlled workflow to submit, review and approve employee expenses.

## Roles

EMPLOYEE:
- Create expense claims
- View own expenses
- Cancel pending claims

MANAGER:
- View team expenses
- Approve or reject expenses

FINANCE:
- Final approval
- Mark reimbursement completed

## Workflow

DRAFT
↓
SUBMITTED
↓
MANAGER_APPROVED
↓
FINANCE_APPROVED
↓
PAID

Rejected:
SUBMITTED → REJECTED

## Business Rules

1. Employee cannot approve their own expense.
2. Employee can only view their own expenses.
3. Manager can only approve assigned employees.
4. Expenses above ₹10000 require finance approval.
5. Approved expenses cannot be edited.
6. Every action must create audit history.
7. Amount cannot be zero or negative.
8. Receipt required for expenses above ₹2000.

## Technology

Backend:
Spring Boot
PostgreSQL
Spring Security JWT

Frontend:
Next.js
TypeScript

Testing:
JUnit
Playwright