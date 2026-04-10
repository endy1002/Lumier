package com.lumier.backend.domain;

import com.lumier.backend.domain.enums.HardwareType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "customizations")
public class Customization {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(optional = false)
  @JoinColumn(name = "order_item_id", nullable = false, unique = true)
  private OrderItem orderItem;

  @Column(name = "uploaded_cover_url")
  private String uploadedCoverUrl;

  @Column(name = "spine_color_hex")
  private String spineColorHex;

  @Column(name = "engraved_text")
  private String engravedText;

  @Enumerated(EnumType.STRING)
  @Column(name = "hardware_type")
  private HardwareType hardwareType;

  @Column(name = "has_extra_chain")
  private Boolean hasExtraChain;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public OrderItem getOrderItem() {
    return orderItem;
  }

  public void setOrderItem(OrderItem orderItem) {
    this.orderItem = orderItem;
  }

  public String getUploadedCoverUrl() {
    return uploadedCoverUrl;
  }

  public void setUploadedCoverUrl(String uploadedCoverUrl) {
    this.uploadedCoverUrl = uploadedCoverUrl;
  }

  public String getSpineColorHex() {
    return spineColorHex;
  }

  public void setSpineColorHex(String spineColorHex) {
    this.spineColorHex = spineColorHex;
  }

  public String getEngravedText() {
    return engravedText;
  }

  public void setEngravedText(String engravedText) {
    this.engravedText = engravedText;
  }

  public HardwareType getHardwareType() {
    return hardwareType;
  }

  public void setHardwareType(HardwareType hardwareType) {
    this.hardwareType = hardwareType;
  }

  public Boolean getHasExtraChain() {
    return hasExtraChain;
  }

  public void setHasExtraChain(Boolean hasExtraChain) {
    this.hasExtraChain = hasExtraChain;
  }
}
