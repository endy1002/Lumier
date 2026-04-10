package com.lumier.backend.dto;

import com.lumier.backend.domain.enums.OrderStatus;
import java.math.BigDecimal;

public record CheckoutResponse(
  Long orderId,
  OrderStatus status,
  BigDecimal totalAmount
) {
}
