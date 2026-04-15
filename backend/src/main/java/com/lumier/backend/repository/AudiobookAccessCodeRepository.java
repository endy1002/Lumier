package com.lumier.backend.repository;

import com.lumier.backend.domain.AudiobookAccessCode;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AudiobookAccessCodeRepository extends JpaRepository<AudiobookAccessCode, Long> {

  Optional<AudiobookAccessCode> findByCodeNormalized(String codeNormalized);

  boolean existsByCodeNormalized(String codeNormalized);

  @Query("select distinct c.audiobook.id from AudiobookAccessCode c where c.redeemedByGoogleId = :googleId")
  Set<Long> findUnlockedAudiobookIdsByGoogleId(@Param("googleId") String googleId);

  @Query("select c.orderItem.id as orderItemId, c.codeValue as codeValue from AudiobookAccessCode c where c.order.id = :orderId order by c.id")
  List<OrderItemCodeRow> findCodeRowsByOrderId(@Param("orderId") Long orderId);

  @Query("select c.codeValue from AudiobookAccessCode c where c.order.id = :orderId and c.issuedToGoogleId = :googleId order by c.id")
  List<String> findCodeValuesByOrderIdAndGoogleId(@Param("orderId") Long orderId, @Param("googleId") String googleId);

  long countByOrderItemId(Long orderItemId);

  boolean existsByOrderId(Long orderId);

  interface OrderItemCodeRow {
    Long getOrderItemId();

    String getCodeValue();
  }
}
