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
import java.time.OffsetDateTime;

@Entity
@Table(name = "audiobook_access_codes")
public class AudiobookAccessCode {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "code_value", nullable = false)
  private String codeValue;

  @Column(name = "code_normalized", nullable = false, unique = true)
  private String codeNormalized;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "audiobook_id", nullable = false)
  private Audiobook audiobook;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "order_id", nullable = false)
  private CustomerOrder order;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "order_item_id", nullable = false)
  private OrderItem orderItem;

  @Column(name = "issued_to_google_id", nullable = false)
  private String issuedToGoogleId;

  @Column(name = "redeemed_by_google_id")
  private String redeemedByGoogleId;

  @Column(name = "issued_at", nullable = false)
  private OffsetDateTime issuedAt;

  @Column(name = "redeemed_at")
  private OffsetDateTime redeemedAt;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getCodeValue() {
    return codeValue;
  }

  public void setCodeValue(String codeValue) {
    this.codeValue = codeValue;
  }

  public String getCodeNormalized() {
    return codeNormalized;
  }

  public void setCodeNormalized(String codeNormalized) {
    this.codeNormalized = codeNormalized;
  }

  public Audiobook getAudiobook() {
    return audiobook;
  }

  public void setAudiobook(Audiobook audiobook) {
    this.audiobook = audiobook;
  }

  public CustomerOrder getOrder() {
    return order;
  }

  public void setOrder(CustomerOrder order) {
    this.order = order;
  }

  public OrderItem getOrderItem() {
    return orderItem;
  }

  public void setOrderItem(OrderItem orderItem) {
    this.orderItem = orderItem;
  }

  public String getIssuedToGoogleId() {
    return issuedToGoogleId;
  }

  public void setIssuedToGoogleId(String issuedToGoogleId) {
    this.issuedToGoogleId = issuedToGoogleId;
  }

  public String getRedeemedByGoogleId() {
    return redeemedByGoogleId;
  }

  public void setRedeemedByGoogleId(String redeemedByGoogleId) {
    this.redeemedByGoogleId = redeemedByGoogleId;
  }

  public OffsetDateTime getIssuedAt() {
    return issuedAt;
  }

  public void setIssuedAt(OffsetDateTime issuedAt) {
    this.issuedAt = issuedAt;
  }

  public OffsetDateTime getRedeemedAt() {
    return redeemedAt;
  }

  public void setRedeemedAt(OffsetDateTime redeemedAt) {
    this.redeemedAt = redeemedAt;
  }
}
