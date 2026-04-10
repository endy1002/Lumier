package com.lumier.backend.dto;

public record AuthUserResponse(
  String googleId,
  String email,
  String name,
  String picture
) {
}
