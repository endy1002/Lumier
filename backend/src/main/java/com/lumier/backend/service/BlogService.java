package com.lumier.backend.service;

import com.lumier.backend.domain.BlogPost;
import com.lumier.backend.dto.blog.BlogCardResponse;
import com.lumier.backend.dto.blog.BlogDetailResponse;
import com.lumier.backend.repository.BlogPostRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BlogService {

  private final BlogPostRepository blogPostRepository;

  public BlogService(BlogPostRepository blogPostRepository) {
    this.blogPostRepository = blogPostRepository;
  }

  @Transactional(readOnly = true)
  public List<BlogCardResponse> getPublishedCards() {
    OffsetDateTime now = OffsetDateTime.now();
    return blogPostRepository.findByIsPublishedTrueAndPublishedAtLessThanEqualOrderByPublishedAtDescIdDesc(now)
      .stream()
      .map(this::toCard)
      .toList();
  }

  @Transactional(readOnly = true)
  public BlogDetailResponse getPublishedDetailBySlug(String slug) {
    OffsetDateTime now = OffsetDateTime.now();
    BlogPost blogPost = blogPostRepository
      .findBySlugIgnoreCaseAndIsPublishedTrueAndPublishedAtLessThanEqual(slug, now)
      .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bài viết."));

    return toDetail(blogPost);
  }

  private BlogCardResponse toCard(BlogPost post) {
    String fallbackExcerpt = buildFallbackExcerpt(post.getContentHtml());
    return new BlogCardResponse(
      post.getId(),
      post.getSlug(),
      post.getTitle(),
      post.getExcerpt() == null ? fallbackExcerpt : post.getExcerpt(),
      post.getCoverImageUrl(),
      post.getSourceName(),
      post.getPublishedAt(),
      estimateReadingTimeMinutes(post.getContentHtml())
    );
  }

  private BlogDetailResponse toDetail(BlogPost post) {
    String fallbackExcerpt = buildFallbackExcerpt(post.getContentHtml());
    return new BlogDetailResponse(
      post.getId(),
      post.getSlug(),
      post.getTitle(),
      post.getExcerpt() == null ? fallbackExcerpt : post.getExcerpt(),
      post.getContentHtml(),
      post.getCoverImageUrl(),
      post.getSourceName(),
      post.getSeoTitle(),
      post.getSeoDescription(),
      post.getPublishedAt(),
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

  private String buildFallbackExcerpt(String contentHtml) {
    if (contentHtml == null || contentHtml.isBlank()) {
      return "";
    }

    String plain = contentHtml.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
    if (plain.length() <= 220) {
      return plain;
    }
    return plain.substring(0, 217) + "...";
  }
}
