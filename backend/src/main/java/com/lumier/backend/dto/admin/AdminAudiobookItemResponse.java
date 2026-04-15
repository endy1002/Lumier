package com.lumier.backend.dto.admin;

public record AdminAudiobookItemResponse(
  Long id,
  Long productId,
  String productName,
  Long authorId,
  String authorName,
  String title,
  String narrator,
  Integer durationMinutes,
  String coverImageUrl,
  String summary,
  String audioFileUrl,
  String audioFormat,
  int displayOrder,
  boolean isActive
) {
}
