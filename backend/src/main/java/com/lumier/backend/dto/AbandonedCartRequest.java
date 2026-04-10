package com.lumier.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AbandonedCartRequest {

  @NotBlank
  @Email
  private String email;

  @NotBlank
  private String cartSnapshotJson;

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getCartSnapshotJson() {
    return cartSnapshotJson;
  }

  public void setCartSnapshotJson(String cartSnapshotJson) {
    this.cartSnapshotJson = cartSnapshotJson;
  }
}
