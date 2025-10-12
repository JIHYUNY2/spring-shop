package com.example.shop.order;

import com.example.shop.common.ApiResponse;
import com.example.shop.order.dto.CreateOrderRequest;
import com.example.shop.order.dto.OrderResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ApiResponse<OrderResponse> create(@RequestBody @Valid CreateOrderRequest req) {
        var order = orderService.create(req);
        return ApiResponse.ok(OrderResponse.from(order));
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> get(@PathVariable Long id) {
        var order = orderService.get(id);
        return ApiResponse.ok(OrderResponse.from(order));
    }
}