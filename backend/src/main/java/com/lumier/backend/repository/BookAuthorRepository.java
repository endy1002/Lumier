package com.lumier.backend.repository;

import com.lumier.backend.domain.BookAuthor;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BookAuthorRepository extends JpaRepository<BookAuthor, Long> {
  List<BookAuthor> findByIsActiveTrueOrderByDisplayOrderAsc();

  List<BookAuthor> findAllByOrderByDisplayOrderAscIdAsc();

  Optional<BookAuthor> findByNameIgnoreCase(String name);

  @Query("select coalesce(max(a.displayOrder), 0) from BookAuthor a")
  int findMaxDisplayOrder();
}
