package com.lumier.backend.controller;

import com.lumier.backend.dto.CheckoutRequest;
import com.lumier.backend.dto.CheckoutResponse;
import com.lumier.backend.dto.OrderHistoryResponse;
import com.lumier.backend.service.OrderService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/orders")
public class OrderController {

  private final OrderService orderService;

  public OrderController(OrderService orderService) {
    this.orderService = orderService;
  }

  @PostMapping("/checkout")
  public CheckoutResponse checkout(@Valid @RequestBody CheckoutRequest request) {
    return orderService.checkout(request);
  }

  @GetMapping("/history")
  public List<OrderHistoryResponse> history(@RequestParam @NotBlank String googleId) {
    return orderService.getOrderHistory(googleId);
  }

  @GetMapping("/{orderId}/audiobook-codes")
  public List<String> audiobookCodes(
    @RequestParam @NotBlank String googleId,
    @org.springframework.web.bind.annotation.PathVariable Long orderId
  ) {
    return orderService.getOrderAudiobookCodes(googleId, orderId);
  }
}
