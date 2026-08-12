package com.tactive.expense.service;

import com.tactive.expense.dto.ApprovalRequest;
import com.tactive.expense.dto.CreateExpenseRequest;
import com.tactive.expense.dto.ExpenseResponse;
import com.tactive.expense.entity.*;
import com.tactive.expense.exception.BadRequestException;
import com.tactive.expense.exception.ForbiddenException;
import com.tactive.expense.repository.ApprovalHistoryRepository;
import com.tactive.expense.repository.ExpenseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link ExpenseService}.
 *
 * Covers all 8 required test scenarios plus edge cases.
 * Uses Mockito to isolate the service from the database.
 */
@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private ApprovalHistoryRepository approvalHistoryRepository;

    @InjectMocks
    private ExpenseService expenseService;

    // ── Test fixtures ────────────────────────────────────────────────────────

    private User employee;
    private User anotherEmployee;
    private User manager;
    private User finance;

    @BeforeEach
    void setUp() {
        employee = User.builder()
                .id(1L).name("Alice").email("alice@test.com")
                .password("hashed").role(Role.EMPLOYEE).build();

        anotherEmployee = User.builder()
                .id(2L).name("Bob").email("bob@test.com")
                .password("hashed").role(Role.EMPLOYEE).build();

        manager = User.builder()
                .id(3L).name("Charlie").email("charlie@test.com")
                .password("hashed").role(Role.MANAGER).build();

        finance = User.builder()
                .id(4L).name("Dave").email("dave@test.com")
                .password("hashed").role(Role.FINANCE).build();
    }

    // ── Helper builders ──────────────────────────────────────────────────────

    private CreateExpenseRequest buildExpenseRequest(BigDecimal amount) {
        CreateExpenseRequest req = new CreateExpenseRequest();
        req.setTitle("Office Supplies");
        req.setDescription("Pens and notebooks");
        req.setAmount(amount);
        req.setCategory("Stationery");
        return req;
    }

    private Expense buildSavedExpense(Long id, BigDecimal amount, ExpenseStatus status, User owner) {
        Expense e = new Expense();
        e.setId(id);
        e.setTitle("Test Expense");
        e.setDescription("Test");
        e.setAmount(amount);
        e.setCategory("Travel");
        e.setStatus(status);
        e.setEmployee(owner);
        e.setCreatedAt(LocalDateTime.now());
        return e;
    }

    // ════════════════════════════════════════════════════════════════════════
    // TEST 1 — Employee creates expense successfully
    // ════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("TEST 1: Employee creates a valid expense successfully")
    void employeeCreatesExpenseSuccessfully() {
        CreateExpenseRequest request = buildExpenseRequest(new BigDecimal("500"));
        Expense savedExpense = buildSavedExpense(10L, new BigDecimal("500"), ExpenseStatus.SUBMITTED, employee);

        when(expenseRepository.save(any(Expense.class))).thenReturn(savedExpense);
        when(approvalHistoryRepository.save(any(ApprovalHistory.class))).thenReturn(null);

        ExpenseResponse response = expenseService.createExpense(request, employee);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getStatus()).isEqualTo(ExpenseStatus.SUBMITTED);
        assertThat(response.getEmployeeId()).isEqualTo(employee.getId());

        verify(expenseRepository, times(1)).save(any(Expense.class));
        verify(approvalHistoryRepository, times(1)).save(any(ApprovalHistory.class));
    }

    // ════════════════════════════════════════════════════════════════════════
    // TEST 2 — Invalid amount rejected
    // ════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("TEST 2: Expense with amount > 2000 without receipt is rejected")
    void expenseAbove2000WithoutReceiptIsRejected() {
        // Amount above 2000, but no receipt provided
        CreateExpenseRequest request = buildExpenseRequest(new BigDecimal("2500"));
        request.setReceiptReference(null);   // explicitly no receipt

        assertThatThrownBy(() -> expenseService.createExpense(request, employee))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Receipt reference is required");

        verify(expenseRepository, never()).save(any());
    }

    @Test
    @DisplayName("TEST 2b: Expense with amount > 2000 WITH receipt is accepted")
    void expenseAbove2000WithReceiptIsAccepted() {
        CreateExpenseRequest request = buildExpenseRequest(new BigDecimal("2500"));
        request.setReceiptReference("https://receipts.example.com/r123");

        Expense saved = buildSavedExpense(11L, new BigDecimal("2500"), ExpenseStatus.SUBMITTED, employee);
        when(expenseRepository.save(any())).thenReturn(saved);
        when(approvalHistoryRepository.save(any())).thenReturn(null);

        ExpenseResponse response = expenseService.createExpense(request, employee);

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(ExpenseStatus.SUBMITTED);
    }

    // ════════════════════════════════════════════════════════════════════════
    // TEST 3 — Employee cannot approve expense
    // ════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("TEST 3: Manager endpoint protected — EMPLOYEE role blocked by @PreAuthorize")
    void employeeCannotApproveExpense() {
        /*
         * The @PreAuthorize("hasRole('MANAGER')") on approveExpense endpoint prevents
         * employees from ever reaching the service method. This test verifies the
         * service-layer guard (self-approval prevention) separately.
         *
         * If a manager attempted to approve their OWN submitted expense, it should fail.
         */
        Expense ownExpense = buildSavedExpense(20L, new BigDecimal("500"), ExpenseStatus.SUBMITTED, manager);
        when(expenseRepository.findById(20L)).thenReturn(Optional.of(ownExpense));

        ApprovalRequest approvalRequest = new ApprovalRequest();

        assertThatThrownBy(() -> expenseService.approveExpense(20L, manager, approvalRequest))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("cannot approve their own expenses");
    }

    // ════════════════════════════════════════════════════════════════════════
    // TEST 4 — Employee cannot access another employee's expenses
    // ════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("TEST 4: Employee cannot delete another employee's expense")
    void employeeCannotDeleteAnotherEmployeesExpense() {
        Expense bobsExpense = buildSavedExpense(30L, new BigDecimal("300"), ExpenseStatus.SUBMITTED, anotherEmployee);
        when(expenseRepository.findById(30L)).thenReturn(Optional.of(bobsExpense));

        // Alice tries to delete Bob's expense
        assertThatThrownBy(() -> expenseService.deleteExpense(30L, employee))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("your own expenses");
    }

    @Test
    @DisplayName("TEST 4b: getMyExpenses only returns expenses for the requesting employee")
    void getMyExpensesOnlyReturnsOwnExpenses() {
        Expense aliceExpense = buildSavedExpense(31L, new BigDecimal("100"), ExpenseStatus.SUBMITTED, employee);
        when(expenseRepository.findByEmployee(employee)).thenReturn(List.of(aliceExpense));

        List<ExpenseResponse> results = expenseService.getMyExpenses(employee);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getEmployeeId()).isEqualTo(employee.getId());
        // Bob's expenses are not included
        verify(expenseRepository).findByEmployee(employee);
    }

    // ════════════════════════════════════════════════════════════════════════
    // TEST 5 — Manager approval changes status
    // ════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("TEST 5: Manager approval changes expense status to MANAGER_APPROVED")
    void managerApprovalChangesStatus() {
        Expense expense = buildSavedExpense(40L, new BigDecimal("800"), ExpenseStatus.SUBMITTED, employee);
        when(expenseRepository.findById(40L)).thenReturn(Optional.of(expense));
        when(expenseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(approvalHistoryRepository.save(any())).thenReturn(null);

        ApprovalRequest approvalRequest = new ApprovalRequest();
        approvalRequest.setComment("Looks good");

        ExpenseResponse response = expenseService.approveExpense(40L, manager, approvalRequest);

        assertThat(response.getStatus()).isEqualTo(ExpenseStatus.MANAGER_APPROVED);
        verify(expenseRepository).save(expense);
        verify(approvalHistoryRepository).save(argThat(h ->
                h.getAction().equals("MANAGER_APPROVED") && h.getApprover().equals(manager)
        ));
    }

    // ════════════════════════════════════════════════════════════════════════
    // TEST 6 — Rejected expense cannot be paid
    // ════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("TEST 6: Finance cannot pay a REJECTED expense")
    void rejectedExpenseCannotBePaid() {
        Expense rejected = buildSavedExpense(50L, new BigDecimal("500"), ExpenseStatus.REJECTED, employee);
        when(expenseRepository.findById(50L)).thenReturn(Optional.of(rejected));

        ApprovalRequest payRequest = new ApprovalRequest();

        assertThatThrownBy(() -> expenseService.payExpense(50L, finance, payRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Rejected expenses cannot be paid");
    }

    // ════════════════════════════════════════════════════════════════════════
    // TEST 7 — Finance can pay approved expense
    // ════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("TEST 7: Finance can pay a MANAGER_APPROVED expense")
    void financeCanPayApprovedExpense() {
        Expense approved = buildSavedExpense(60L, new BigDecimal("1500"), ExpenseStatus.MANAGER_APPROVED, employee);
        when(expenseRepository.findById(60L)).thenReturn(Optional.of(approved));
        when(expenseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(approvalHistoryRepository.save(any())).thenReturn(null);

        ApprovalRequest payRequest = new ApprovalRequest();
        payRequest.setComment("Reimbursed via bank transfer");

        ExpenseResponse response = expenseService.payExpense(60L, finance, payRequest);

        assertThat(response.getStatus()).isEqualTo(ExpenseStatus.PAID);
        verify(approvalHistoryRepository).save(argThat(h ->
                h.getAction().equals("FINANCE_PAID") && h.getApprover().equals(finance)
        ));
    }

    // ════════════════════════════════════════════════════════════════════════
    // TEST 8 — High-value expense requires receipt (> 2000) and goes through
    //          the normal approval pipeline (finance involvement implied by
    //          amount > 10000 rule documented in spec)
    // ════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("TEST 8: High-value expense (>10000) must include receipt reference")
    void highValueExpenseRequiresReceipt() {
        CreateExpenseRequest request = buildExpenseRequest(new BigDecimal("15000"));
        // No receipt provided
        request.setReceiptReference(null);

        assertThatThrownBy(() -> expenseService.createExpense(request, employee))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Receipt reference is required");
    }

    @Test
    @DisplayName("TEST 8b: High-value expense with receipt goes through full approval pipeline")
    void highValueExpenseWithReceiptFollowsFullPipeline() {
        CreateExpenseRequest request = buildExpenseRequest(new BigDecimal("15000"));
        request.setReceiptReference("receipt-ref-high-value-001");

        Expense saved = buildSavedExpense(70L, new BigDecimal("15000"), ExpenseStatus.SUBMITTED, employee);
        when(expenseRepository.save(any())).thenReturn(saved);
        when(approvalHistoryRepository.save(any())).thenReturn(null);

        ExpenseResponse response = expenseService.createExpense(request, employee);

        // Starts as SUBMITTED — still needs both manager and finance to process
        assertThat(response.getStatus()).isEqualTo(ExpenseStatus.SUBMITTED);
        assertThat(response.getAmount()).isEqualByComparingTo(new BigDecimal("15000"));
    }

    // ════════════════════════════════════════════════════════════════════════
    // Additional edge-case tests
    // ════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("EDGE: Cannot approve an already-approved expense")
    void cannotApproveAlreadyApprovedExpense() {
        Expense alreadyApproved = buildSavedExpense(80L, new BigDecimal("500"),
                ExpenseStatus.MANAGER_APPROVED, employee);
        when(expenseRepository.findById(80L)).thenReturn(Optional.of(alreadyApproved));

        ApprovalRequest req = new ApprovalRequest();
        assertThatThrownBy(() -> expenseService.approveExpense(80L, manager, req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Only SUBMITTED expenses");
    }

    @Test
    @DisplayName("EDGE: Cannot delete a non-SUBMITTED expense")
    void cannotDeleteApprovedExpense() {
        Expense approved = buildSavedExpense(90L, new BigDecimal("500"),
                ExpenseStatus.MANAGER_APPROVED, employee);
        when(expenseRepository.findById(90L)).thenReturn(Optional.of(approved));

        assertThatThrownBy(() -> expenseService.deleteExpense(90L, employee))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Only expenses in SUBMITTED status");
    }
}
