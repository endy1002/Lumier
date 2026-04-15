package com.lumier.backend.service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MediaStorageService {

  private static final Logger log = LoggerFactory.getLogger(MediaStorageService.class);

  private final Path uploadPath;
  private final boolean supabaseEnabled;
  private final String supabaseUrl;
  private final String supabaseServiceRoleKey;
  private final String supabaseBucket;
  private final String supabasePublicBaseUrl;
  private final int supabaseRequestTimeoutSeconds;
  private final boolean allowLocalFallbackWhenSupabaseFails;
  private final HttpClient httpClient;
  private volatile boolean supabaseAvailable;

  public MediaStorageService(
    @Value("${app.media.upload-dir:backend/uploads}") String uploadDir,
    @Value("${app.supabase.enabled:false}") boolean supabaseEnabled,
    @Value("${app.supabase.url:}") String supabaseUrl,
    @Value("${app.supabase.service-role-key:}") String supabaseServiceRoleKey,
    @Value("${app.supabase.bucket:lumier-media}") String supabaseBucket,
    @Value("${app.supabase.public-base-url:}") String supabasePublicBaseUrl,
    @Value("${app.supabase.request-timeout-seconds:180}") int supabaseRequestTimeoutSeconds,
    @Value("${app.supabase.allow-local-fallback:false}") boolean allowLocalFallbackWhenSupabaseFails
  ) {
    this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
    this.supabaseEnabled = supabaseEnabled;
    this.supabaseUrl = trimTrailingSlash(supabaseUrl);
    this.supabaseServiceRoleKey = supabaseServiceRoleKey;
    this.supabaseBucket = supabaseBucket;
    this.supabasePublicBaseUrl = trimTrailingSlash(supabasePublicBaseUrl);
    this.supabaseRequestTimeoutSeconds = Math.max(30, supabaseRequestTimeoutSeconds);
    this.allowLocalFallbackWhenSupabaseFails = allowLocalFallbackWhenSupabaseFails;
    this.httpClient = HttpClient.newBuilder()
      .connectTimeout(Duration.ofSeconds(Math.min(this.supabaseRequestTimeoutSeconds, 30)))
      .build();
    this.supabaseAvailable = supabaseEnabled;

    if (supabaseEnabled) {
      validateSupabaseConfig(this.supabaseUrl, this.supabaseServiceRoleKey, this.supabaseBucket);
    }
  }

  public StoredFile storeImage(MultipartFile file) {
    return storeByType(file, "image/", "Vui lòng chọn file ảnh để upload.", "Chỉ hỗ trợ upload file ảnh.", ".png");
  }

  public StoredFile storeAudio(MultipartFile file) {
    return storeByType(file, "audio/", "Vui lòng chọn file audio để upload.", "Chỉ hỗ trợ upload file audio.", ".mp3");
  }

  public Path getUploadPath() {
    return uploadPath;
  }

  private StoredFile storeByType(
    MultipartFile file,
    String expectedPrefix,
    String emptyMessage,
    String typeMessage,
    String defaultExt
  ) {
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException(emptyMessage);
    }

    String contentType = file.getContentType();
    if (contentType == null || !contentType.toLowerCase().startsWith(expectedPrefix)) {
      throw new IllegalArgumentException(typeMessage);
    }

    String mediaType = expectedPrefix.startsWith("image/") ? "images" : "audio";
    String originalName = file.getOriginalFilename() == null ? mediaType : file.getOriginalFilename();
    String extension = resolveExtension(originalName, defaultExt);
    String fileName = UUID.randomUUID() + extension;
    String objectKey = mediaType + "/" + fileName;

    if (supabaseAvailable) {
      return storeToSupabase(file, objectKey, fileName, contentType);
    }

    return storeToLocal(file, fileName);
  }

  private StoredFile storeToLocal(MultipartFile file, String fileName) {
    try {
      Files.createDirectories(uploadPath);
      Path destination = uploadPath.resolve(fileName);
      Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
      return new StoredFile(fileName, "/api/media/" + fileName, file.getSize());
    } catch (IOException ex) {
      throw new IllegalStateException("Không thể lưu file lên server.", ex);
    }
  }

  private StoredFile storeToSupabase(MultipartFile file, String objectKey, String fileName, String contentType) {
    try {
      String encodedKey = encodeObjectKey(objectKey);
      HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(supabaseUrl + "/storage/v1/object/" + supabaseBucket + "/" + encodedKey))
        .timeout(Duration.ofSeconds(supabaseRequestTimeoutSeconds))
        .header("apikey", supabaseServiceRoleKey)
        .header("Authorization", "Bearer " + supabaseServiceRoleKey)
        .header("x-upsert", "true")
        .header("Content-Type", contentType)
        .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
        .build();

      HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() < 200 || response.statusCode() >= 300) {
        String body = response.body() == null ? "" : response.body();
        if (body.toLowerCase().contains("bucket not found")) {
          supabaseAvailable = false;
          String message = "Không tìm thấy Supabase bucket '" + supabaseBucket + "'. Vui lòng kiểm tra cấu hình SUPABASE_STORAGE_BUCKET.";
          log.error(message);
          return fallbackOrThrow(file, fileName, objectKey, message, null);
        }

        String message = "Upload lên Supabase thất bại. HTTP " + response.statusCode() + ": " + response.body();
        return fallbackOrThrow(file, fileName, objectKey, message, null);
      }

      String baseUrl = isBlank(supabasePublicBaseUrl)
        ? supabaseUrl + "/storage/v1/object/public/" + supabaseBucket
        : supabasePublicBaseUrl;

      return new StoredFile(fileName, baseUrl + "/" + objectKey, file.getSize());
    } catch (HttpTimeoutException ex) {
      return fallbackOrThrow(
        file,
        fileName,
        objectKey,
        "Upload lên Supabase bị timeout khi xử lý file lớn. Vui lòng thử lại hoặc giảm dung lượng audio.",
        ex
      );
    } catch (IOException ex) {
      return fallbackOrThrow(file, fileName, objectKey, "Upload lên Supabase thất bại do lỗi kết nối.", ex);
    } catch (InterruptedException ex) {
      Thread.currentThread().interrupt();
      return fallbackOrThrow(file, fileName, objectKey, "Upload lên Supabase bị gián đoạn.", ex);
    } catch (RuntimeException ex) {
      return fallbackOrThrow(file, fileName, objectKey, "Upload lên Supabase thất bại do lỗi hệ thống.", ex);
    }
  }

  private StoredFile fallbackOrThrow(
    MultipartFile file,
    String fileName,
    String objectKey,
    String message,
    Exception cause
  ) {
    if (!supabaseEnabled || allowLocalFallbackWhenSupabaseFails) {
      if (cause == null) {
        log.warn("{}. Fallback to local storage. key={}", message, objectKey);
      } else {
        log.warn("{}. Fallback to local storage. key={} cause={}", message, objectKey, cause.getMessage());
      }
      return storeToLocal(file, fileName);
    }

    log.error("{}. key={}", message, objectKey, cause);
    throw cause == null
      ? new IllegalStateException(message)
      : new IllegalStateException(message, cause);
  }

  private String encodeObjectKey(String objectKey) {
    return URLEncoder.encode(objectKey, StandardCharsets.UTF_8).replace("+", "%20").replace("%2F", "/");
  }

  private String resolveExtension(String fileName, String defaultExt) {
    int dot = fileName.lastIndexOf('.');
    if (dot < 0 || dot == fileName.length() - 1) {
      return defaultExt;
    }

    String extension = fileName.substring(dot).toLowerCase();
    if (extension.length() > 10) {
      return defaultExt;
    }
    return extension;
  }

  private void validateSupabaseConfig(String url, String serviceRoleKey, String bucket) {
    if (isBlank(url) || isBlank(serviceRoleKey) || isBlank(bucket)) {
      throw new IllegalStateException("Supabase storage đang bật nhưng thiếu cấu hình bắt buộc (url/service-role-key/bucket).");
    }
  }

  private boolean isBlank(String value) {
    return value == null || value.isBlank();
  }

  private String trimTrailingSlash(String value) {
    if (value == null) {
      return null;
    }
    return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
  }

  public record StoredFile(String fileName, String publicUrl, long size) {
  }
}
