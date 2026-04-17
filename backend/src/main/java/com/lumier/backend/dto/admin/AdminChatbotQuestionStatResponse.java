package com.lumier.backend.dto.admin;

import java.util.List;

public record AdminChatbotQuestionStatResponse(
  String questionKey,
  long responses,
  List<AdminChatbotOptionStatResponse> options
) {
}
