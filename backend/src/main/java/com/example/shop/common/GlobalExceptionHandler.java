package com.example.shop.common;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<?> handleValidation(MethodArgumentNotValidException e) {
    String msg = e.getBindingResult().getFieldErrors().stream()
      .map(fe -> fe.getField() + " " + fe.getDefaultMessage())
      .findFirst().orElse("Validation error");
    return ResponseEntity.badRequest().body(ApiResponse.fail(ErrorCode.VALIDATION_ERROR, msg));
  }

  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<?> handleConstraint(ConstraintViolationException e) {
    return ResponseEntity.badRequest().body(ApiResponse.fail(ErrorCode.VALIDATION_ERROR, e.getMessage()));
  }

  @ExceptionHandler(NotFoundException.class)
  public ResponseEntity<?> handleNotFound(NotFoundException e) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail(ErrorCode.NOT_FOUND, e.getMessage()));
  }

  @ExceptionHandler(IllegalStateException.class)
  public ResponseEntity<?> handleBusiness(IllegalStateException e) {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.fail(ErrorCode.BUSINESS_ERROR, e.getMessage()));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> handleUnknown(Exception e) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
      .body(ApiResponse.fail(ErrorCode.INTERNAL_ERROR, "Unexpected error"));
  }
}