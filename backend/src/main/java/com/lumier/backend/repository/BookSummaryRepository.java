package com.lumier.backend.repository;

import com.lumier.backend.domain.BookSummary;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookSummaryRepository extends JpaRepository<BookSummary, Long> {
  List<BookSummary> findByIsActiveTrueOrderByDisplayOrderAsc();
}
