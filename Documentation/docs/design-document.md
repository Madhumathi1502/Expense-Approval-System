# Design Document — ExpenseFlow

## Expense Approval & Reimbursement System

Version: 1.0


## 1. Overview

ExpenseFlow is a role-based expense management system that automates the reimbursement workflow.

The workflow is:

Employee → Manager → Finance

The system provides secure authentication, expense submission, approval management, payment processing, and audit tracking.


---

## 2. User Roles

### Employee
- Register and login
- Create expense requests
- View own expenses
- Cancel pending expenses

### Manager
- View submitted expenses
- Approve or reject expenses

### Finance
- View manager-approved expenses
- Mark expenses as paid


---

## 3. Functional Requirements

### Authentication
- Users can register using name, email, password, and role.
- Login returns JWT authentication token.
- Passwords are stored securely using BCrypt.


### Expense Management

Employees can:
- Create expenses
- View their own expenses
- Cancel submitted expenses

Managers can:
- Approve submitted expenses
- Reject submitted expenses

Finance can:
- Process approved expenses
- Mark reimbursement as paid


---

## 4. Database Design

Main entities:

### User
Stores:
- Name
- Email
- Password
- Role


### Expense
Stores:
- Title
- Amount
- Category
- Description
- Status
- Employee reference


### Approval History

Stores:
- Expense action
- Approver
- Timestamp
- Comments


Relationships:
User 1 ---- * Expense

Expense 1 ---- * ApprovalHistory





---


## 5. Expense Workflow



SUBMITTED

 ↓

MANAGER_APPROVED

 ↓

PAID





Alternative flow:



SUBMITTED

 ↓

REJECTED





Business rules:


- Only submitted expenses can be approved/rejected.
- Only manager-approved expenses can be paid.
- Employees cannot approve their own expenses.
- Every status change is recorded.




---


## 6. API Design


Authentication:



POST /api/auth/register
POST /api/auth/login





Employee:



POST /api/expenses
GET /api/expenses/my
DELETE /api/expenses/{id}





Manager:



GET /api/expenses/pending

PUT /api/expenses/{id}/approve

PUT /api/expenses/{id}/reject





Finance:



GET /api/expenses/finance

PUT /api/expenses/{id}/pay





---


## 7. Security Design


Implemented:


- JWT authentication
- Role-based authorization
- BCrypt password hashing
- Input validation
- Centralized exception handling




All protected APIs require:



Authorization: Bearer <JWT_TOKEN>





---


## 8. Testing Strategy


Testing includes:


- Authentication tests
- Expense creation tests
- Approval workflow tests
- Payment workflow tests
- Validation tests




Tools:


- JUnit 5
- Spring Boot Test
- H2 database for testing




---


## 9. Error Handling


The application uses centralized exception handling.


Handled cases:


- Invalid input
- Unauthorized access
- Forbidden operations
- Missing resources
- Business rule violations


---


## Conclusion

ExpenseFlow provides a secure and maintainable expense approval workflow using modern full-stack technologies with automated testing and AI-assisted development.