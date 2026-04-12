package com.lumier.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class VerifyAudiobookCodeRequest {

  @NotBlank
  private String googleId;

  @NotBlank
  private String code;

  public String getGoogleId() {
    return googleId;
  }

  public void setGoogleId(String googleId) {
    this.googleId = googleId;
  }

  public String getCode() {
    return code;
  }

  public void setCode(String code) {
    this.code = code;
  }
}
