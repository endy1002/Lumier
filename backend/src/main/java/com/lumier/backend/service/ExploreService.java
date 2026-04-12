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
import java.time.OffsetDateTime;
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

  public ExploreService(
    BookSummaryRepository bookSummaryRepository,
    BookAuthorRepository bookAuthorRepository,
    AudiobookRepository audiobookRepository,
    AudiobookAccessCodeRepository audiobookAccessCodeRepository
  ) {
    this.bookSummaryRepository = bookSummaryRepository;
    this.bookAuthorRepository = bookAuthorRepository;
    this.audiobookRepository = audiobookRepository;
    this.audiobookAccessCodeRepository = audiobookAccessCodeRepository;
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
        splitWorks(author.getFeaturedWorks())
      ))
      .toList();
  }

  @Transactional(readOnly = true)
  public List<AudiobookResponse> getAudiobooks(String googleId) {
    Set<Long> unlockedIds = (googleId == null || googleId.isBlank())
      ? Set.of()
      : audiobookAccessCodeRepository.findUnlockedAudiobookIdsByGoogleId(googleId);

    return audiobookRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
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
    return new AudiobookResponse(
      book.getId(),
      book.getTitle(),
      book.getAuthor().getName(),
      book.getNarrator(),
      book.getDurationMinutes(),
      formatDuration(book.getDurationMinutes()),
      book.getCoverImageUrl(),
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
