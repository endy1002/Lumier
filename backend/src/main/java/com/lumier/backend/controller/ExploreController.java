package com.lumier.backend.controller;

import com.lumier.backend.dto.AudiobookResponse;
import com.lumier.backend.dto.BookSummaryResponse;
import com.lumier.backend.dto.ExploreAuthorResponse;
import com.lumier.backend.dto.VerifyAudiobookCodeRequest;
import com.lumier.backend.dto.VerifyAudiobookCodeResponse;
import com.lumier.backend.service.ExploreService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/explore")
public class ExploreController {

  private final ExploreService exploreService;

  public ExploreController(ExploreService exploreService) {
    this.exploreService = exploreService;
  }

  @GetMapping("/summaries")
  public List<BookSummaryResponse> summaries() {
    return exploreService.getBookSummaries();
  }

  @GetMapping("/authors")
  public List<ExploreAuthorResponse> authors() {
    return exploreService.getAuthors();
  }

  @GetMapping("/audiobooks")
  public List<AudiobookResponse> audiobooks(@RequestParam(required = false) String googleId) {
    return exploreService.getAudiobooks(googleId);
  }

  @PostMapping("/audiobooks/verify")
  public VerifyAudiobookCodeResponse verify(@Valid @RequestBody VerifyAudiobookCodeRequest request) {
    return exploreService.verifyAudiobookCode(request.getGoogleId(), request.getCode());
  }
}
