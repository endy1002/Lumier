package com.lumier.backend.service;

import com.lumier.backend.domain.AbandonedCart;
import com.lumier.backend.dto.AbandonedCartRequest;
import com.lumier.backend.repository.AbandonedCartRepository;
import org.springframework.stereotype.Service;

@Service
public class MarketingService {

  private final AbandonedCartRepository abandonedCartRepository;

  public MarketingService(AbandonedCartRepository abandonedCartRepository) {
    this.abandonedCartRepository = abandonedCartRepository;
  }

  public Long captureAbandonedCart(AbandonedCartRequest request) {
    AbandonedCart lead = new AbandonedCart();
    lead.setEmail(request.getEmail());
    lead.setCartSnapshotJson(request.getCartSnapshotJson());

    return abandonedCartRepository.save(lead).getId();
  }
}
