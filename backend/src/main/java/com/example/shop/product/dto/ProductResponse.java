package com.example.shop.product.dto;

import java.time.LocalDateTime;

import com.example.shop.product.Product;

public record ProductResponse(Long id, String name, Long price, String description, LocalDateTime createdAt) {
  public static ProductResponse of(Product p) {
    return new ProductResponse(p.getId(), p.getName(), p.getPrice(), p.getDescription(), p.getCreatedAt());
  }
}