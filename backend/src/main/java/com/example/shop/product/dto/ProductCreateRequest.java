package com.example.shop.product.dto;

import jakarta.validation.constraints.*;

public record ProductCreateRequest(
  @NotBlank @Size(max = 100) String name,
  @NotNull @Positive Long price,
  @Size(max = 1000) String description
) {}