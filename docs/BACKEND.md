# Expense Approval & Reimbursement Workflow System — Backend

> **Tech Stack**: Java 17 · Spring Boot 3.2 · Spring Security (JWT) · Spring Data JPA · PostgreSQL · JUnit 5 · Maven

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Database Setup](#2-database-setup)
3. [Running the Backend](#3-running-the-backend)
4. [API Reference](#4-api-reference)
5. [Running Tests](#5-running-tests)
6. [Security Model](#6-security-model)
7. [Business Rules](#7-business-rules)
8. [Audit Trail](#8-audit-trail)

---

## 1. Project Structure

```
backend/
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/tactive/expense/
    │   │   ├── ExpenseApprovalApplication.java   ← Entry point
    │   │   ├── config/
    │   │   │   └── SecurityConfig.java           ← JWT + Role security
    │   │   ├── controller/
    │   │   │   ├── AuthController.java           ← /api/auth/**
    │   │   │   └── ExpenseController.java        ← /api/expenses/**
    │   │   ├── dto/                              ← Request/Response objects
    │   │   ├── entity/                           ← JPA entities + enums
    │   │   ├── exception/                        ← Custom exceptions + handler
    │   │   ├── repository/                       ← Spring Data JPA repos
    │   │   ├── security/                         ← JwtService + JwtFilter
    │   │   └── service/                          ← Business logic
    │   └── resources/
    │       └── application.properties
    └── test/
        ├── java/com/tactive/expense/
        │   ├── controller/
        │   │   └── AuthControllerIntegrationTest.java
        │   └── service/
        │       └── ExpenseServiceTest.java       ← 8 required tests
        └── resources/
            └── application.properties            ← H2 in-memory config
```

---

## 2. Database Setup

### Prerequisites
- PostgreSQL 14+ installed and running

### Steps

```sql
-- Connect as postgres superuser
psql -U postgres

-- Create database
CREATE DATABASE expense_db;

-- Create application user (optional but recommended)
CREATE USER expense_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE expense_db TO expense_user;

-- Exit
\q
```

> **Note**: Hibernate `ddl-auto=update` will create all tables automatically on first run.

### Environment Variables

Set these before running the application:

| Variable | Description | Default (dev only) |
|----------|-------------|-------------------|
| `DB_URL` | JDBC connection URL | `jdbc:postgresql://localhost:5432/expense_db` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `JWT_SECRET` | HS256 signing key (≥32 chars) | `3cfa76ef...` (change in prod!) |

**PowerShell**:
```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/expense_db"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_password"
$env:JWT_SECRET="your-very-secure-jwt-secret-at-least-32-chars"
```

**Linux/Mac**:
```bash
export DB_URL="jdbc:postgresql://localhost:5432/expense_db"
export DB_USERNAME="postgres"
export DB_PASSWORD="your_password"
export JWT_SECRET="your-very-secure-jwt-secret-at-least-32-chars"
```

---

## 3. Running the Backend

### Prerequisites
- Java 17 JDK
- Maven 3.8+
- PostgreSQL running with `expense_db` created

### Commands

```bash
# Navigate to backend directory
cd backend

# Build (skipping tests for quick start)
mvn clean package -DskipTests

# Run
mvn spring-boot:run

# Or run the JAR directly
java -jar target/expense-approval-1.0.0.jar
```

The server starts at: **http://localhost:8080**

---

## 4. API Reference

### Authentication Endpoints (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |

**Register Request Body**:
```json
{
  "name": "Alice Smith",
  "email": "alice@company.com",
  "password": "securePassword123",
  "role": "EMPLOYEE"
}
```
> `role` must be one of: `EMPLOYEE`, `MANAGER`, `FINANCE`

**Login Request Body**:
```json
{
  "email": "alice@company.com",
  "password": "securePassword123"
}
```

**Auth Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "alice@company.com",
  "name": "Alice Smith",
  "role": "EMPLOYEE"
}
```

> All subsequent requests must include: `Authorization: Bearer <token>`

---

### Employee Endpoints (Role: EMPLOYEE)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/expenses` | Create a new expense |
| GET | `/api/expenses/my` | View own expenses |
| DELETE | `/api/expenses/{id}` | Cancel a pending expense |

**Create Expense Request**:
```json
{
  "title": "Team Lunch",
  "description": "Lunch with the product team",
  "amount": 850.00,
  "category": "Meals",
  "receiptReference": "https://receipts.example.com/r123"
}
```
> `receiptReference` is **required** when `amount > 2000`

**Expense Response**:
```json
{
  "id": 1,
  "title": "Team Lunch",
  "description": "Lunch with the product team",
  "amount": 850.00,
  "category": "Meals",
  "receiptReference": null,
  "status": "SUBMITTED",
  "employeeId": 1,
  "employeeName": "Alice Smith",
  "createdAt": "2024-01-15T10:30:00"
}
```

---

### Manager Endpoints (Role: MANAGER)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses/pending` | View all SUBMITTED expenses |
| PUT | `/api/expenses/{id}/approve` | Approve an expense |
| PUT | `/api/expenses/{id}/reject` | Reject an expense |

**Approve/Reject Request Body** (optional):
```json
{
  "comment": "Approved — within budget"
}
```

---

### Finance Endpoints (Role: FINANCE)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses/finance` | View MANAGER_APPROVED expenses |
| PUT | `/api/expenses/{id}/pay` | Mark expense as paid |

---

### Expense Status Flow

```
SUBMITTED  ──(Manager Approve)──►  MANAGER_APPROVED  ──(Finance Pay)──►  PAID
    │
    └──(Manager Reject)──►  REJECTED
```

---

## 5. Running Tests

```bash
cd backend

# Run all tests
mvn test

# Run only unit tests
mvn test -Dtest=ExpenseServiceTest

# Run only integration tests
mvn test -Dtest=AuthControllerIntegrationTest

# Run with verbose output
mvn test -Dsurefire.useFile=false
```

### Test Coverage Summary

| # | Test | Class |
|---|------|-------|
| 1 | Employee creates expense successfully | `ExpenseServiceTest` |
| 2 | Invalid amount (>2000 without receipt) rejected | `ExpenseServiceTest` |
| 3 | Employee cannot approve own expense (self-approval guard) | `ExpenseServiceTest` |
| 4 | Employee cannot access/delete another employee's expense | `ExpenseServiceTest` |
| 5 | Manager approval changes status to MANAGER_APPROVED | `ExpenseServiceTest` |
| 6 | Rejected expense cannot be paid | `ExpenseServiceTest` |
| 7 | Finance can pay approved expense | `ExpenseServiceTest` |
| 8 | High-value expense (>10000) requires receipt | `ExpenseServiceTest` |
| + | Auth registration/login integration tests | `AuthControllerIntegrationTest` |

> Tests use an **H2 in-memory database** — no PostgreSQL required for testing.

---

## 6. Security Model

### JWT Authentication
- Token signed with HMAC-SHA256
- Expiry: 24 hours (configurable via `jwt.expiration`)
- Sent as `Authorization: Bearer <token>` header

### Role-Based Access Control

| Role | Permitted Actions |
|------|------------------|
| `EMPLOYEE` | Create expense, view own expenses, cancel pending expense |
| `MANAGER` | View pending expenses, approve/reject expenses |
| `FINANCE` | View approved expenses, mark as paid |

### Security Constraints Enforced

| Constraint | Where Enforced |
|-----------|----------------|
| Role-based endpoint access | `@PreAuthorize` on controller methods |
| Employee cannot view others' expenses | `findByEmployee(currentUser)` in service |
| Manager cannot self-approve | Explicit check in `ExpenseService.approveExpense()` |
| Only SUBMITTED expenses can be approved/rejected | Status check in service |
| Approved/rejected expenses cannot be deleted | Status check in service |
| Rejected expenses cannot be paid | Status check in service |

---

## 7. Business Rules

| Rule | Details |
|------|---------|
| Amount must be > 0 | Enforced by `@DecimalMin` on DTO |
| Title required | Enforced by `@NotBlank` on DTO |
| Amount > 2000 requires receipt | Enforced in `ExpenseService.createExpense()` |
| Amount > 10000 goes through full pipeline | Both manager + finance approval required |
| Approved expenses cannot be modified | Status guard prevents re-approval/deletion |

---

## 8. Audit Trail

Every significant action creates an `ApprovalHistory` record:

| Action | Trigger |
|--------|---------|
| `EXPENSE_CREATED` | When employee submits expense |
| `MANAGER_APPROVED` | When manager approves |
| `MANAGER_REJECTED` | When manager rejects |
| `FINANCE_PAID` | When finance marks as paid |

---

## Sample cURL Commands

```bash
# 1. Register an employee
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@test.com","password":"pass123","role":"EMPLOYEE"}'

# 2. Login
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"pass123"}' | jq -r '.token')

# 3. Create expense
curl -X POST http://localhost:8080/api/expenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Office Supplies","amount":500.00,"category":"Stationery"}'

# 4. View own expenses
curl http://localhost:8080/api/expenses/my \
  -H "Authorization: Bearer $TOKEN"
```
