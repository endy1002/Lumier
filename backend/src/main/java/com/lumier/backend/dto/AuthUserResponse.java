package com.lumier.backend.dto;

import com.lumier.backend.domain.enums.UserRole;

public record AuthUserResponse(
  String googleId,
  String email,
  String name,
  String picture,
  String phone,
  String shippingAddress,
  boolean marketingOptIn,
  UserRole role
) {
}
