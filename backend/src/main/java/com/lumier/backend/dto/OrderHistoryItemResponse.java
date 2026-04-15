package com.lumier.backend.dto;

import java.math.BigDecimal;
import java.util.List;

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
  boolean hasUploadedCover,
  boolean hasAudiobookCode,
  List<String> audiobookCodes
) {
}
