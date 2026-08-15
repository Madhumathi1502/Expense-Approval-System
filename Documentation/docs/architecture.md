# System Architecture — ExpenseFlow

## Expense Approval & Reimbursement System

**Backend:** Spring Boot 3.2 (Java 17)  
**Frontend:** Next.js + TypeScript  
**Database:** PostgreSQL  


## 1. System Overview

ExpenseFlow is a role-based expense approval system that manages the complete reimbursement workflow.

The application supports three roles:

### Employee
- Register and login
- Submit expenses
- Track expense status

### Manager
- Review expenses
- Approve or reject requests

### Finance
- Process approved expenses
- Mark reimbursements as paid


## 2. High-Level Architecture

The system follows a three-tier architecture:

| Layer | Technology | Responsibility |
|---|---|---|
| Presentation | Next.js, TypeScript, Tailwind CSS | User interface and role-based pages |
| Application | Spring Boot REST API | Business logic and security |
| Data | PostgreSQL | Data persistence |


Architecture flow:
User Browser
|
↓
Next.js Frontend
|
↓
REST API + JWT
|
↓
Spring Boot Backend
|
↓
PostgreSQL Database



## 3. Backend Architecture

The backend follows a layered design:
Controller
|
↓
Service
|
↓
Repository
|
↓
Database





### Controller Layer


Handles:


- HTTP requests
- Input validation
- API responses


Controllers:


- AuthController
- ExpenseController




### Service Layer


Contains application logic:


- Authentication
- Expense creation
- Approval workflow
- Payment processing




Services:


- AuthService
- ExpenseService




### Repository Layer


Uses Spring Data JPA for database operations.


Repositories:


- UserRepository
- ExpenseRepository
- ApprovalHistoryRepository




## 4. Database Design


Main entities:


### User


Stores:


- Name
- Email
- Password
- Role




Roles:



EMPLOYEE
MANAGER
FINANCE





### Expense


Stores:


- Title
- Amount
- Description
- Status
- Employee reference




Expense lifecycle:



SUBMITTED
↓
MANAGER_APPROVED
↓
PAID



Alternative:



SUBMITTED
↓
REJECTED





### Approval History


Maintains audit records:


- Expense
- Approver
- Action
- Timestamp
- Comment




## 5. Authentication & Security


Authentication flow:



Login
↓
AuthController
↓
AuthService
↓
JWT Token Generated
↓
JWT Filter Validation
↓
Protected API Access





Security features:


- JWT authentication
- BCrypt password hashing
- Role-based authorization
- Spring Security filters




## 6. Testing Architecture


Testing includes:


- Unit testing
- Integration testing




Covered areas:


- Registration
- Login
- Expense creation
- Approval workflow
- Payment workflow
- Validation rules




Tools:


- JUnit 5
- Spring Boot Test
- H2 Database




## 7. Technology Decisions


| Technology | Reason |
|---|---|
| Spring Boot | Reliable backend framework |
| PostgreSQL | Structured relational storage |
| JWT | Stateless authentication |
| JPA/Hibernate | Simplified database access |
| Next.js | Modern frontend framework |
| TypeScript | Better code reliability |




## Conclusion


ExpenseFlow provides a secure full-stack architecture with:


- Role-based access control
- REST API communication
- JWT authentication
- Database persistence
- Automated testing