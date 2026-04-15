package com.lumier.backend.service;

import com.lumier.backend.domain.BlogPost;
import com.lumier.backend.dto.admin.AdminBlogItemResponse;
import com.lumier.backend.dto.admin.AdminUpsertBlogRequest;
import com.lumier.backend.repository.BlogPostRepository;
import jakarta.persistence.EntityNotFoundException;
import java.text.Normalizer;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminBlogService {

  private final AdminAuthorizationService adminAuthorizationService;
  private final BlogPostRepository blogPostRepository;

  public AdminBlogService(
    AdminAuthorizationService adminAuthorizationService,
    BlogPostRepository blogPostRepository
  ) {
    this.adminAuthorizationService = adminAuthorizationService;
    this.blogPostRepository = blogPostRepository;
  }

  @Transactional(readOnly = true)
  public List<AdminBlogItemResponse> getBlogs(String googleId) {
    adminAuthorizationService.requireAdmin(googleId);

    return blogPostRepository.findAllByOrderByPublishedAtDescIdDesc()
      .stream()
      .map(this::toItem)
      .toList();
  }

  @Transactional
  public AdminBlogItemResponse createBlog(String googleId, AdminUpsertBlogRequest request) {
    adminAuthorizationService.requireAdmin(googleId);

    BlogPost post = new BlogPost();
    applyUpsert(post, request, null);

    return toItem(blogPostRepository.save(post));
  }

  @Transactional
  public AdminBlogItemResponse updateBlog(String googleId, Long blogId, AdminUpsertBlogRequest request) {
    adminAuthorizationService.requireAdmin(googleId);
    Long requiredBlogId = Objects.requireNonNull(blogId);

    BlogPost post = blogPostRepository.findById(requiredBlogId)
      .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bài viết."));

    applyUpsert(post, request, requiredBlogId);

    return toItem(blogPostRepository.save(Objects.requireNonNull(post)));
  }

  @Transactional
  public void deleteBlog(String googleId, Long blogId) {
    adminAuthorizationService.requireAdmin(googleId);
    Long requiredBlogId = Objects.requireNonNull(blogId);

    BlogPost post = blogPostRepository.findById(requiredBlogId)
      .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bài viết."));

    blogPostRepository.delete(Objects.requireNonNull(post));
  }

  private void applyUpsert(BlogPost post, AdminUpsertBlogRequest request, Long currentId) {
    String title = requireNonBlank(request.title(), "Tiêu đề bài viết là bắt buộc.");
    String slugInput = trimToNull(request.slug());
    String slug = slugInput == null ? slugify(title) : slugify(slugInput);

    if (slug.isBlank()) {
      throw new IllegalArgumentException("Slug bài viết không hợp lệ.");
    }

    boolean slugExists = currentId == null
      ? blogPostRepository.existsBySlugIgnoreCase(slug)
      : blogPostRepository.existsBySlugIgnoreCaseAndIdNot(slug, currentId);

    if (slugExists) {
      throw new IllegalArgumentException("Slug đã tồn tại. Vui lòng đổi slug khác.");
    }

    String contentHtml = requireNonBlank(request.contentHtml(), "Nội dung bài viết là bắt buộc.");
    if (contentHtml.toLowerCase().contains("<script")) {
      throw new IllegalArgumentException("Nội dung chứa thẻ script không được phép.");
    }

    boolean isPublished = request.isPublished() != null && request.isPublished();
    OffsetDateTime publishedAt = request.publishedAt();
    if (isPublished && publishedAt == null) {
      publishedAt = OffsetDateTime.now();
    }

    post.setTitle(title);
    post.setSlug(slug);
    post.setExcerpt(trimToNull(request.excerpt()));
    post.setContentHtml(contentHtml);
    post.setCoverImageUrl(trimToNull(request.coverImageUrl()));
    post.setSourceName(trimToNull(request.sourceName()));
    post.setSeoTitle(trimToNull(request.seoTitle()));
    post.setSeoDescription(trimToNull(request.seoDescription()));
    post.setPublished(isPublished);
    post.setPublishedAt(isPublished ? publishedAt : null);
  }

  private AdminBlogItemResponse toItem(BlogPost post) {
    return new AdminBlogItemResponse(
      post.getId(),
      post.getSlug(),
      post.getTitle(),
      post.getExcerpt(),
      post.getContentHtml(),
      post.getCoverImageUrl(),
      post.getSourceName(),
      post.getSeoTitle(),
      post.getSeoDescription(),
      post.isPublished(),
      post.getPublishedAt(),
      post.getCreatedAt(),
      post.getUpdatedAt(),
      estimateReadingTimeMinutes(post.getContentHtml())
    );
  }

  private Integer estimateReadingTimeMinutes(String contentHtml) {
    String plain = contentHtml == null ? "" : contentHtml.replaceAll("<[^>]*>", " ").trim();
    if (plain.isBlank()) {
      return 1;
    }
    int words = plain.split("\\s+").length;
    return Math.max(1, (int) Math.ceil(words / 220.0));
  }

  private String requireNonBlank(String value, String message) {
    String normalized = trimToNull(value);
    if (normalized == null) {
      throw new IllegalArgumentException(message);
    }
    return normalized;
  }

  private String trimToNull(String value) {
    String normalized = value == null ? null : value.trim();
    return (normalized == null || normalized.isBlank()) ? null : normalized;
  }

  private String slugify(String value) {
    String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
      .replaceAll("\\p{M}+", "")
      .toLowerCase()
      .replaceAll("[^a-z0-9\\s-]", "")
      .replaceAll("\\s+", "-")
      .replaceAll("-+", "-")
      .replaceAll("(^-|-$)", "");

    return normalized;
  }
}
