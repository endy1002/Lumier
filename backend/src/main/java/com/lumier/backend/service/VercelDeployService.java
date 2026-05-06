package com.lumier.backend.service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class VercelDeployService {

  private static final Logger logger = LoggerFactory.getLogger(VercelDeployService.class);

  private final HttpClient httpClient;
  private final String deployHookUrl;

  public VercelDeployService(@Value("${app.vercel.deploy-hook-url:}") String deployHookUrl) {
    this.httpClient = HttpClient.newBuilder()
      .connectTimeout(Duration.ofSeconds(8))
      .build();
    this.deployHookUrl = deployHookUrl == null ? "" : deployHookUrl.trim();
  }

  public void triggerDeploy(String reason) {
    if (deployHookUrl.isBlank()) {
      return;
    }

    HttpRequest request = HttpRequest.newBuilder()
      .uri(URI.create(deployHookUrl))
      .timeout(Duration.ofSeconds(10))
      .POST(HttpRequest.BodyPublishers.noBody())
      .build();

    try {
      HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() >= 300) {
        logger.warn("Vercel deploy hook failed ({}): {}", response.statusCode(), response.body());
      } else {
        logger.info("Vercel deploy hook triggered: {}", reason);
      }
    } catch (IOException | InterruptedException ex) {
      Thread.currentThread().interrupt();
      logger.warn("Vercel deploy hook error: {}", ex.getMessage());
    }
  }
}
