package com.lumier.backend.controller;

import com.lumier.backend.dto.GoogleAuthRequest;
import com.lumier.backend.dto.GoogleAuthResponse;
import com.lumier.backend.service.GoogleAuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final GoogleAuthService googleAuthService;

  public AuthController(GoogleAuthService googleAuthService) {
    this.googleAuthService = googleAuthService;
  }

  @PostMapping("/google")
  public GoogleAuthResponse authenticateWithGoogle(@Valid @RequestBody GoogleAuthRequest request) {
    return googleAuthService.authenticate(request.getIdToken());
  }
}
