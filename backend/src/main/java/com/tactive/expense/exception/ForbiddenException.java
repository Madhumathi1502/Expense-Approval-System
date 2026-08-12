package com.tactive.expense.exception;

/**
 * Thrown when the authenticated user attempts an action they are not allowed to perform (403).
 */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
