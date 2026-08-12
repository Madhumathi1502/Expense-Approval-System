package com.tactive.expense.dto;

import com.tactive.expense.entity.Expense;
import com.tactive.expense.entity.ExpenseStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ExpenseResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal amount;
    private String category;
    private String receiptReference;
    private ExpenseStatus status;
    private Long employeeId;
    private String employeeName;
    private LocalDateTime createdAt;

    /**
     * Converts a persisted Expense entity to its API response representation.
     */
    public static ExpenseResponse from(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .title(expense.getTitle())
                .description(expense.getDescription())
                .amount(expense.getAmount())
                .category(expense.getCategory())
                .receiptReference(expense.getReceiptReference())
                .status(expense.getStatus())
                .employeeId(expense.getEmployee().getId())
                .employeeName(expense.getEmployee().getName())
                .createdAt(expense.getCreatedAt())
                .build();
    }
}
