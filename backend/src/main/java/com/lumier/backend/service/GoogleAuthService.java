package com.lumier.backend.service;

import com.lumier.backend.dto.AuthUserResponse;
import com.lumier.backend.dto.GoogleAuthResponse;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GoogleAuthService {

  private final RestClient restClient;
  private final String googleClientId;

  public GoogleAuthService(@Value("${app.auth.google.client-id:}") String googleClientId) {
    this.restClient = RestClient.create();
    this.googleClientId = googleClientId;
  }

  public GoogleAuthResponse authenticate(String idToken) {
    if (googleClientId == null || googleClientId.isBlank()) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Google client ID is not configured");
    }

    Map<?, ?> tokenInfo;
    try {
      tokenInfo = restClient.get()
        .uri("https://oauth2.googleapis.com/tokeninfo?id_token={idToken}", idToken)
        .retrieve()
        .body(Map.class);
    } catch (Exception ex) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google token");
    }

    if (tokenInfo == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google token");
    }

    String audience = String.valueOf(tokenInfo.get("aud"));
    if (!googleClientId.equals(audience)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google token audience mismatch");
    }

    String emailVerified = String.valueOf(tokenInfo.get("email_verified"));
    if (!"true".equalsIgnoreCase(emailVerified)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google email is not verified");
    }

    AuthUserResponse user = new AuthUserResponse(
      value(tokenInfo.get("sub")),
      value(tokenInfo.get("email")),
      value(tokenInfo.get("name")),
      value(tokenInfo.get("picture"))
    );

    return new GoogleAuthResponse(user);
  }

  private String value(Object input) {
    return input == null ? null : String.valueOf(input);
  }
}
