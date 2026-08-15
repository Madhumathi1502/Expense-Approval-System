# User Guide — ExpenseFlow

## Welcome to ExpenseFlow

ExpenseFlow makes the expense reimbursement process simple and transparent.

Instead of handling approvals manually, employees can submit expenses online, managers can review them, and finance teams can complete payments from one system.

The workflow is:
Employee submits expense
↓
Manager reviews request
↓
Finance processes payment





---


# Getting Started


Open the application in your browser:



http://localhost:3000



You will be taken to the login page.


Enter:


- Email address
- Password


After successful login, you will be redirected to your dashboard based on your role:


- Employee
- Manager
- Finance




---


# Employee Guide


## Submitting an Expense


Employees can create new expense requests from their dashboard.


Steps:


1. Login using your employee account.
2. Open the **New Expense** section.
3. Enter the required details:


   - Expense title
   - Amount
   - Category
   - Description (optional)
   - Receipt reference (required for expenses above ₹2,000)


4. Click **Submit Expense**.


After submission, the expense status will be:



SUBMITTED



This means the expense is waiting for manager review.




---


## Viewing Your Expenses


Employees can track their submitted expenses from their dashboard.


You can view:


- Expense title
- Amount
- Category
- Current status
- Submission date




Employees can only view their own expenses.




---


## Cancelling an Expense


An employee can cancel an expense only while it is waiting for approval.


The expense must have the status:



SUBMITTED



Once a manager approves or rejects the request, it cannot be cancelled.




---


# Manager Guide


Managers are responsible for reviewing employee expenses.


Steps:


1. Login using your manager account.
2. Open the pending expense list.
3. Review the expense details.
4. Choose one action:


- Approve
- Reject




If approved, the expense moves to:



MANAGER_APPROVED



and becomes available for finance processing.




If rejected, the expense status becomes:



REJECTED





Managers cannot approve their own expenses.




---


# Finance Guide


Finance users handle the final payment step.


Steps:


1. Login using your finance account.
2. Open the approved expense list.
3. Review the approved requests.
4. Click **Mark Paid**.


The expense status changes:



MANAGER_APPROVED → PAID

Only manager-approved expenses can be processed for payment.


---

# Understanding Expense Status

| Status | Meaning |
|---|---|
| SUBMITTED | Expense is waiting for manager review |
| MANAGER_APPROVED | Approved by manager and waiting for payment |
| REJECTED | Expense was rejected |
| PAID | Reimbursement has been completed |


---

# Common Issues

| Problem | Solution |
|---|---|
| Unable to login | Check your email and password |
| Email already exists | Login with existing account |
| Amount exceeds limit | Enter an amount below ₹1,00,000 |
| Receipt required | Add receipt reference for higher amounts |
| Access denied | Login with the correct role account |


---

# ExpenseFlow Journey

Using ExpenseFlow is simple:

1. Employee submits an expense.
2. Manager reviews and approves/rejects it.
3. Finance completes the reimbursement.

The system provides a secure and easy way to manage expenses with clear status tracking at every step.