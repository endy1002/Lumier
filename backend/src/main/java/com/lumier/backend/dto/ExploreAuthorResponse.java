package com.lumier.backend.dto;

import java.util.List;

public record ExploreAuthorResponse(
  Long id,
  String name,
  String bio,
  String avatarUrl,
  List<String> works,
  List<String> infoImages
) {
}
