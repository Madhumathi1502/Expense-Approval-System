# Requirements Specification — ExpenseFlow

> **Expense Approval & Reimbursement System**  
> Tactive AI-Powered QA Automation Assessment

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Goals](#2-goals)
3. [User Stories](#3-user-stories)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Constraints](#6-constraints)
7. [Future Improvements](#7-future-improvements)

---

## 1. Problem Statement

Organizations managing employee expense reimbursements through ad-hoc processes (email threads, spreadsheets) suffer from:

- **No audit trail**: It is impossible to trace who approved what and when.
- **Lack of enforcement**: Amount limits and receipt requirements are ignored or inconsistently applied.
- **Limited visibility**: Employees cannot track the status of their claims; managers cannot see all pending items.
- **No role separation**: Finance, management, and employees share the same process with no accountability segregation.

**ExpenseFlow** addresses these problems by implementing a structured, role-gated, auditable expense approval workflow with automated business rule enforcement.

---

## 2. Goals

| Goal | Description |
|------|-------------|
| **Structured workflow** | Expense claims follow a defined state machine: `SUBMITTED → MANAGER_APPROVED → PAID` (or `REJECTED`) |
| **Role-based access** | Employees, managers, and finance users each see only what is relevant to their function |
| **Automated enforcement** | Receipt requirements and amount caps are enforced automatically by the system |
| **Audit trail** | Every state change is recorded with actor, timestamp, and optional comment |
| **Clean API** | A RESTful JSON API that decouples the frontend from the backend |
| **Testable design** | All business logic is covered by automated tests |

---

## 3. User Stories

### Employee Stories

| ID | Story |
|----|-------|
| US-E01 | As an employee, I want to register an account so that I can use the expense system. |
| US-E02 | As an employee, I want to log in with my email and password so that I can access my dashboard. |
| US-E03 | As an employee, I want to submit an expense with a title, amount, category, and description so that I can request reimbursement. |
| US-E04 | As an employee, I want to attach a receipt reference when my expense exceeds ₹2,000 so that I comply with company policy. |
| US-E05 | As an employee, I want to view all my submitted expenses and their current statuses. |
| US-E06 | As an employee, I want to cancel a pending expense if I submitted it by mistake. |

### Manager Stories

| ID | Story |
|----|-------|
| US-M01 | As a manager, I want to see all pending expense claims so that I can review them. |
| US-M02 | As a manager, I want to approve a valid expense so that the employee can be reimbursed. |
| US-M03 | As a manager, I want to reject an invalid expense with an optional comment explaining the reason. |
| US-M04 | As a manager, I must not be able to approve my own expense to ensure independence. |

### Finance Stories

| ID | Story |
|----|-------|
| US-F01 | As a finance user, I want to see all manager-approved expenses so that I know what to process. |
| US-F02 | As a finance user, I want to mark an approved expense as PAID to confirm reimbursement has been processed. |
| US-F03 | As a finance user, I must not be able to pay a rejected expense. |

---

## 4. Functional Requirements

### Authentication

| ID | Requirement |
|----|-------------|
| FR-01 | The system shall allow any user to register with a name, email, password, and role. |
| FR-02 | The system shall reject registration if the email is already in use (HTTP 400). |
| FR-03 | The system shall authenticate users with email and password and return a JWT token. |
| FR-04 | The system shall return HTTP 401 for invalid login credentials. |
| FR-05 | The system shall protect all API endpoints (except `/api/auth/**`) with JWT validation. |

### Expense Submission

| ID | Requirement |
|----|-------------|
| FR-06 | Only `EMPLOYEE`-role users can submit expenses (`POST /api/expenses`). |
| FR-07 | An expense must have a non-empty title, a positive amount (> 0), and a non-empty category. |
| FR-08 | The system shall reject expenses with `amount > ₹1,00,000` with HTTP 400 and the message "Expense amount cannot exceed ₹1,00,000". |
| FR-09 | The system shall reject expenses with `amount > ₹2,000` that do not include a `receiptReference` (HTTP 400). |
| FR-10 | The newly created expense shall have `SUBMITTED` status and a `createdAt` timestamp set by `@PrePersist`. |
| FR-11 | The system shall record an `EXPENSE_CREATED` audit history entry on submission. |

### Expense Visibility

| ID | Requirement |
|----|-------------|
| FR-12 | `GET /api/expenses/my` shall return only expenses owned by the authenticated employee. |
| FR-13 | An employee cannot view, modify, or delete another employee's expense. |

### Expense Cancellation

| ID | Requirement |
|----|-------------|
| FR-14 | `DELETE /api/expenses/{id}` shall be accessible only to `EMPLOYEE` role. |
| FR-15 | An employee can only delete their own expense (HTTP 403 otherwise). |
| FR-16 | Only `SUBMITTED` expenses can be deleted (HTTP 400 if any other status). |

### Manager Operations

| ID | Requirement |
|----|-------------|
| FR-17 | `GET /api/expenses/pending` shall return all expenses with `SUBMITTED` status. |
| FR-18 | `PUT /api/expenses/{id}/approve` shall transition the expense to `MANAGER_APPROVED` and record audit history. |
| FR-19 | `PUT /api/expenses/{id}/reject` shall transition the expense to `REJECTED` and record audit history. |
| FR-20 | The system shall reject self-approval (HTTP 403 with "Managers cannot approve their own expenses"). |
| FR-21 | Only `SUBMITTED` expenses can be approved or rejected by a manager (HTTP 400 otherwise). |

### Finance Operations

| ID | Requirement |
|----|-------------|
| FR-22 | `GET /api/expenses/finance` shall return all expenses with `MANAGER_APPROVED` status. |
| FR-23 | `PUT /api/expenses/{id}/pay` shall transition the expense to `PAID` and record `FINANCE_PAID` in audit history. |
| FR-24 | The system shall reject payment of `REJECTED` expenses (HTTP 400). |
| FR-25 | The system shall reject payment of non-`MANAGER_APPROVED` expenses (HTTP 400). |

---

## 5. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | **Security** | Passwords must be stored as BCrypt hashes; plain-text passwords must never be persisted. |
| NFR-02 | **Security** | JWT tokens must be signed with HMAC-SHA256 and expire after 24 hours. |
| NFR-03 | **Security** | The JWT secret must be configurable via environment variable (`JWT_SECRET`). |
| NFR-04 | **Statelessness** | The API must not maintain server-side session state. |
| NFR-05 | **Testability** | All business logic in `ExpenseService` must be covered by automated unit tests using Mockito. |
| NFR-06 | **Testability** | Integration tests must use H2 in-memory database and require no external services. |
| NFR-07 | **Consistency** | All error responses must follow the `{timestamp, status, error, details}` structure. |
| NFR-08 | **Maintainability** | Business logic must be separated from controller and persistence layers. |
| NFR-09 | **Auditability** | Every expense action must produce an immutable `ApprovalHistory` record. |

---

## 6. Constraints

| Constraint | Details |
|-----------|---------|
| **Language & Platform** | Backend: Java 17 + Spring Boot 3.2. Frontend: TypeScript + Next.js 16. |
| **Database** | PostgreSQL 14+ for production. H2 in-memory for test runs. |
| **No file uploads** | Receipt evidence is stored as a text reference/URL string, not an actual uploaded file. |
| **No role modification** | User roles are set at registration and cannot be changed via the API. |
| **No pagination** | API responses return all results for the current user/status. Large datasets are not handled with pagination in this version. |
| **No email notifications** | There are no email or push notifications for status changes. |
| **Single-tenant** | No multi-company or multi-tenant support. |

---

## 7. Future Improvements

| Priority | Improvement |
|----------|------------|
| 🔴 High | **Token refresh mechanism**: Add a `/api/auth/refresh` endpoint to extend sessions without re-login. |
| 🔴 High | **Pagination**: Add page/size parameters to list endpoints to support large datasets. |
| 🟡 Medium | **Email notifications**: Notify employees when their expense is approved, rejected, or paid. |
| 🟡 Medium | **Admin role**: Add an admin user who can reassign roles, delete users, and view all expenses. |
| 🟡 Medium | **File upload**: Allow actual receipt files (PDF, image) to be uploaded and stored. |
| 🟡 Medium | **Expense categories as configuration**: Make expense categories configurable rather than hardcoded. |
| 🟢 Low | **Rate limiting**: Protect the login endpoint against brute-force attacks. |
| 🟢 Low | **Refresh/invalidate tokens**: Add JWT blacklisting or rotation for logout security. |
| 🟢 Low | **Manager-team assignment**: Allow managers to be associated with specific employees so they only see their team's expenses. |
| 🟢 Low | **Export to CSV/PDF**: Allow finance to export paid expense reports. |
