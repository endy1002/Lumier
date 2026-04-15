package com.lumier.backend.dto.admin;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record AdminOrderResponse(
  Long id,
  String customerName,
  String customerEmail,
  String customerGoogleId,
  String customerPhone,
  String shippingAddress,
  String status,
  BigDecimal totalAmount,
  OffsetDateTime createdAt,
  List<AdminOrderItemResponse> items
) {
}
