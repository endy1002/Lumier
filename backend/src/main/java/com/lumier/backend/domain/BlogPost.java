package com.lumier.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "blog_posts")
public class BlogPost {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 180)
  private String slug;

  @Column(nullable = false)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String excerpt;

  @Column(name = "content_html", nullable = false, columnDefinition = "TEXT")
  private String contentHtml;

  @Column(name = "cover_image_url", columnDefinition = "TEXT")
  private String coverImageUrl;

  @Column(name = "source_name", length = 120)
  private String sourceName;

  @Column(name = "seo_title")
  private String seoTitle;

  @Column(name = "seo_description", columnDefinition = "TEXT")
  private String seoDescription;

  @Column(name = "is_published", nullable = false)
  private boolean isPublished;

  @Column(name = "published_at")
  private OffsetDateTime publishedAt;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  @PrePersist
  public void onCreate() {
    OffsetDateTime now = OffsetDateTime.now();
    createdAt = now;
    updatedAt = now;
    if (isPublished && publishedAt == null) {
      publishedAt = now;
    }
  }

  @PreUpdate
  public void onUpdate() {
    updatedAt = OffsetDateTime.now();
    if (isPublished && publishedAt == null) {
      publishedAt = OffsetDateTime.now();
    }
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getSlug() {
    return slug;
  }

  public void setSlug(String slug) {
    this.slug = slug;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getExcerpt() {
    return excerpt;
  }

  public void setExcerpt(String excerpt) {
    this.excerpt = excerpt;
  }

  public String getContentHtml() {
    return contentHtml;
  }

  public void setContentHtml(String contentHtml) {
    this.contentHtml = contentHtml;
  }

  public String getCoverImageUrl() {
    return coverImageUrl;
  }

  public void setCoverImageUrl(String coverImageUrl) {
    this.coverImageUrl = coverImageUrl;
  }

  public String getSourceName() {
    return sourceName;
  }

  public void setSourceName(String sourceName) {
    this.sourceName = sourceName;
  }

  public String getSeoTitle() {
    return seoTitle;
  }

  public void setSeoTitle(String seoTitle) {
    this.seoTitle = seoTitle;
  }

  public String getSeoDescription() {
    return seoDescription;
  }

  public void setSeoDescription(String seoDescription) {
    this.seoDescription = seoDescription;
  }

  public boolean isPublished() {
    return isPublished;
  }

  public void setPublished(boolean published) {
    isPublished = published;
  }

  public OffsetDateTime getPublishedAt() {
    return publishedAt;
  }

  public void setPublishedAt(OffsetDateTime publishedAt) {
    this.publishedAt = publishedAt;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(OffsetDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }
}
