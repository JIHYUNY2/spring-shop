package com.example.shop.common;

public record ApiResponse<T>(boolean success, T data, ErrorBody error) {
  public static <T> ApiResponse<T> ok(T data) { return new ApiResponse<>(true, data, null); }
  public static ApiResponse<?> fail(ErrorCode code, String message) {
    return new ApiResponse<>(false, null, new ErrorBody(code.name(), message));
  }
  public record ErrorBody(String code, String message) {}
}