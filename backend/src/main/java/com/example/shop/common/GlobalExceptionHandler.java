package com.example.shop.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private ResponseEntity<?> fail(HttpStatus status, String code, String message) {
    return ResponseEntity.status(status)
        .body(ApiResponse.fail(code, message));
  }

  @ExceptionHandler(NotFoundException.class)
  public ResponseEntity<?> handleNotFound(NotFoundException e) {
    return fail(HttpStatus.NOT_FOUND, "NOT_FOUND", e.getMessage());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<?> handleValidation(MethodArgumentNotValidException e) {
    var msg = e.getBindingResult().getFieldErrors().stream()
        .findFirst().map(err -> err.getField() + " " + err.getDefaultMessage())
        .orElse("Validation error");
    return fail(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", msg);
  }

  @ExceptionHandler({
      MethodArgumentTypeMismatchException.class,
      MissingServletRequestParameterException.class
  })
  public ResponseEntity<?> handleBadParam(Exception e) {
    return fail(HttpStatus.BAD_REQUEST, "BAD_REQUEST", "잘못된 요청 파라미터입니다.");
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<?> handleJsonParse(HttpMessageNotReadableException e) {
    return fail(HttpStatus.BAD_REQUEST, "JSON_PARSE_ERROR", "요청 본문(JSON)을 해석할 수 없습니다.");
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> handleEtc(Exception e) {
    return fail(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", e.getMessage());
  }
}