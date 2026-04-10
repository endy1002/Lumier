package com.lumier.backend.dto;

import java.math.BigDecimal;

public record OrderHistoryItemResponse(
  Long id,
  Long productId,
  String productName,
  int quantity,
  BigDecimal itemSubtotal,
  String spineColorHex,
  String engravedText,
  String hardwareType,
  Boolean hasExtraChain,
  boolean hasUploadedCover
) {
}
