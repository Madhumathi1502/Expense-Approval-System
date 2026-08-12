package com.tactive.expense.repository;

import com.tactive.expense.entity.Expense;
import com.tactive.expense.entity.ExpenseStatus;
import com.tactive.expense.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    /**
     * Returns all expenses belonging to a specific employee.
     */
    List<Expense> findByEmployee(User employee);

    /**
     * Returns expenses in a given status (used by manager and finance endpoints).
     */
    List<Expense> findByStatus(ExpenseStatus status);
}
