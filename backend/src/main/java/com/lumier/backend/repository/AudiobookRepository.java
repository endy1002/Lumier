package com.lumier.backend.repository;

import com.lumier.backend.domain.Audiobook;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AudiobookRepository extends JpaRepository<Audiobook, Long> {
  List<Audiobook> findByIsActiveTrueOrderByDisplayOrderAsc();

  Optional<Audiobook> findByProductIdAndIsActiveTrue(Long productId);
}
