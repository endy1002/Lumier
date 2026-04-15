package com.lumier.backend.dto.blog;

import java.time.OffsetDateTime;

public record BlogDetailResponse(
  Long id,
  String slug,
  String title,
  String excerpt,
  String contentHtml,
  String coverImageUrl,
  String sourceName,
  String seoTitle,
  String seoDescription,
  OffsetDateTime publishedAt,
  Integer readingTimeMinutes
) {
}
