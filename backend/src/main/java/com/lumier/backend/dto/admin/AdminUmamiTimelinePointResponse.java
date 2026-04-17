package com.lumier.backend.dto.admin;

public record AdminUmamiTimelinePointResponse(
  String timestamp,
  long pageviews,
  long sessions
) {
}
