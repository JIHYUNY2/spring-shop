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
  private Long price;

  @Column(length = 1000)
  private String description;

  @Column(nullable = false)
  private LocalDateTime createdAt;

  protected Product() {}

  private Product(String name, Long price, String description) {
    this.name = name;
    this.price = price;
    this.description = description;
    this.createdAt = LocalDateTime.now();
  }

  public static Product create(String name, Long price, String description) {
    return new Product(name, price, description);
  }

  public void changeName(String name) { if (name != null) this.name = name; }
  public void changePrice(Long price) { if (price != null) this.price = price; }
  public void changeDescription(String d) { if (d != null) this.description = d; }

  // getters
  public Long getId() { return id; }
  public String getName() { return name; }
  public Long getPrice() { return price; }
  public String getDescription() { return description; }
  public LocalDateTime getCreatedAt() { return createdAt; }
}