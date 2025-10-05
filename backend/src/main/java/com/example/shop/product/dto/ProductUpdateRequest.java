package com.example.shop.product.dto;

import jakarta.validation.constraints.*;

public record ProductUpdateRequest(
  @Size(max = 100) String name,
  @Positive Long price,
  @Size(max = 1000) String description
) {}