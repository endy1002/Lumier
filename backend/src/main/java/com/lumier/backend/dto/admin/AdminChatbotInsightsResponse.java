package com.lumier.backend.dto.admin;

import java.util.List;

public record AdminChatbotInsightsResponse(
  int totalProfilesWithPreferences,
  List<AdminChatbotQuestionStatResponse> questions,
  List<AdminChatbotPreferenceItemResponse> entries
) {
}
