package com.example.shop.product;

import com.example.shop.common.ApiResponse;
import com.example.shop.product.dto.ProductCreateRequest;
import com.example.shop.product.dto.ProductResponse;
import com.example.shop.product.dto.ProductUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @Operation(summary = "상품 등록")
    @PostMapping
    public ResponseEntity<?> create(@RequestBody ProductCreateRequest req) {
        ProductResponse created = service.create(req);
        return ResponseEntity.status(201).body(ApiResponse.ok(created));
    }

    @Operation(summary = "상품 목록")
    @GetMapping
    public ResponseEntity<?> list(
            @ParameterObject
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        var page = service.list(pageable);
        return ResponseEntity.ok(ApiResponse.ok(page));
    }

    @Operation(summary = "상품 상세")
    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(service.get(id)));
    }

    @Operation(summary = "상품 수정(PATCH)")
    @PatchMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @RequestBody ProductUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(service.update(id, req)));
    }

    @Operation(summary = "상품 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}