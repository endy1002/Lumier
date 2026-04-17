package com.lumier.backend.service;

import com.lumier.backend.domain.enums.UserRole;
import com.lumier.backend.domain.UserProfile;
import com.lumier.backend.repository.UserProfileRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileService {

  public static final String QUESTION_GENRE = "genre";
  public static final String QUESTION_READING_TIME = "readingTime";
  public static final String QUESTION_RECENT_BOOK = "recentBook";

  public static final Set<String> GENRE_OPTIONS = Set.of("classic", "selfhelp", "novel", "science", "poetry");
  public static final Set<String> READING_TIME_OPTIONS = Set.of("morning", "noon", "evening", "before-sleep", "anytime");
  public static final Set<String> RECENT_BOOK_OPTIONS = Set.of("alchemist", "how-to-win", "yellow-flowers", "youth-worth", "other");

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

  @Transactional
  public UserProfile updateChatbotPreferences(
    String googleId,
    String genreOption,
    String readingTimeOption,
    String recentBookOption
  ) {
    UserProfile user = getRequiredByGoogleId(googleId);

    user.setChatbotGenreOption(requireAllowedOption(QUESTION_GENRE, genreOption, GENRE_OPTIONS));
    user.setChatbotReadingTimeOption(requireAllowedOption(QUESTION_READING_TIME, readingTimeOption, READING_TIME_OPTIONS));
    user.setChatbotRecentBookOption(requireAllowedOption(QUESTION_RECENT_BOOK, recentBookOption, RECENT_BOOK_OPTIONS));
    user.setChatbotPreferencesUpdatedAt(OffsetDateTime.now());
    user.setUpdatedAt(OffsetDateTime.now());

    return userProfileRepository.save(user);
  }

  private String requireAllowedOption(String questionKey, String optionValue, Set<String> allowedOptions) {
    if (optionValue == null || optionValue.isBlank()) {
      throw new IllegalArgumentException("Thiếu lựa chọn cho câu hỏi: " + questionKey);
    }

    String normalized = optionValue.trim();
    if (!allowedOptions.contains(normalized)) {
      String allowedText = String.join(", ", new LinkedHashSet<>(allowedOptions));
      throw new IllegalArgumentException("Lựa chọn không hợp lệ cho " + questionKey + ". Chỉ chấp nhận: " + allowedText);
    }

    return normalized;
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
