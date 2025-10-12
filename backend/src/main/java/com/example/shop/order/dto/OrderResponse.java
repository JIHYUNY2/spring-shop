package com.example.shop.order.dto;

import com.example.shop.order.Order;
import com.example.shop.order.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNo,
        OrderStatus status,
        Long totalAmount,
        LocalDateTime createdAt,
        List<OrderLine> items
) {
    public static OrderResponse from(Order o) {
        return new OrderResponse(
                o.getId(),
                o.getOrderNo(),
                o.getStatus(),
                o.getTotalAmount(),
                o.getCreatedAt(),
                o.getItems().stream()
                        .map(oi -> new OrderLine(
                                oi.getId(),
                                oi.getProduct().getId(),
                                oi.getProduct().getName(),
                                oi.getPriceSnapshot(),
                                oi.getQuantity()
                        ))
                        .toList()
        );
    }

    public record OrderLine(
            Long id, Long productId, String productName, Long price, Long quantity
    ) {}
}