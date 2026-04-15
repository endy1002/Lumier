package com.lumier.backend.service;

import com.lumier.backend.domain.enums.UserRole;
import com.lumier.backend.domain.UserProfile;
import com.lumier.backend.repository.CustomerOrderRepository;
import com.lumier.backend.repository.UserProfileRepository;
import java.time.OffsetDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminAuthorizationService {

  private final UserProfileRepository userProfileRepository;
  private final CustomerOrderRepository customerOrderRepository;
  private final UserProfileService userProfileService;

  public AdminAuthorizationService(
    UserProfileRepository userProfileRepository,
    CustomerOrderRepository customerOrderRepository,
    UserProfileService userProfileService
  ) {
    this.userProfileRepository = userProfileRepository;
    this.customerOrderRepository = customerOrderRepository;
    this.userProfileService = userProfileService;
  }

  @Transactional
  public void requireAdmin(String googleId) {
    if (googleId == null || googleId.isBlank()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Thiếu thông tin người dùng.");
    }

    UserProfile user = userProfileRepository.findByGoogleId(googleId)
      .orElseGet(() -> bootstrapUserFromOrderHistory(googleId)
        .orElseThrow(() -> new ResponseStatusException(
          HttpStatus.UNAUTHORIZED,
          "Người dùng không tồn tại. Vui lòng đăng xuất và đăng nhập lại bằng Google."
        )));

    if (user.getRole() != UserRole.ADMIN) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập khu vực admin.");
    }
  }

  private java.util.Optional<UserProfile> bootstrapUserFromOrderHistory(String googleId) {
    return customerOrderRepository.findByCustomerGoogleIdOrderByCreatedAtDesc(googleId)
      .stream()
      .findFirst()
      .filter(order -> order.getCustomerEmail() != null && !order.getCustomerEmail().isBlank())
      .map(order -> {
        UserProfile user = userProfileService.upsertFromGoogleProfile(
          googleId,
          order.getCustomerEmail(),
          order.getCustomerName(),
          null
        );

        if ((user.getPhone() == null || user.getPhone().isBlank()) && order.getCustomerPhone() != null) {
          user.setPhone(order.getCustomerPhone());
        }
        if ((user.getShippingAddress() == null || user.getShippingAddress().isBlank()) && order.getShippingAddress() != null) {
          user.setShippingAddress(order.getShippingAddress());
        }
        if (user.getLastOrderAt() == null) {
          user.setLastOrderAt(order.getCreatedAt());
        }
        user.setUpdatedAt(OffsetDateTime.now());

        return userProfileRepository.save(user);
      });
  }
}
