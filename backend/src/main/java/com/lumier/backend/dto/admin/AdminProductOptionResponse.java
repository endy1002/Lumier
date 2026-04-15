package com.lumier.backend.dto.admin;

import com.lumier.backend.domain.enums.ProductCategory;
import java.math.BigDecimal;

public record AdminProductOptionResponse(
  Long id,
  String name,
  ProductCategory category,
  BigDecimal basePrice,
  String imageUrl,
  boolean isAvailable,
  boolean hasAudiobook
) {
}
