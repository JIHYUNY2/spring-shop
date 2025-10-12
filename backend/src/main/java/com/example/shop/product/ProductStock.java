package com.example.shop.product;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_stock")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductStock {

    @Id
    private Long productId; // Product ID와 동일

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(nullable = false)
    private Long quantity;

    @Version
    private Long version; // ✨ 낙관적 락 버전

    public void decrease(long qty) {
        if (this.quantity < qty) {
            throw new InsufficientStockException(
                "재고 부족: 요청=" + qty + ", 보유=" + this.quantity
            );
        }
        this.quantity -= qty;
    }
}