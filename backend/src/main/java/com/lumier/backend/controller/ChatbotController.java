package com.lumier.backend.controller;

import com.lumier.backend.domain.UserProfile;
import com.lumier.backend.dto.ChatbotPreferenceRequest;
import com.lumier.backend.service.UserProfileService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

  private final UserProfileService userProfileService;

  public ChatbotController(UserProfileService userProfileService) {
    this.userProfileService = userProfileService;
  }

  @PostMapping("/preferences")
  public Map<String, Object> savePreferences(
    @RequestParam String googleId,
    @Valid @RequestBody ChatbotPreferenceRequest request
  ) {
    UserProfile user = userProfileService.updateChatbotPreferences(
      googleId,
      request.genreOption(),
      request.readingTimeOption(),
      request.recentBookOption()
    );

    return Map.of(
      "status", "saved",
      "updatedAt", user.getChatbotPreferencesUpdatedAt()
    );
  }
}
