package com.example.shop.product.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name = "products")
public class Product {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 100)
  private String name;

  @Column(nullable = false)
  private Long price; // 원단위

  @Column(length = 1000)
  private String description;

  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @PrePersist void prePersist() { this.createdAt = LocalDateTime.now(); }

  public static Product create(String name, Long price, String description) {
    Product p = new Product();
    p.name = name; p.price = price; p.description = description;
    return p;
  }

  public void update(String name, Long price, String description) {
    if (name != null && !name.isBlank()) this.name = name;
    if (price != null && price > 0) this.price = price;
    if (description != null) this.description = description;
  }

  public Long getId() { return id; }
  public String getName() { return name; }
  public Long getPrice() { return price; }
  public String getDescription() { return description; }
  public LocalDateTime getCreatedAt() { return createdAt; }
}