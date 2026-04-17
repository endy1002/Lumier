package com.lumier.backend.dto.admin;

public record AdminUmamiBreakdownItemResponse(
  String name,
  long visitors,
  long pageviews,
  long visits,
  long bounces,
  long totalTime
) {
}
