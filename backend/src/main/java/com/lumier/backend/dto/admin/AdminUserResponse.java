package com.lumier.backend.dto.admin;

import java.time.OffsetDateTime;

public record AdminUserResponse(
  Long id,
  String googleId,
  String email,
  String name,
  String phone,
  String shippingAddress,
  String role,
  boolean marketingOptIn,
  OffsetDateTime lastOrderAt,
  OffsetDateTime createdAt
) {
}
