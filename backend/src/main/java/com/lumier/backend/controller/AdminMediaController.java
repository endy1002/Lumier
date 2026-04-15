package com.lumier.backend.controller;

import com.lumier.backend.dto.admin.AdminUploadImageResponse;
import com.lumier.backend.service.AdminAuthorizationService;
import com.lumier.backend.service.MediaStorageService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/media")
public class AdminMediaController {

  private final AdminAuthorizationService adminAuthorizationService;
  private final MediaStorageService mediaStorageService;

  public AdminMediaController(
    AdminAuthorizationService adminAuthorizationService,
    MediaStorageService mediaStorageService
  ) {
    this.adminAuthorizationService = adminAuthorizationService;
    this.mediaStorageService = mediaStorageService;
  }

  @PostMapping("/upload-image")
  public AdminUploadImageResponse uploadImage(
    @RequestParam String googleId,
    @RequestParam("file") MultipartFile file
  ) {
    adminAuthorizationService.requireAdmin(googleId);
    MediaStorageService.StoredFile stored = mediaStorageService.storeImage(file);
    return new AdminUploadImageResponse(stored.publicUrl(), stored.fileName(), stored.size());
  }

  @PostMapping("/upload-audio")
  public AdminUploadImageResponse uploadAudio(
    @RequestParam String googleId,
    @RequestParam("file") MultipartFile file
  ) {
    adminAuthorizationService.requireAdmin(googleId);
    MediaStorageService.StoredFile stored = mediaStorageService.storeAudio(file);
    return new AdminUploadImageResponse(stored.publicUrl(), stored.fileName(), stored.size());
  }
}
