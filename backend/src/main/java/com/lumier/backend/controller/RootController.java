package com.lumier.backend.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

  @GetMapping("/")
  public Map<String, Object> root() {
    return Map.of(
      "service", "lumier-backend",
      "status", "ok",
      "api", "/api/products"
    );
  }
}
