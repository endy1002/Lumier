package com.lumier.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "book_authors")
public class BookAuthor {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @Column(columnDefinition = "TEXT")
  private String bio;

  @Column(name = "avatar_url", columnDefinition = "TEXT")
  private String avatarUrl;

  @Column(name = "featured_works", columnDefinition = "TEXT")
  private String featuredWorks;

  @Column(name = "info_image_1", columnDefinition = "TEXT")
  private String infoImage1;

  @Column(name = "info_image_2", columnDefinition = "TEXT")
  private String infoImage2;

  @Column(name = "info_image_3", columnDefinition = "TEXT")
  private String infoImage3;

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

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getBio() {
    return bio;
  }

  public void setBio(String bio) {
    this.bio = bio;
  }

  public String getAvatarUrl() {
    return avatarUrl;
  }

  public void setAvatarUrl(String avatarUrl) {
    this.avatarUrl = avatarUrl;
  }

  public String getFeaturedWorks() {
    return featuredWorks;
  }

  public void setFeaturedWorks(String featuredWorks) {
    this.featuredWorks = featuredWorks;
  }

  public String getInfoImage1() {
    return infoImage1;
  }

  public void setInfoImage1(String infoImage1) {
    this.infoImage1 = infoImage1;
  }

  public String getInfoImage2() {
    return infoImage2;
  }

  public void setInfoImage2(String infoImage2) {
    this.infoImage2 = infoImage2;
  }

  public String getInfoImage3() {
    return infoImage3;
  }

  public void setInfoImage3(String infoImage3) {
    this.infoImage3 = infoImage3;
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
