# Test Report — ExpenseFlow

## Expense Approval & Reimbursement System

Backend: Spring Boot 3.2  
Testing: JUnit 5 + Mockito + Spring Boot Test


---

## 1. Testing Strategy

ExpenseFlow uses two levels of testing:

### Unit Testing
- Framework: JUnit 5 + Mockito
- Tests business logic in ExpenseService
- Covers expense creation, approval, rejection, payment, and validations


### Integration Testing
- Framework: Spring Boot Test + MockMvc
- Covers authentication APIs
- Uses H2 in-memory database


---

## 2. Test Coverage

Covered scenarios:

- User registration
- User login
- Expense creation
- Receipt validation
- Amount limit validation
- Manager approval workflow
- Expense rejection
- Finance payment workflow
- Role-based access control
- Invalid operations


---

## 3. Test Execution

Command:

```bash
cd backend
mvn test
Final Result:

Tests run: 19
Failures: 0
Errors: 0


BUILD SUCCESS

Test Summary:

Type	Count
Unit Tests	15
Integration Tests	4
Total	19
4. Deliberate Failure Test

To verify that tests can detect defects, a bug was intentionally introduced.

Changed:

expense.setStatus(ExpenseStatus.MANAGER_APPROVED);

to:

expense.setStatus(ExpenseStatus.PAID);

Test Result:

Expected: MANAGER_APPROVED
Actual: PAID


BUILD FAILURE

Detected by:

managerApprovalChangesStatus()
5. Bug Fix Verification

The incorrect status update was restored:

expense.setStatus(ExpenseStatus.MANAGER_APPROVED);

Tests were executed again.

Result:

Tests run: 19
Failures: 0
Errors: 0


BUILD SUCCESS
6. Tools Used
Tool	Purpose
Google Antigravity	Test generation, analysis, debugging support
Cursor	Code review and fixes
ChatGPT	Test planning and documentation
Summary

The test suite successfully validates:

✅ Authentication flow
✅ Expense workflow
✅ Business rules
✅ Role permissions
✅ Error handling

