package com.example.shop.product.dto;

public class StockDtos {
    public record StockResponse(Long productId, Long quantity, Long version) {}

    // 수량을 '설정' (절대값)
    public record SetStockRequest(Long quantity) {}

    // 수량을 '증감' (상대값, 예: +10, -5)
    public record AdjustStockRequest(Long delta) {}
}