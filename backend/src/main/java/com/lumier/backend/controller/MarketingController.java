package com.lumier.backend.controller;

import com.lumier.backend.dto.AbandonedCartRequest;
import com.lumier.backend.service.MarketingService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/marketing")
public class MarketingController {

  private final MarketingService marketingService;

  public MarketingController(MarketingService marketingService) {
    this.marketingService = marketingService;
  }

  @PostMapping("/abandoned-cart")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> captureAbandonedCart(@Valid @RequestBody AbandonedCartRequest request) {
    Long leadId = marketingService.captureAbandonedCart(request);
    return Map.of("id", leadId, "status", "captured");
  }
}
