package com.lumier.backend.dto.admin;

public record AdminUpdateAudiobookRequest(
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
  Integer displayOrder,
  Boolean isActive
) {
}
