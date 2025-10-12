package com.example.shop.order;

import com.example.shop.common.NotFoundException;
import com.example.shop.order.dto.CreateOrderRequest;
import com.example.shop.product.Product;
import com.example.shop.product.ProductRepository;
import com.example.shop.product.ProductStock;
import com.example.shop.product.ProductStockRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductStockRepository stockRepository;

    @Transactional
    public Order create(CreateOrderRequest req) {
        // 주문 본문 생성
        Order order = Order.builder()
                .orderNo("O-" + UUID.randomUUID().toString().substring(0, 12))
                .status(OrderStatus.CREATED)
                .totalAmount(0L)
                .createdAt(LocalDateTime.now())
                .build();

        long total = 0L;

        for (var it : req.items()) {
            Product product = productRepository.findById(it.productId())
                    .orElseThrow(() -> new NotFoundException("상품 없음: " + it.productId()));

            // 재고 차감 (낙관적 락)
            ProductStock stock = stockRepository.findById(product.getId())
                    .orElseThrow(() -> new NotFoundException("재고 정보 없음: " + product.getId()));
            stock.decrease(it.quantity());       // 수량 감소 (부족하면 예외)
            // 저장 시 @Version 갱신 → 동시성 충돌 시 OptimisticLockingFailureException 발생

            long lineAmount = product.getPrice() * it.quantity();

            OrderItem oi = OrderItem.builder()
                    .product(product)
                    .priceSnapshot(product.getPrice())
                    .quantity(it.quantity())
                    .build();

            order.addItem(oi);
            total += lineAmount;
        }

        order.setTotalAmount(total);

        try {
            return orderRepository.save(order);
        } catch (OptimisticLockingFailureException e) {
            // 동시 차감 충돌 → 프론트/클라이언트에 재시도 유도
            throw new RuntimeException("동시에 주문이 생성되어 재고 충돌이 발생했습니다. 다시 시도해주세요.");
        }
    }

    public Order get(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("주문 없음: " + id));
    }
}