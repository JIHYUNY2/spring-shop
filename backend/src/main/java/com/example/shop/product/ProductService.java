package com.example.shop.product;

import com.example.shop.common.NotFoundException;
import com.example.shop.product.domain.Product;
import com.example.shop.product.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @Transactional(readOnly = true)
public class ProductService {
  private final ProductRepository repo;
  public ProductService(ProductRepository repo) { this.repo = repo; }

  @Transactional
  public ProductResponse create(ProductCreateRequest req) {
    Product saved = repo.save(Product.create(req.name(), req.price(), req.description()));
    return ProductResponse.of(saved);
  }

  public Page<ProductResponse> list(Pageable pageable) {
    return repo.findAll(pageable).map(ProductResponse::of);
  }

  public ProductResponse get(Long id) {
    Product p = repo.findById(id).orElseThrow(() -> new NotFoundException("상품이 존재하지 않습니다."));
    return ProductResponse.of(p);
  }

  @Transactional
  public ProductResponse update(Long id, ProductUpdateRequest req) {
    Product p = repo.findById(id).orElseThrow(() -> new NotFoundException("상품이 존재하지 않습니다."));
    p.update(req.name(), req.price(), req.description());
    return ProductResponse.of(p);
  }

  @Transactional
  public void delete(Long id) {
    if (!repo.existsById(id)) throw new NotFoundException("상품이 존재하지 않습니다.");
    repo.deleteById(id);
  }
}