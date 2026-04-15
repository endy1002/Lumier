package com.lumier.backend.repository;

import com.lumier.backend.domain.Audiobook;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AudiobookRepository extends JpaRepository<Audiobook, Long> {
  List<Audiobook> findByIsActiveTrueOrderByDisplayOrderAsc();

  Optional<Audiobook> findByProductIdAndIsActiveTrue(Long productId);

  Optional<Audiobook> findByProductId(Long productId);

  boolean existsByAuthor_Id(Long authorId);

  @Query("select coalesce(max(a.displayOrder), 0) from Audiobook a")
  int findMaxDisplayOrder();

  @Query("""
    select a from Audiobook a
    join Product p on p.id = a.productId
    where a.isActive = true and p.category = com.lumier.backend.domain.enums.ProductCategory.CHARM
    order by a.displayOrder asc
  """)
  List<Audiobook> findActiveCharmAudiobooksOrderByDisplayOrderAsc();

  @Query("""
    select a from Audiobook a
    join Product p on p.id = a.productId
    where p.category = com.lumier.backend.domain.enums.ProductCategory.CHARM
    order by a.displayOrder asc
  """)
  List<Audiobook> findCharmAudiobooksOrderByDisplayOrderAsc();
}
