package com.lumier.backend.service;

import com.lumier.backend.domain.CustomerOrder;
import com.lumier.backend.domain.UserProfile;
import com.lumier.backend.domain.enums.OrderStatus;
import com.lumier.backend.domain.enums.UserRole;
import com.lumier.backend.dto.admin.AdminOrderItemResponse;
import com.lumier.backend.dto.admin.AdminOrderResponse;
import com.lumier.backend.dto.admin.AdminUpdateOrderStatusRequest;
import com.lumier.backend.dto.admin.AdminUpdateUserRoleRequest;
import com.lumier.backend.dto.admin.AdminUserResponse;
import com.lumier.backend.repository.CustomerOrderRepository;
import com.lumier.backend.repository.UserProfileRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminManagementService {

  private final AdminAuthorizationService adminAuthorizationService;
  private final CustomerOrderRepository customerOrderRepository;
  private final UserProfileRepository userProfileRepository;
  private final AudiobookCodeService audiobookCodeService;

  public AdminManagementService(
    AdminAuthorizationService adminAuthorizationService,
    CustomerOrderRepository customerOrderRepository,
    UserProfileRepository userProfileRepository,
    AudiobookCodeService audiobookCodeService
  ) {
    this.adminAuthorizationService = adminAuthorizationService;
    this.customerOrderRepository = customerOrderRepository;
    this.userProfileRepository = userProfileRepository;
    this.audiobookCodeService = audiobookCodeService;
  }

  @Transactional(readOnly = true)
  public List<AdminOrderResponse> getOrders(String googleId) {
    adminAuthorizationService.requireAdmin(googleId);

    return customerOrderRepository.findAllByOrderByCreatedAtDesc()
      .stream()
      .map(this::toOrder)
      .toList();
  }

  @Transactional
  public AdminOrderResponse updateOrderStatus(String googleId, Long orderId, AdminUpdateOrderStatusRequest request) {
    adminAuthorizationService.requireAdmin(googleId);
    Long requiredOrderId = Objects.requireNonNull(orderId);

    CustomerOrder order = customerOrderRepository.findById(requiredOrderId)
      .orElseThrow(() -> new EntityNotFoundException("Đơn hàng không tồn tại: " + orderId));

    if (request == null || request.status() == null || request.status().isBlank()) {
      throw new IllegalArgumentException("Status là bắt buộc.");
    }

    try {
      order.setStatus(OrderStatus.valueOf(request.status().trim().toUpperCase()));
    } catch (IllegalArgumentException ex) {
      throw new IllegalArgumentException("Status không hợp lệ. Chỉ chấp nhận: PENDING, PAID, SHIPPED.");
    }

    if (order.getStatus() == OrderStatus.SHIPPED) {
      audiobookCodeService.ensureCodesForShippedOrder(order);
    }

    return toOrder(customerOrderRepository.save(order));
  }

  @Transactional(readOnly = true)
  public List<AdminUserResponse> getUsers(String googleId) {
    adminAuthorizationService.requireAdmin(googleId);

    return userProfileRepository.findAllByOrderByCreatedAtDesc()
      .stream()
      .map(this::toUser)
      .toList();
  }

  @Transactional
  public AdminUserResponse updateUserRole(String adminGoogleId, Long userId, AdminUpdateUserRoleRequest request) {
    adminAuthorizationService.requireAdmin(adminGoogleId);
    Long requiredUserId = Objects.requireNonNull(userId);

    UserProfile user = userProfileRepository.findById(requiredUserId)
      .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại: " + userId));

    if (request == null || request.role() == null || request.role().isBlank()) {
      throw new IllegalArgumentException("Role là bắt buộc.");
    }

    UserRole nextRole;
    try {
      nextRole = UserRole.valueOf(request.role().trim().toUpperCase());
    } catch (IllegalArgumentException ex) {
      throw new IllegalArgumentException("Role không hợp lệ. Chỉ chấp nhận: ADMIN, CUSTOMER.");
    }

    if (user.getGoogleId() != null && user.getGoogleId().equals(adminGoogleId) && nextRole != UserRole.ADMIN) {
      throw new IllegalArgumentException("Bạn không thể tự hạ quyền của chính mình.");
    }

    user.setRole(nextRole);
    return toUser(userProfileRepository.save(user));
  }

  private AdminOrderResponse toOrder(CustomerOrder order) {
    return new AdminOrderResponse(
      order.getId(),
      order.getCustomerName(),
      order.getCustomerEmail(),
      order.getCustomerGoogleId(),
      order.getCustomerPhone(),
      order.getShippingAddress(),
      order.getStatus().name(),
      order.getTotalAmount(),
      order.getCreatedAt(),
      order.getOrderItems().stream()
        .map(item -> new AdminOrderItemResponse(
          item.getId(),
          item.getProduct().getId(),
          item.getProduct().getName(),
          item.getQuantity(),
          item.getItemSubtotal()
        ))
        .toList()
    );
  }

  private AdminUserResponse toUser(UserProfile user) {
    return new AdminUserResponse(
      user.getId(),
      user.getGoogleId(),
      user.getEmail(),
      user.getName(),
      user.getPhone(),
      user.getShippingAddress(),
      user.getRole().name(),
      user.isMarketingOptIn(),
      user.getLastOrderAt(),
      user.getCreatedAt()
    );
  }
}
