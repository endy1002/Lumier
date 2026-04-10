package com.lumier.backend.repository;

import com.lumier.backend.domain.Product;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
  List<Product> findByIsAvailableTrueOrderByIdAsc();
}
