package com.lumier.backend.dto.admin;

import com.lumier.backend.domain.enums.ProductCategory;
import java.math.BigDecimal;

public record AdminUpsertProductRequest(
  String name,
  ProductCategory category,
  BigDecimal basePrice,
  String imageUrl,
  Boolean isAvailable,
  String audiobookTitle,
  Long audiobookAuthorId,
  String audiobookAuthorName,
  String audiobookNarrator,
  Integer audiobookDurationMinutes,
  String audiobookSummary,
  String audiobookAudioFileUrl,
  String audiobookAudioFormat,
  Integer audiobookDisplayOrder,
  Boolean audiobookIsActive,
  String audiobookCoverImageUrl
) {
}
