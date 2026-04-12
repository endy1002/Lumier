package com.lumier.backend.service;

import com.lumier.backend.domain.CustomerOrder;
import com.lumier.backend.domain.Customization;
import com.lumier.backend.domain.MarketingData;
import com.lumier.backend.domain.OrderItem;
import com.lumier.backend.domain.Product;
import com.lumier.backend.domain.UserProfile;
import com.lumier.backend.domain.enums.OrderStatus;
import com.lumier.backend.dto.CheckoutRequest;
import com.lumier.backend.dto.CheckoutResponse;
import com.lumier.backend.dto.OrderHistoryItemResponse;
import com.lumier.backend.dto.OrderHistoryResponse;
import com.lumier.backend.repository.CustomerOrderRepository;
import com.lumier.backend.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

  private final ProductRepository productRepository;
  private final CustomerOrderRepository customerOrderRepository;
  private final PricingService pricingService;
  private final UserProfileService userProfileService;
  private final AudiobookCodeService audiobookCodeService;

  public OrderService(
    ProductRepository productRepository,
    CustomerOrderRepository customerOrderRepository,
    PricingService pricingService,
    UserProfileService userProfileService,
    AudiobookCodeService audiobookCodeService
  ) {
    this.productRepository = productRepository;
    this.customerOrderRepository = customerOrderRepository;
    this.pricingService = pricingService;
    this.userProfileService = userProfileService;
    this.audiobookCodeService = audiobookCodeService;
  }

  @Transactional
  public CheckoutResponse checkout(CheckoutRequest request) {
    UserProfile user = userProfileService.getRequiredByGoogleId(request.getGoogleId());
    userProfileService.updateShippingProfile(
      request.getGoogleId(),
      request.getCustomerName(),
      request.getCustomerPhone(),
      request.getShippingAddress()
    );

    CustomerOrder order = new CustomerOrder();
    order.setCustomerGoogleId(user.getGoogleId());
    order.setCustomerEmail(user.getEmail());
    order.setCustomerName(request.getCustomerName());
    order.setCustomerPhone(request.getCustomerPhone());
    order.setShippingAddress(request.getShippingAddress());
    order.setStatus(OrderStatus.PENDING);

    if (request.getMarketingData() != null) {
      MarketingData marketingData = new MarketingData();
      marketingData.setUtmSource(request.getMarketingData().getUtmSource());
      marketingData.setUtmMedium(request.getMarketingData().getUtmMedium());
      marketingData.setUtmCampaign(request.getMarketingData().getUtmCampaign());
      order.setMarketingData(marketingData);
    }

    BigDecimal totalAmount = BigDecimal.ZERO;

    for (CheckoutRequest.CheckoutItemRequest itemRequest : request.getItems()) {
      Long productId = Objects.requireNonNull(itemRequest.getProductId());

      Product product = productRepository.findById(productId)
        .filter(Product::isAvailable)
        .orElseThrow(() -> new EntityNotFoundException("Product not found or unavailable: " + productId));

      BigDecimal itemSubtotal = pricingService.calculateItemSubtotal(
        product,
        itemRequest.getCustomization(),
        itemRequest.getQuantity()
      );

      OrderItem item = new OrderItem();
      item.setProduct(product);
      item.setQuantity(itemRequest.getQuantity());
      item.setItemSubtotal(itemSubtotal);

      if (hasCustomization(itemRequest.getCustomization())) {
        Customization customization = new Customization();
        customization.setUploadedCoverUrl(itemRequest.getCustomization().getUploadedCoverUrl());
        customization.setSpineColorHex(itemRequest.getCustomization().getSpineColorHex());
        customization.setEngravedText(itemRequest.getCustomization().getEngravedText());
        customization.setHardwareType(itemRequest.getCustomization().getHardwareType());
        customization.setHasExtraChain(itemRequest.getCustomization().getHasExtraChain());
        item.setCustomization(customization);
      }

      order.addOrderItem(item);
      totalAmount = totalAmount.add(itemSubtotal);
    }

    order.setTotalAmount(totalAmount);
    CustomerOrder saved = customerOrderRepository.save(order);
    userProfileService.markOrderPlaced(request.getGoogleId());
    audiobookCodeService.issueCodesForOrder(saved);

    return new CheckoutResponse(saved.getId(), saved.getStatus(), saved.getTotalAmount());
  }

  @Transactional(readOnly = true)
  public List<OrderHistoryResponse> getOrderHistory(String googleId) {
    return customerOrderRepository.findByCustomerGoogleIdOrderByCreatedAtDesc(googleId)
      .stream()
      .map(order -> new OrderHistoryResponse(
        order.getId(),
        order.getStatus().name(),
        order.getTotalAmount(),
        order.getCreatedAt(),
        order.getOrderItems().stream()
          .map(item -> new OrderHistoryItemResponse(
            item.getId(),
            item.getProduct().getId(),
            item.getProduct().getName(),
            item.getQuantity(),
            item.getItemSubtotal(),
            item.getCustomization() != null ? item.getCustomization().getSpineColorHex() : null,
            item.getCustomization() != null ? item.getCustomization().getEngravedText() : null,
            item.getCustomization() != null && item.getCustomization().getHardwareType() != null
              ? item.getCustomization().getHardwareType().name()
              : null,
            item.getCustomization() != null ? item.getCustomization().getHasExtraChain() : null,
            item.getCustomization() != null
              && item.getCustomization().getUploadedCoverUrl() != null
              && !item.getCustomization().getUploadedCoverUrl().isBlank()
          ))
          .toList()
      ))
      .toList();
  }

  private boolean hasCustomization(CheckoutRequest.CustomizationRequest customization) {
    if (customization == null) {
      return false;
    }

    return (customization.getUploadedCoverUrl() != null && !customization.getUploadedCoverUrl().isBlank())
      || (customization.getSpineColorHex() != null && !customization.getSpineColorHex().isBlank())
      || (customization.getEngravedText() != null && !customization.getEngravedText().isBlank())
      || customization.getHardwareType() != null
      || Boolean.TRUE.equals(customization.getHasExtraChain());
  }
}
