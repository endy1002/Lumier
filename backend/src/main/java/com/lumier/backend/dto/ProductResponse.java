package com.lumier.backend.dto;

import com.lumier.backend.domain.enums.ProductCategory;
import java.math.BigDecimal;

public record ProductResponse(
  Long id,
  String name,
  ProductCategory category,
  BigDecimal basePrice,
  boolean isAvailable
) {
}
