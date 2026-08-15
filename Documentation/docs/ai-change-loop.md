# AI Change Loop — Feature Implementation Record

## Feature Implemented

**Feature:** Expense Amount Validation Limit

**Requirement:**

Employees should not be able to submit expenses above ₹1,00,000.

**AI Tools Used:**

- Google Antigravity
- Cursor
- ChatGPT


## Objective

Demonstrate an AI-assisted engineering workflow:
Requirement
↓
AI Analysis
↓
Implementation
↓
Testing
↓
Failure Detection
↓
Correction
↓
Successful Build



---


# 1. Initial AI Prompt


**Tool Used:** Google Antigravity


The AI was asked to analyse the existing ExpenseFlow application and implement a new business rule.


## Feature Request


Add validation to prevent employees from submitting expenses above ₹1,00,000.


## Requirements


- Add validation in the service layer.
- Return a clear error message.
- Add automated tests for:
  - Amount above ₹1,00,000 (reject)
  - Amount exactly ₹1,00,000 (accept)
- Run the complete test suite.


**Evidence:**



assessment-evidence/screenshots/ai-loop/01-prompt.png



---


# 2. AI Analysis


Google Antigravity analysed the existing implementation.


## Files Reviewed


- ExpenseService.java
- CreateExpenseRequest.java
- ExpenseServiceTest.java




## AI Identified


- Correct business logic location: Service layer
- Existing exception handling pattern
- Existing testing approach




## Implementation Plan


1. Add maximum expense limit constant.
2. Validate amount before saving.
3. Throw business validation exception.
4. Add boundary test cases.




**Evidence:**



assessment-evidence/screenshots/ai-loop/02-ai-analysis.png



---


# 3. Implementation Changes


## ExpenseService.java


Changes:


- Added expense amount limit.
- Added validation before expense creation.
- Added meaningful error message.




Business rule:



Expense amount cannot exceed ₹1,00,000





## ExpenseServiceTest.java


Added tests:


- Reject expense above ₹1,00,000.
- Accept expense equal to ₹1,00,000.




Evidence:



assessment-evidence/screenshots/ai-loop/03-ai-code-changes.png



---


# 4. Test Execution


Command:


```bash
cd backend
mvn test

Result:

Tests run: 19
Failures: 0
Errors: 0


BUILD SUCCESS

Covered:

Authentication
Expense creation
Approval workflow
Payment workflow
Validation rules

Evidence:

assessment-evidence/screenshots/tests/backend-test-green-run.png
5. Deliberate Failure Detection

To verify that the test suite could detect real defects, a workflow bug was introduced.

Changed:

expense.setStatus(ExpenseStatus.MANAGER_APPROVED);

to:

expense.setStatus(ExpenseStatus.PAID);

Test detected the incorrect workflow transition.

Expected:

MANAGER_APPROVED

Actual:

PAID

Result:

BUILD FAILURE

Detected by:

managerApprovalChangesStatus()

Evidence:

assessment-evidence/screenshots/tests/red-run.png

6. Correction Process

The incorrect status assignment was corrected:

expense.setStatus(ExpenseStatus.MANAGER_APPROVED);

Steps:

Analysed failing test output.
Identified incorrect status transition.
Corrected implementation.
Re-ran complete test suite.

Tools used:

Antigravity — failure analysis
Cursor — code correction and review
7. Final Verification

Command:

mvn test

Final result:

Tests run: 19
Failures: 0
Errors: 0


BUILD SUCCESS

Evidence:

assessment-evidence/screenshots/tests/fixed-run.png

Attempts:

Attempt 1
Implemented feature.
Tests failed due to incorrect workflow status.
Attempt 2
Fixed status transition.
All tests passed.

Total attempts: 2



Conclusion

This change demonstrates an AI-assisted engineering workflow where AI was used for analysis, implementation, testing, debugging, and validation.

The final feature was verified through automated testing and deliberate failure testing.