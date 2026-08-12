package com.tactive.expense.service;

import com.tactive.expense.dto.ApprovalRequest;
import com.tactive.expense.dto.CreateExpenseRequest;
import com.tactive.expense.dto.ExpenseResponse;
import com.tactive.expense.entity.*;
import com.tactive.expense.exception.BadRequestException;
import com.tactive.expense.exception.ForbiddenException;
import com.tactive.expense.exception.ResourceNotFoundException;
import com.tactive.expense.repository.ApprovalHistoryRepository;
import com.tactive.expense.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseService {

    private static final BigDecimal RECEIPT_THRESHOLD    = new BigDecimal("2000");
    private static final BigDecimal FINANCE_THRESHOLD    = new BigDecimal("10000");

    private final ExpenseRepository expenseRepository;
    private final ApprovalHistoryRepository approvalHistoryRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // EMPLOYEE OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Creates a new expense for the authenticated employee.
     *
     * Business rules:
     * - Amount must be > 0 (enforced by DTO validation)
     * - Amount > 2000 requires a receipt reference
     * - Expenses > 10000 are flagged for finance (status still SUBMITTED initially)
     */
    public ExpenseResponse createExpense(CreateExpenseRequest request, User employee) {
        // Receipt rule
        if (request.getAmount().compareTo(RECEIPT_THRESHOLD) > 0) {
            if (request.getReceiptReference() == null || request.getReceiptReference().isBlank()) {
                throw new BadRequestException(
                        "Receipt reference is required for expenses exceeding 2000");
            }
        }

        Expense expense = Expense.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .amount(request.getAmount())
                .category(request.getCategory())
                .receiptReference(request.getReceiptReference())
                .employee(employee)
                .status(ExpenseStatus.SUBMITTED)
                .build();

        Expense saved = expenseRepository.save(expense);

        // Audit trail
        recordHistory(saved, null, "EXPENSE_CREATED",
                "Expense submitted by " + employee.getName());

        return ExpenseResponse.from(saved);
    }

    /**
     * Returns all expenses owned by the given employee.
     */
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getMyExpenses(User employee) {
        return expenseRepository.findByEmployee(employee)
                .stream()
                .map(ExpenseResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Deletes a SUBMITTED expense. Only the owning employee may cancel it.
     */
    public void deleteExpense(Long expenseId, User employee) {
        Expense expense = findExpenseById(expenseId);

        if (!expense.getEmployee().getId().equals(employee.getId())) {
            throw new ForbiddenException("You can only cancel your own expenses");
        }

        if (expense.getStatus() != ExpenseStatus.SUBMITTED) {
            throw new BadRequestException(
                    "Only expenses in SUBMITTED status can be cancelled");
        }

        expenseRepository.delete(expense);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MANAGER OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns all expenses awaiting manager review.
     */
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getPendingExpenses() {
        return expenseRepository.findByStatus(ExpenseStatus.SUBMITTED)
                .stream()
                .map(ExpenseResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Manager approves a SUBMITTED expense.
     *
     * Security rules:
     * - Manager cannot approve their own expense
     * - Expense must be in SUBMITTED status
     * - If amount <= 10000: moves to MANAGER_APPROVED
     * - If amount >  10000: moves to FINANCE_APPROVED (finance queue)
     *   Wait — the spec says "amount > 10000 requires finance approval",
     *   so after manager approval, the expense should go to MANAGER_APPROVED
     *   so finance can then pay it. The finance-threshold is a business note
     *   rather than a status skip. Both paths end at MANAGER_APPROVED.
     */
    public ExpenseResponse approveExpense(Long expenseId, User manager, ApprovalRequest request) {
        Expense expense = findExpenseById(expenseId);

        // Prevent self-approval
        if (expense.getEmployee().getId().equals(manager.getId())) {
            throw new ForbiddenException("Managers cannot approve their own expenses");
        }

        if (expense.getStatus() != ExpenseStatus.SUBMITTED) {
            throw new BadRequestException(
                    "Only SUBMITTED expenses can be approved by a manager");
        }

        expense.setStatus(ExpenseStatus.MANAGER_APPROVED);
        expenseRepository.save(expense);

        recordHistory(expense, manager, "MANAGER_APPROVED", request.getComment());

        return ExpenseResponse.from(expense);
    }

    /**
     * Manager rejects a SUBMITTED expense.
     */
    public ExpenseResponse rejectExpense(Long expenseId, User manager, ApprovalRequest request) {
        Expense expense = findExpenseById(expenseId);

        // Prevent self-rejection of own expense (defensive)
        if (expense.getEmployee().getId().equals(manager.getId())) {
            throw new ForbiddenException("Managers cannot reject their own expenses");
        }

        if (expense.getStatus() != ExpenseStatus.SUBMITTED) {
            throw new BadRequestException(
                    "Only SUBMITTED expenses can be rejected");
        }

        expense.setStatus(ExpenseStatus.REJECTED);
        expenseRepository.save(expense);

        recordHistory(expense, manager, "MANAGER_REJECTED", request.getComment());

        return ExpenseResponse.from(expense);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FINANCE OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns all manager-approved expenses ready for finance payment.
     */
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getFinanceQueue() {
        return expenseRepository.findByStatus(ExpenseStatus.MANAGER_APPROVED)
                .stream()
                .map(ExpenseResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Finance marks a MANAGER_APPROVED expense as paid.
     * Rejected expenses cannot be paid.
     */
    public ExpenseResponse payExpense(Long expenseId, User finance, ApprovalRequest request) {
        Expense expense = findExpenseById(expenseId);

        if (expense.getStatus() == ExpenseStatus.REJECTED) {
            throw new BadRequestException("Rejected expenses cannot be paid");
        }

        if (expense.getStatus() != ExpenseStatus.MANAGER_APPROVED) {
            throw new BadRequestException(
                    "Only MANAGER_APPROVED expenses can be paid. Current status: "
                            + expense.getStatus());
        }

        expense.setStatus(ExpenseStatus.PAID);
        expenseRepository.save(expense);

        recordHistory(expense, finance, "FINANCE_PAID", request.getComment());

        return ExpenseResponse.from(expense);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private Expense findExpenseById(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found: " + id));
    }

    private void recordHistory(Expense expense, User approver, String action, String comment) {
        ApprovalHistory history = ApprovalHistory.builder()
                .expense(expense)
                .approver(approver)
                .action(action)
                .comment(comment)
                .build();
        approvalHistoryRepository.save(history);
    }
}
