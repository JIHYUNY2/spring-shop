package com.example.shop.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(NotFoundException.class)
  public ResponseEntity<?> handleNotFound(NotFoundException e) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(ApiResponse.fail("NOT_FOUND", e.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<?> handleValidation(MethodArgumentNotValidException e) {
    var msg = e.getBindingResult().getFieldErrors().stream()
        .findFirst().map(err -> err.getField() + " " + err.getDefaultMessage())
        .orElse("Validation error");
    return ResponseEntity.badRequest().body(ApiResponse.fail("VALIDATION_ERROR", msg));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> handleEtc(Exception e) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ApiResponse.fail("INTERNAL_ERROR", e.getMessage()));
  }
}