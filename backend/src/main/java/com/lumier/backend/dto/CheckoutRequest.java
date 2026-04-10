package com.lumier.backend.dto;

import com.lumier.backend.domain.enums.HardwareType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class CheckoutRequest {

  @NotBlank
  private String googleId;

  @NotBlank
  private String customerName;

  @NotBlank
  private String customerPhone;

  @NotBlank
  private String shippingAddress;

  @Valid
  private MarketingDataRequest marketingData;

  @Valid
  @NotEmpty
  private List<CheckoutItemRequest> items;

  public String getGoogleId() {
    return googleId;
  }

  public void setGoogleId(String googleId) {
    this.googleId = googleId;
  }

  public String getCustomerName() {
    return customerName;
  }

  public void setCustomerName(String customerName) {
    this.customerName = customerName;
  }

  public String getCustomerPhone() {
    return customerPhone;
  }

  public void setCustomerPhone(String customerPhone) {
    this.customerPhone = customerPhone;
  }

  public String getShippingAddress() {
    return shippingAddress;
  }

  public void setShippingAddress(String shippingAddress) {
    this.shippingAddress = shippingAddress;
  }

  public MarketingDataRequest getMarketingData() {
    return marketingData;
  }

  public void setMarketingData(MarketingDataRequest marketingData) {
    this.marketingData = marketingData;
  }

  public List<CheckoutItemRequest> getItems() {
    return items;
  }

  public void setItems(List<CheckoutItemRequest> items) {
    this.items = items;
  }

  public static class MarketingDataRequest {
    private String utmSource;
    private String utmMedium;
    private String utmCampaign;

    public String getUtmSource() {
      return utmSource;
    }

    public void setUtmSource(String utmSource) {
      this.utmSource = utmSource;
    }

    public String getUtmMedium() {
      return utmMedium;
    }

    public void setUtmMedium(String utmMedium) {
      this.utmMedium = utmMedium;
    }

    public String getUtmCampaign() {
      return utmCampaign;
    }

    public void setUtmCampaign(String utmCampaign) {
      this.utmCampaign = utmCampaign;
    }
  }

  public static class CheckoutItemRequest {

    @NotNull
    private Long productId;

    @Min(1)
    private int quantity = 1;

    @Valid
    private CustomizationRequest customization;

    public Long getProductId() {
      return productId;
    }

    public void setProductId(Long productId) {
      this.productId = productId;
    }

    public int getQuantity() {
      return quantity;
    }

    public void setQuantity(int quantity) {
      this.quantity = quantity;
    }

    public CustomizationRequest getCustomization() {
      return customization;
    }

    public void setCustomization(CustomizationRequest customization) {
      this.customization = customization;
    }
  }

  public static class CustomizationRequest {
    private String uploadedCoverUrl;
    private String spineColorHex;
    private String engravedText;
    private HardwareType hardwareType;
    private Boolean hasExtraChain;

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
}
