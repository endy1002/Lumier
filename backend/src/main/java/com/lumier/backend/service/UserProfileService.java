package com.lumier.backend.service;

import com.lumier.backend.domain.UserProfile;
import com.lumier.backend.repository.UserProfileRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.OffsetDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileService {

  private final UserProfileRepository userProfileRepository;

  public UserProfileService(UserProfileRepository userProfileRepository) {
    this.userProfileRepository = userProfileRepository;
  }

  @Transactional
  public UserProfile upsertFromGoogleProfile(String googleId, String email, String name, String picture) {
    UserProfile user = userProfileRepository.findByGoogleId(googleId)
      .orElseGet(() -> userProfileRepository.findByEmail(email).orElseGet(UserProfile::new));

    user.setGoogleId(googleId);
    user.setEmail(email);
    user.setName(name);
    user.setPicture(picture);
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
}
