package com.lumier.backend.controller;

import com.lumier.backend.dto.admin.AdminOrderResponse;
import com.lumier.backend.dto.admin.AdminUpdateOrderStatusRequest;
import com.lumier.backend.dto.admin.AdminUpdateUserRoleRequest;
import com.lumier.backend.dto.admin.AdminUserResponse;
import com.lumier.backend.service.AdminManagementService;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/admin/management")
public class AdminManagementController {

  private final AdminManagementService adminManagementService;

  public AdminManagementController(AdminManagementService adminManagementService) {
    this.adminManagementService = adminManagementService;
  }

  @GetMapping("/orders")
  public List<AdminOrderResponse> orders(@RequestParam String googleId) {
    return adminManagementService.getOrders(googleId);
  }

  @PutMapping("/orders/{orderId}/status")
  public AdminOrderResponse updateOrderStatus(
    @RequestParam String googleId,
    @PathVariable Long orderId,
    @RequestBody AdminUpdateOrderStatusRequest request
  ) {
    return adminManagementService.updateOrderStatus(googleId, orderId, request);
  }

  @GetMapping("/users")
  public List<AdminUserResponse> users(@RequestParam String googleId) {
    return adminManagementService.getUsers(googleId);
  }

  @PutMapping("/users/{userId}/role")
  public AdminUserResponse updateUserRole(
    @RequestParam String googleId,
    @PathVariable Long userId,
    @RequestBody AdminUpdateUserRoleRequest request
  ) {
    return adminManagementService.updateUserRole(googleId, userId, request);
  }
}
