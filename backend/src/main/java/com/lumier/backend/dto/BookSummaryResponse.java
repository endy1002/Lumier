package com.lumier.backend.dto;

public record BookSummaryResponse(
  Long id,
  String title,
  String author,
  String excerpt,
  String tag
) {
}
