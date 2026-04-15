package com.lumier.backend.controller;

import com.lumier.backend.dto.admin.AdminAudiobookItemResponse;
import com.lumier.backend.dto.admin.AdminAuthorOptionResponse;
import com.lumier.backend.dto.admin.AdminExploreDashboardResponse;
import com.lumier.backend.dto.admin.AdminProductOptionResponse;
import com.lumier.backend.dto.admin.AdminUpsertAuthorRequest;
import com.lumier.backend.dto.admin.AdminUpsertProductRequest;
import com.lumier.backend.dto.admin.AdminUpdateAudiobookRequest;
import com.lumier.backend.service.AdminExploreService;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/admin/explore")
public class AdminExploreController {

  private final AdminExploreService adminExploreService;

  public AdminExploreController(AdminExploreService adminExploreService) {
    this.adminExploreService = adminExploreService;
  }

  @GetMapping("/dashboard")
  public AdminExploreDashboardResponse dashboard(@RequestParam String googleId) {
    return adminExploreService.getDashboard(googleId);
  }

  @PutMapping("/audiobooks/{audiobookId}")
  public AdminAudiobookItemResponse updateAudiobook(
    @RequestParam String googleId,
    @PathVariable Long audiobookId,
    @Valid @RequestBody AdminUpdateAudiobookRequest request
  ) {
    return adminExploreService.updateAudiobook(googleId, audiobookId, request);
  }

  @PostMapping("/products")
  public AdminProductOptionResponse createProduct(
    @RequestParam String googleId,
    @Valid @RequestBody AdminUpsertProductRequest request
  ) {
    return adminExploreService.createProduct(googleId, request);
  }

  @PutMapping("/products/{productId}")
  public AdminProductOptionResponse updateProduct(
    @RequestParam String googleId,
    @PathVariable Long productId,
    @Valid @RequestBody AdminUpsertProductRequest request
  ) {
    return adminExploreService.updateProduct(googleId, productId, request);
  }

  @DeleteMapping("/products/{productId}")
  public void deleteProduct(@RequestParam String googleId, @PathVariable Long productId) {
    adminExploreService.deleteProduct(googleId, productId);
  }

  @PostMapping("/authors")
  public AdminAuthorOptionResponse createAuthor(
    @RequestParam String googleId,
    @Valid @RequestBody AdminUpsertAuthorRequest request
  ) {
    return adminExploreService.createAuthor(googleId, request);
  }

  @PutMapping("/authors/{authorId}")
  public AdminAuthorOptionResponse updateAuthor(
    @RequestParam String googleId,
    @PathVariable Long authorId,
    @Valid @RequestBody AdminUpsertAuthorRequest request
  ) {
    return adminExploreService.updateAuthor(googleId, authorId, request);
  }

  @DeleteMapping("/authors/{authorId}")
  public void deleteAuthor(@RequestParam String googleId, @PathVariable Long authorId) {
    adminExploreService.deleteAuthor(googleId, authorId);
  }
}
