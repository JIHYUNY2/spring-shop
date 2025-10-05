package com.example.shop.product.dto;

import com.example.shop.product.domain.Product;
import java.time.LocalDateTime;

public record ProductResponse(
  Long id, String name, Long price, String description, LocalDateTime createdAt
) {
  public static ProductResponse of(Product p) {
    return new ProductResponse(p.getId(), p.getName(), p.getPrice(), p.getDescription(), p.getCreatedAt());
  }
}