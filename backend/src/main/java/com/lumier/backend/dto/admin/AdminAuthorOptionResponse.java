package com.lumier.backend.dto.admin;

public record AdminAuthorOptionResponse(
  Long id,
  String name,
  String bio,
  String avatarUrl,
  String featuredWorks,
  String infoImage1,
  String infoImage2,
  String infoImage3,
  int displayOrder,
  boolean isActive
) {
}
