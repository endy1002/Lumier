package com.lumier.backend.dto.blog;

import java.time.OffsetDateTime;

public record BlogCardResponse(
  Long id,
  String slug,
  String title,
  String excerpt,
  String coverImageUrl,
  String sourceName,
  OffsetDateTime publishedAt,
  Integer readingTimeMinutes
) {
}
