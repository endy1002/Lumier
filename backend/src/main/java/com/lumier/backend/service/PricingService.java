package com.lumier.backend.service;

import com.lumier.backend.domain.Product;
import com.lumier.backend.domain.enums.ProductCategory;
import com.lumier.backend.dto.CheckoutRequest.CustomizationRequest;
import java.math.BigDecimal;
import org.springframework.stereotype.Service;

@Service
public class PricingService {

  private static final BigDecimal BASE_BOOK_CHARM_PRICE = BigDecimal.valueOf(100000);
  private static final BigDecimal CUSTOM_COVER_BASE_PRICE = BigDecimal.valueOf(150000);
  private static final BigDecimal CUSTOM_ADDON_PRICE = BigDecimal.valueOf(50000);

  public BigDecimal calculateItemSubtotal(Product product, CustomizationRequest customization, int quantity) {
    BigDecimal unitPrice;

    if (product.getCategory() == ProductCategory.CHARM) {
      boolean hasCustomCover = customization != null && hasText(customization.getUploadedCoverUrl());
      unitPrice = hasCustomCover ? CUSTOM_COVER_BASE_PRICE : BASE_BOOK_CHARM_PRICE;

      if (customization != null && hasText(customization.getEngravedText())) {
        unitPrice = unitPrice.add(CUSTOM_ADDON_PRICE);
      }

      if (customization != null && Boolean.TRUE.equals(customization.getHasExtraChain())) {
        unitPrice = unitPrice.add(CUSTOM_ADDON_PRICE);
      }
    } else {
      unitPrice = product.getBasePrice();
    }

    return unitPrice.multiply(BigDecimal.valueOf(Math.max(1, quantity)));
  }

  private boolean hasText(String value) {
    return value != null && !value.isBlank();
  }
}
