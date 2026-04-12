package com.lumier.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "audiobooks")
public class Audiobook {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "author_id", nullable = false)
  private BookAuthor author;

  @Column
  private String narrator;

  @Column(name = "duration_minutes")
  private Integer durationMinutes;

  @Column(name = "cover_image_url", columnDefinition = "TEXT")
  private String coverImageUrl;

  @Column(columnDefinition = "TEXT")
  private String summary;

  @Column(name = "audio_file_url", columnDefinition = "TEXT")
  private String audioFileUrl;

  @Column(name = "audio_format")
  private String audioFormat;

  @Column(name = "product_id")
  private Long productId;

  @Column(name = "display_order", nullable = false)
  private int displayOrder;

  @Column(name = "is_active", nullable = false)
  private boolean isActive = true;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public BookAuthor getAuthor() {
    return author;
  }

  public void setAuthor(BookAuthor author) {
    this.author = author;
  }

  public String getNarrator() {
    return narrator;
  }

  public void setNarrator(String narrator) {
    this.narrator = narrator;
  }

  public Integer getDurationMinutes() {
    return durationMinutes;
  }

  public void setDurationMinutes(Integer durationMinutes) {
    this.durationMinutes = durationMinutes;
  }

  public String getCoverImageUrl() {
    return coverImageUrl;
  }

  public void setCoverImageUrl(String coverImageUrl) {
    this.coverImageUrl = coverImageUrl;
  }

  public String getSummary() {
    return summary;
  }

  public void setSummary(String summary) {
    this.summary = summary;
  }

  public String getAudioFileUrl() {
    return audioFileUrl;
  }

  public void setAudioFileUrl(String audioFileUrl) {
    this.audioFileUrl = audioFileUrl;
  }

  public String getAudioFormat() {
    return audioFormat;
  }

  public void setAudioFormat(String audioFormat) {
    this.audioFormat = audioFormat;
  }

  public Long getProductId() {
    return productId;
  }

  public void setProductId(Long productId) {
    this.productId = productId;
  }

  public int getDisplayOrder() {
    return displayOrder;
  }

  public void setDisplayOrder(int displayOrder) {
    this.displayOrder = displayOrder;
  }

  public boolean isActive() {
    return isActive;
  }

  public void setActive(boolean active) {
    isActive = active;
  }
}
