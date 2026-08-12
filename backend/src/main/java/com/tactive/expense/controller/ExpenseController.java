package com.tactive.expense.controller;

import com.tactive.expense.dto.ApprovalRequest;
import com.tactive.expense.dto.CreateExpenseRequest;
import com.tactive.expense.dto.ExpenseResponse;
import com.tactive.expense.entity.User;
import com.tactive.expense.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    // ─────────────────────────────────────────────────────────────────────────
    // EMPLOYEE ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/expenses
     * Employee creates a new expense.
     */
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ExpenseResponse> createExpense(
            @Valid @RequestBody CreateExpenseRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(expenseService.createExpense(request, currentUser));
    }

    /**
     * GET /api/expenses/my
     * Employee views their own expenses.
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<ExpenseResponse>> getMyExpenses(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(expenseService.getMyExpenses(currentUser));
    }

    /**
     * DELETE /api/expenses/{id}
     * Employee cancels a pending (SUBMITTED) expense.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        expenseService.deleteExpense(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MANAGER ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/expenses/pending
     * Manager views all SUBMITTED expenses.
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<ExpenseResponse>> getPendingExpenses() {
        return ResponseEntity.ok(expenseService.getPendingExpenses());
    }

    /**
     * PUT /api/expenses/{id}/approve
     * Manager approves an expense.
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ExpenseResponse> approveExpense(
            @PathVariable Long id,
            @RequestBody(required = false) ApprovalRequest request,
            @AuthenticationPrincipal User currentUser) {
        if (request == null) request = new ApprovalRequest();
        return ResponseEntity.ok(expenseService.approveExpense(id, currentUser, request));
    }

    /**
     * PUT /api/expenses/{id}/reject
     * Manager rejects an expense.
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ExpenseResponse> rejectExpense(
            @PathVariable Long id,
            @RequestBody(required = false) ApprovalRequest request,
            @AuthenticationPrincipal User currentUser) {
        if (request == null) request = new ApprovalRequest();
        return ResponseEntity.ok(expenseService.rejectExpense(id, currentUser, request));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FINANCE ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/expenses/finance
     * Finance views manager-approved expenses ready for payment.
     */
    @GetMapping("/finance")
    @PreAuthorize("hasRole('FINANCE')")
    public ResponseEntity<List<ExpenseResponse>> getFinanceQueue() {
        return ResponseEntity.ok(expenseService.getFinanceQueue());
    }

    /**
     * PUT /api/expenses/{id}/pay
     * Finance marks a manager-approved expense as paid.
     */
    @PutMapping("/{id}/pay")
    @PreAuthorize("hasRole('FINANCE')")
    public ResponseEntity<ExpenseResponse> payExpense(
            @PathVariable Long id,
            @RequestBody(required = false) ApprovalRequest request,
            @AuthenticationPrincipal User currentUser) {
        if (request == null) request = new ApprovalRequest();
        return ResponseEntity.ok(expenseService.payExpense(id, currentUser, request));
    }
}
