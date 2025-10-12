package com.example.shop.product;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/stocks")
@RequiredArgsConstructor
public class ProductStockController {

    private final ProductStockRepository stockRepository;
    private final ProductRepository productRepository;

    /** 재고 등록 (상품 생성 후 따로 재고 추가) */
    @PostMapping("/{productId}")
    public ProductStock create(@PathVariable Long productId, @RequestBody StockRequest req) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));
        ProductStock stock = ProductStock.builder()
                .product(product)
                .quantity(req.quantity())
                .build();
        return stockRepository.save(stock);
    }

    /** 재고 조회 */
    @GetMapping("/{productId}")
    public ProductStock get(@PathVariable Long productId) {
        return stockRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("재고 정보가 없습니다."));
    }

    /** DTO */
    public record StockRequest(Long quantity) {}
}