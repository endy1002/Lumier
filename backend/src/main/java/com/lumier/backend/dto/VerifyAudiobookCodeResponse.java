package com.lumier.backend.dto;

public record VerifyAudiobookCodeResponse(
  boolean success,
  Long audiobookId,
  String message
) {
}
