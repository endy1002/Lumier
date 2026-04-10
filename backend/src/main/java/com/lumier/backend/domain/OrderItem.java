package com.lumier.backend.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "order_id", nullable = false)
  private CustomerOrder order;

  @ManyToOne(optional = false)
  @JoinColumn(name = "product_id", nullable = false)
  private Product product;

  @Column(name = "item_subtotal", nullable = false, precision = 12, scale = 2)
  private BigDecimal itemSubtotal;

  @Column(nullable = false)
  private int quantity = 1;

  @OneToOne(mappedBy = "orderItem", cascade = CascadeType.ALL, orphanRemoval = true)
  private Customization customization;

  public void setCustomization(Customization customization) {
    this.customization = customization;
    if (customization != null) {
      customization.setOrderItem(this);
    }
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public CustomerOrder getOrder() {
    return order;
  }

  public void setOrder(CustomerOrder order) {
    this.order = order;
  }

  public Product getProduct() {
    return product;
  }

  public void setProduct(Product product) {
    this.product = product;
  }

  public BigDecimal getItemSubtotal() {
    return itemSubtotal;
  }

  public void setItemSubtotal(BigDecimal itemSubtotal) {
    this.itemSubtotal = itemSubtotal;
  }

  public int getQuantity() {
    return quantity;
  }

  public void setQuantity(int quantity) {
    this.quantity = quantity;
  }

  public Customization getCustomization() {
    return customization;
  }
}
