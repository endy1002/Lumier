package com.lumier.backend.dto.admin;

import java.time.OffsetDateTime;

public record AdminUpsertBlogRequest(
  String title,
  String slug,
  String excerpt,
  String contentHtml,
  String coverImageUrl,
  String sourceName,
  String seoTitle,
  String seoDescription,
  Boolean isPublished,
  OffsetDateTime publishedAt
) {
}
