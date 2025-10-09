package com.example.shop.product;

import com.example.shop.common.ApiResponse;
import com.example.shop.product.dto.ProductCreateRequest;
import com.example.shop.product.dto.ProductResponse;
import com.example.shop.product.dto.ProductUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @Operation(summary = "상품 등록")
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> create(
            @RequestBody @Valid ProductCreateRequest req
    ) {
        var created = service.create(req);
        return ResponseEntity.status(201).body(ApiResponse.ok(created));
    }

    @Operation(summary = "상품 목록", description = "예) page=0&size=10&sort=id,desc")
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<?>> list(
            @ParameterObject
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok(service.list(pageable)));
    }

    @Operation(summary = "상품 상세", description = "상품 ID로 상세 정보를 조회합니다.")
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> get(
            @Parameter(name = "id", description = "상품 ID", required = true, example = "1")
            @PathVariable("id") Long id   // ★ 이름을 명시해서 Swagger가 확실히 인식하도록
    ) {
        return ResponseEntity.ok(ApiResponse.ok(service.get(id)));
    }

    @Operation(summary = "상품 수정(PATCH)")
    @PatchMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @Parameter(name = "id", description = "상품 ID", required = true, example = "1")
            @PathVariable("id") Long id,
            @RequestBody @Valid ProductUpdateRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.ok(service.update(id, req)));
    }

    @Operation(summary = "상품 삭제", description = "성공 시 204 반환")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(name = "id", description = "상품 ID", required = true, example = "1")
            @PathVariable("id") Long id
    ) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}