package com.lumier.backend.controller;

import com.lumier.backend.dto.ProductResponse;
import com.lumier.backend.repository.ProductRepository;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {

  private final ProductRepository productRepository;

  public ProductController(ProductRepository productRepository) {
    this.productRepository = productRepository;
  }

  @GetMapping
  public List<ProductResponse> getProducts() {
    return productRepository.findByIsAvailableTrueOrderByIdAsc().stream()
      .map(p -> new ProductResponse(
        p.getId(),
        p.getName(),
        p.getCategory(),
        p.getBasePrice(),
        p.isAvailable()
      ))
      .toList();
  }
}
