package com.lumier.backend.controller;

import com.lumier.backend.dto.CheckoutRequest;
import com.lumier.backend.dto.CheckoutResponse;
import com.lumier.backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
