package com.lumier.backend.repository;

import com.lumier.backend.domain.AbandonedCart;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AbandonedCartRepository extends JpaRepository<AbandonedCart, Long> {
}
