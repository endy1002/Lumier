package com.lumier.backend.dto.admin;

import java.time.OffsetDateTime;

public record AdminBlogItemResponse(
  Long id,
  String slug,
  String title,
  String excerpt,
  String contentHtml,
  String coverImageUrl,
  String sourceName,
  String seoTitle,
  String seoDescription,
  Boolean isPublished,
  OffsetDateTime publishedAt,
  OffsetDateTime createdAt,
  OffsetDateTime updatedAt,
  Integer readingTimeMinutes
) {
}
