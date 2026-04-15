package com.lumier.backend.dto.admin;

public record AdminUpsertAuthorRequest(
  String name,
  String bio,
  String avatarUrl,
  String featuredWorks,
  String infoImage1,
  String infoImage2,
  String infoImage3,
  Integer displayOrder,
  Boolean isActive
) {
}
