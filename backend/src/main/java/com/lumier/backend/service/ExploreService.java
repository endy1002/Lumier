package com.lumier.backend.service;

import com.lumier.backend.domain.Audiobook;
import com.lumier.backend.domain.AudiobookAccessCode;
import com.lumier.backend.dto.AudiobookResponse;
import com.lumier.backend.dto.BookSummaryResponse;
import com.lumier.backend.dto.ExploreAuthorResponse;
import com.lumier.backend.dto.VerifyAudiobookCodeResponse;
import com.lumier.backend.repository.AudiobookAccessCodeRepository;
import com.lumier.backend.repository.AudiobookRepository;
import com.lumier.backend.repository.BookAuthorRepository;
import com.lumier.backend.repository.BookSummaryRepository;
import com.lumier.backend.repository.ProductRepository;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExploreService {

  private final BookSummaryRepository bookSummaryRepository;
  private final BookAuthorRepository bookAuthorRepository;
  private final AudiobookRepository audiobookRepository;
  private final AudiobookAccessCodeRepository audiobookAccessCodeRepository;
  private final ProductRepository productRepository;

  public ExploreService(
    BookSummaryRepository bookSummaryRepository,
    BookAuthorRepository bookAuthorRepository,
    AudiobookRepository audiobookRepository,
    AudiobookAccessCodeRepository audiobookAccessCodeRepository,
    ProductRepository productRepository
  ) {
    this.bookSummaryRepository = bookSummaryRepository;
    this.bookAuthorRepository = bookAuthorRepository;
    this.audiobookRepository = audiobookRepository;
    this.audiobookAccessCodeRepository = audiobookAccessCodeRepository;
    this.productRepository = productRepository;
  }

  @Transactional(readOnly = true)
  public List<BookSummaryResponse> getBookSummaries() {
    return bookSummaryRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
      .stream()
      .map(item -> new BookSummaryResponse(
        item.getId(),
        item.getTitle(),
        item.getAuthorName(),
        item.getExcerpt(),
        item.getTag()
      ))
      .toList();
  }

  @Transactional(readOnly = true)
  public List<ExploreAuthorResponse> getAuthors() {
    return bookAuthorRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
      .stream()
      .map(author -> new ExploreAuthorResponse(
        author.getId(),
        author.getName(),
        author.getBio(),
        author.getAvatarUrl(),
        splitWorks(author.getFeaturedWorks()),
        buildInfoImages(author)
      ))
      .toList();
  }

  private List<String> buildInfoImages(com.lumier.backend.domain.BookAuthor author) {
    List<String> values = new ArrayList<>();
    if (author.getInfoImage1() != null && !author.getInfoImage1().isBlank()) {
      values.add(author.getInfoImage1());
    }
    if (author.getInfoImage2() != null && !author.getInfoImage2().isBlank()) {
      values.add(author.getInfoImage2());
    }
    if (author.getInfoImage3() != null && !author.getInfoImage3().isBlank()) {
      values.add(author.getInfoImage3());
    }
    return values;
  }

  @Transactional(readOnly = true)
  public List<AudiobookResponse> getAudiobooks(String googleId) {
    Set<Long> unlockedIds = (googleId == null || googleId.isBlank())
      ? Set.of()
      : audiobookAccessCodeRepository.findUnlockedAudiobookIdsByGoogleId(googleId);

    return audiobookRepository.findActiveCharmAudiobooksOrderByDisplayOrderAsc()
      .stream()
      .map(book -> toResponse(book, unlockedIds.contains(book.getId())))
      .toList();
  }

  @Transactional
  public VerifyAudiobookCodeResponse verifyAudiobookCode(String googleId, String rawCode) {
    String normalizedInput = AudiobookCodeService.normalizeCode(rawCode);
    AudiobookAccessCode accessCode = audiobookAccessCodeRepository.findByCodeNormalized(normalizedInput)
      .orElseThrow(() -> new IllegalArgumentException("Mã code không hợp lệ hoặc đã hết hạn."));

    if (!accessCode.getIssuedToGoogleId().equals(googleId)) {
      throw new IllegalArgumentException("Mã code không hợp lệ hoặc đã hết hạn.");
    }

    if (accessCode.getRedeemedByGoogleId() == null || accessCode.getRedeemedByGoogleId().isBlank()) {
      accessCode.setRedeemedByGoogleId(googleId);
      accessCode.setRedeemedAt(OffsetDateTime.now());
      audiobookAccessCodeRepository.save(accessCode);
    } else if (!accessCode.getRedeemedByGoogleId().equals(googleId)) {
      throw new IllegalArgumentException("Mã code không hợp lệ hoặc đã hết hạn.");
    }

    return new VerifyAudiobookCodeResponse(
      true,
      accessCode.getAudiobook().getId(),
      "Kích hoạt audiobook thành công."
    );
  }

  private AudiobookResponse toResponse(Audiobook book, boolean unlocked) {
    Long productId = book.getProductId();
    String coverImage = productId == null
      ? book.getCoverImageUrl()
      : productRepository.findById(productId)
        .map(product -> product.getImageUrl())
        .orElse(book.getCoverImageUrl());

    return new AudiobookResponse(
      book.getId(),
      book.getTitle(),
      book.getAuthor().getName(),
      book.getNarrator(),
      book.getDurationMinutes(),
      formatDuration(book.getDurationMinutes()),
      coverImage,
      book.getSummary(),
      unlocked ? book.getAudioFileUrl() : null,
      unlocked ? normalizeAudioFormat(book.getAudioFormat()) : null,
      unlocked
    );
  }

  private List<String> splitWorks(String works) {
    if (works == null || works.isBlank()) {
      return List.of();
    }

    return List.of(works.split("\\|"))
      .stream()
      .map(String::trim)
      .filter(item -> !item.isBlank())
      .toList();
  }

  private String formatDuration(Integer minutes) {
    if (minutes == null || minutes <= 0) {
      return null;
    }

    int hour = minutes / 60;
    int min = minutes % 60;

    if (hour == 0) {
      return min + "m";
    }

    return min == 0 ? hour + "h" : hour + "h " + min + "m";
  }

  private String normalizeAudioFormat(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }

    return value.toLowerCase(Locale.ROOT);
  }
}
