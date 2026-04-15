package com.lumier.backend.config;

import com.lumier.backend.service.MediaStorageService;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MediaResourceConfig implements WebMvcConfigurer {

  private final MediaStorageService mediaStorageService;

  public MediaResourceConfig(MediaStorageService mediaStorageService) {
    this.mediaStorageService = mediaStorageService;
  }

  @Override
  public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
    String fileLocation = mediaStorageService.getUploadPath().toUri().toString();
    registry.addResourceHandler("/api/media/**")
      .addResourceLocations(fileLocation);
  }
}
