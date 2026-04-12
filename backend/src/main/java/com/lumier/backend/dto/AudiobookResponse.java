package com.lumier.backend.dto;

public record AudiobookResponse(
  Long id,
  String title,
  String author,
  String narrator,
  Integer durationMinutes,
  String duration,
  String coverImage,
  String summary,
  String audioFileUrl,
  String audioFormat,
  boolean unlocked
) {
}
