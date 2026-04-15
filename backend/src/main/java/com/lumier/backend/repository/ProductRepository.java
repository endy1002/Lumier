package com.lumier.backend.repository;

import com.lumier.backend.domain.Product;
import com.lumier.backend.domain.enums.ProductCategory;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
  List<Product> findByIsAvailableTrueOrderByIdAsc();

  List<Product> findAllByOrderByIdAsc();

  List<Product> findByCategoryOrderByIdAsc(ProductCategory category);

  Optional<Product> findByIdAndCategory(Long id, ProductCategory category);
}
