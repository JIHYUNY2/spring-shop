package com.example.shop.product;

import com.example.shop.common.NotFoundException;
import com.example.shop.product.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProductService {

  private final ProductRepository repo;

  public ProductService(ProductRepository repo) { this.repo = repo; }

  @Transactional
  public ProductResponse create(ProductCreateRequest req) {
    var saved = repo.save(Product.create(req.name(), req.price(), req.description()));
    return ProductResponse.of(saved);
  }

  public Page<ProductResponse> list(Pageable pageable) {
    return repo.findAll(pageable).map(ProductResponse::of);
  }

  public ProductResponse get(Long id) {
    var p = repo.findById(id).orElseThrow(() -> new NotFoundException("Product " + id + " not found"));
    return ProductResponse.of(p);
  }

  @Transactional
  public ProductResponse update(Long id, ProductUpdateRequest req) {
    var p = repo.findById(id).orElseThrow(() -> new NotFoundException("Product " + id + " not found"));
    p.changeName(req.name());
    p.changePrice(req.price());
    p.changeDescription(req.description());
    return ProductResponse.of(p);
  }

  @Transactional
  public void delete(Long id) {
    if (!repo.existsById(id)) throw new NotFoundException("Product " + id + " not found");
    repo.deleteById(id);
  }
}