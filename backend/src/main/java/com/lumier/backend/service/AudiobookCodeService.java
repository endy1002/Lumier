package com.lumier.backend.service;

import com.lumier.backend.domain.Audiobook;
import com.lumier.backend.domain.AudiobookAccessCode;
import com.lumier.backend.domain.CustomerOrder;
import com.lumier.backend.domain.OrderItem;
import com.lumier.backend.repository.AudiobookAccessCodeRepository;
import com.lumier.backend.repository.AudiobookRepository;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AudiobookCodeService {

  private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  private static final int TOKEN_LENGTH = 12;
  private static final int MAX_GENERATION_RETRIES = 20;

  private final SecureRandom secureRandom = new SecureRandom();
  private final AudiobookRepository audiobookRepository;
  private final AudiobookAccessCodeRepository audiobookAccessCodeRepository;

  public AudiobookCodeService(
    AudiobookRepository audiobookRepository,
    AudiobookAccessCodeRepository audiobookAccessCodeRepository
  ) {
    this.audiobookRepository = audiobookRepository;
    this.audiobookAccessCodeRepository = audiobookAccessCodeRepository;
  }

  @Transactional
  public void issueCodesForOrder(CustomerOrder order) {
    if (order.getCustomerGoogleId() == null || order.getCustomerGoogleId().isBlank()) {
      return;
    }

    for (OrderItem item : order.getOrderItems()) {
      Audiobook audiobook = audiobookRepository.findByProductIdAndIsActiveTrue(item.getProduct().getId())
        .orElse(null);
      if (audiobook == null) {
        continue;
      }

      int issueCount = Math.max(1, item.getQuantity());
      for (int i = 0; i < issueCount; i++) {
        String codeValue = generateUniqueCodeValue();

        AudiobookAccessCode accessCode = new AudiobookAccessCode();
        accessCode.setCodeValue(codeValue);
        accessCode.setCodeNormalized(normalizeCode(codeValue));
        accessCode.setAudiobook(audiobook);
        accessCode.setOrder(order);
        accessCode.setOrderItem(item);
        accessCode.setIssuedToGoogleId(order.getCustomerGoogleId());
        accessCode.setIssuedAt(OffsetDateTime.now());

        audiobookAccessCodeRepository.save(accessCode);
      }
    }
  }

  public static String normalizeCode(String code) {
    if (code == null) {
      return "";
    }

    return code.toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9]", "");
  }

  private String generateUniqueCodeValue() {
    for (int attempt = 0; attempt < MAX_GENERATION_RETRIES; attempt++) {
      String token = randomToken(TOKEN_LENGTH);
      String code = "LMB-"
        + token.substring(0, 4)
        + "-"
        + token.substring(4, 8)
        + "-"
        + token.substring(8, 12);

      if (!audiobookAccessCodeRepository.existsByCodeNormalized(normalizeCode(code))) {
        return code;
      }
    }

    throw new IllegalStateException("Unable to generate unique audiobook code");
  }

  private String randomToken(int length) {
    StringBuilder builder = new StringBuilder(length);
    for (int i = 0; i < length; i++) {
      int idx = secureRandom.nextInt(ALPHABET.length());
      builder.append(ALPHABET.charAt(idx));
    }
    return builder.toString();
  }
}
