package com.lumier.backend.controller;

import java.sql.Connection;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.Map;
import javax.sql.DataSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

  private final DataSource dataSource;

  public HealthController(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  @GetMapping("/health")
  public ResponseEntity<Map<String, Object>> health() {
    try (Connection connection = dataSource.getConnection()) {
      boolean isDatabaseUp = connection.isValid(2);
      if (!isDatabaseUp) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
          "status", "degraded",
          "database", "down",
          "timestamp", OffsetDateTime.now().toString()
        ));
      }

      return ResponseEntity.ok(Map.of(
        "status", "ok",
        "database", "up",
        "timestamp", OffsetDateTime.now().toString()
      ));
    } catch (SQLException ex) {
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
        "status", "degraded",
        "database", "down",
        "error", "database_connection_failed",
        "timestamp", OffsetDateTime.now().toString()
      ));
    }
  }
}
