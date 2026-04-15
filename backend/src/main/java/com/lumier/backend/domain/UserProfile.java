package com.lumier.backend.domain;

import com.lumier.backend.domain.enums.UserRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "users")
public class UserProfile {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "google_id", nullable = false, unique = true)
  private String googleId;

  @Column(nullable = false, unique = true)
  private String email;

  @Column
  private String name;

  @Column
  private String picture;

  @Column(name = "phone")
  private String phone;

  @Column(name = "shipping_address")
  private String shippingAddress;

  @Column(name = "marketing_opt_in", nullable = false)
  private boolean marketingOptIn = true;

  @Column(name = "last_order_at")
  private OffsetDateTime lastOrderAt;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt = OffsetDateTime.now();

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt = OffsetDateTime.now();

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private UserRole role = UserRole.CUSTOMER;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getGoogleId() {
    return googleId;
  }

  public void setGoogleId(String googleId) {
    this.googleId = googleId;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getPicture() {
    return picture;
  }

  public void setPicture(String picture) {
    this.picture = picture;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public String getShippingAddress() {
    return shippingAddress;
  }

  public void setShippingAddress(String shippingAddress) {
    this.shippingAddress = shippingAddress;
  }

  public boolean isMarketingOptIn() {
    return marketingOptIn;
  }

  public void setMarketingOptIn(boolean marketingOptIn) {
    this.marketingOptIn = marketingOptIn;
  }

  public OffsetDateTime getLastOrderAt() {
    return lastOrderAt;
  }

  public void setLastOrderAt(OffsetDateTime lastOrderAt) {
    this.lastOrderAt = lastOrderAt;
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

  public UserRole getRole() {
    return role;
  }

  public void setRole(UserRole role) {
    this.role = role;
  }
}
