package com.example.shop.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreateOrderRequest(
        @NotEmpty List<Item> items
) {
    public record Item(
            @NotNull Long productId,
            @Min(1) long quantity
    ) {}
}