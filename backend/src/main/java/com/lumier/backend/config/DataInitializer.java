package com.lumier.backend.config;

import com.lumier.backend.domain.Product;
import com.lumier.backend.domain.enums.ProductCategory;
import com.lumier.backend.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

  @Bean
  CommandLineRunner seedProducts(ProductRepository productRepository) {
    return args -> {
      if (productRepository.count() > 0) {
        return;
      }

      List<Product> products = List.of(
        createProduct("Tren doi mo mat va mo", ProductCategory.CHARM, 100000),
        createProduct("The Other Side", ProductCategory.CHARM, 100000),
        createProduct("Takahashi", ProductCategory.CHARM, 100000),
        createProduct("Ngon den khong tat", ProductCategory.CHARM, 100000),
        createProduct("Golden Book Charms Bookmark", ProductCategory.BOOKMARK, 50000),
        createProduct("Artistic Bookmarks Set", ProductCategory.BOOKMARK, 50000),
        createProduct("Lumier Classic Notebook", ProductCategory.NOTEBOOK, 85000),
        createProduct("The Storyteller Journal", ProductCategory.NOTEBOOK, 95000)
      );

      productRepository.saveAll(products);
    };
  }

  private Product createProduct(String name, ProductCategory category, long price) {
    Product product = new Product();
    product.setName(name);
    product.setCategory(category);
    product.setBasePrice(BigDecimal.valueOf(price));
    product.setAvailable(true);
    return product;
  }
}
