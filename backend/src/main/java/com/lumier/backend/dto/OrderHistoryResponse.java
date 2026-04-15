package com.lumier.backend.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record OrderHistoryResponse(
  Long orderId,
  String status,
  BigDecimal totalAmount,
  OffsetDateTime createdAt,
  List<OrderHistoryItemResponse> items,
  boolean hasAudiobookCode,
  List<String> audiobookCodes
) {
}
