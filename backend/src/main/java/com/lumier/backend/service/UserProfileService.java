package com.lumier.backend.service;

import com.lumier.backend.domain.enums.UserRole;
import com.lumier.backend.domain.UserProfile;
import com.lumier.backend.repository.UserProfileRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileService {

  private final UserProfileRepository userProfileRepository;
  private final Set<String> adminEmails;

  public UserProfileService(
    UserProfileRepository userProfileRepository,
    @Value("${app.auth.admin-emails:}") String adminEmails
  ) {
    this.userProfileRepository = userProfileRepository;
    this.adminEmails = Arrays.stream(adminEmails.split(","))
      .map(String::trim)
      .map(String::toLowerCase)
      .filter(value -> !value.isBlank())
      .collect(Collectors.toUnmodifiableSet());
  }

  @Transactional
  public UserProfile upsertFromGoogleProfile(String googleId, String email, String name, String picture) {
    UserProfile user = userProfileRepository.findByGoogleId(googleId)
      .orElseGet(() -> userProfileRepository.findByEmail(email).orElseGet(UserProfile::new));

    user.setGoogleId(googleId);
    user.setEmail(email);
    user.setName(name);
    user.setPicture(picture);
    user.setRole(resolveRole(user.getRole(), email));
    if (user.getCreatedAt() == null) {
      user.setCreatedAt(OffsetDateTime.now());
    }
    user.setUpdatedAt(OffsetDateTime.now());

    return userProfileRepository.save(user);
  }

  @Transactional(readOnly = true)
  public UserProfile getRequiredByGoogleId(String googleId) {
    return userProfileRepository.findByGoogleId(googleId)
      .orElseThrow(() -> new EntityNotFoundException("User not found: " + googleId));
  }

  @Transactional
  public UserProfile updateShippingProfile(String googleId, String name, String phone, String shippingAddress) {
    UserProfile user = getRequiredByGoogleId(googleId);
    user.setName(name);
    user.setPhone(phone);
    user.setShippingAddress(shippingAddress);
    user.setUpdatedAt(OffsetDateTime.now());
    return userProfileRepository.save(user);
  }

  @Transactional
  public void markOrderPlaced(String googleId) {
    UserProfile user = getRequiredByGoogleId(googleId);
    user.setLastOrderAt(OffsetDateTime.now());
    user.setUpdatedAt(OffsetDateTime.now());
    userProfileRepository.save(user);
  }

  private UserRole resolveRole(UserRole existingRole, String email) {
    if (email != null && adminEmails.contains(email.trim().toLowerCase())) {
      return UserRole.ADMIN;
    }

    if (existingRole != null) {
      return existingRole;
    }

    return UserRole.CUSTOMER;
  }
}
