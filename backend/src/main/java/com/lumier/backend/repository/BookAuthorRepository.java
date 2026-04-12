package com.lumier.backend.repository;

import com.lumier.backend.domain.BookAuthor;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookAuthorRepository extends JpaRepository<BookAuthor, Long> {
  List<BookAuthor> findByIsActiveTrueOrderByDisplayOrderAsc();
}
