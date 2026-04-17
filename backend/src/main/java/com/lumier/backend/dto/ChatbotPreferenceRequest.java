package com.lumier.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatbotPreferenceRequest(
  @NotBlank String genreOption,
  @NotBlank String readingTimeOption,
  @NotBlank String recentBookOption
) {
}
