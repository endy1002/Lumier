package com.lumier.backend.dto.admin;

import java.time.OffsetDateTime;

public record AdminChatbotPreferenceItemResponse(
  Long userId,
  String name,
  String email,
  String genreOption,
  String readingTimeOption,
  String recentBookOption,
  OffsetDateTime updatedAt
) {
}
