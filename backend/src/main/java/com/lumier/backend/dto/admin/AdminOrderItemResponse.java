package com.lumier.backend.dto.admin;

import java.math.BigDecimal;

public record AdminOrderItemResponse(
  Long id,
  Long productId,
  String productName,
  int quantity,
  BigDecimal itemSubtotal
) {
}
