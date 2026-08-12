package com.tactive.expense.repository;

import com.tactive.expense.entity.ApprovalHistory;
import com.tactive.expense.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApprovalHistoryRepository extends JpaRepository<ApprovalHistory, Long> {

    /**
     * Returns full audit trail for a specific expense, ordered chronologically.
     */
    List<ApprovalHistory> findByExpenseOrderByTimestampAsc(Expense expense);
}
