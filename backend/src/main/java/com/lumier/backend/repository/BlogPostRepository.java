package com.lumier.backend.repository;

import com.lumier.backend.domain.BlogPost;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
  List<BlogPost> findByIsPublishedTrueAndPublishedAtLessThanEqualOrderByPublishedAtDescIdDesc(OffsetDateTime now);

  Optional<BlogPost> findBySlugIgnoreCaseAndIsPublishedTrueAndPublishedAtLessThanEqual(String slug, OffsetDateTime now);

  List<BlogPost> findAllByOrderByPublishedAtDescIdDesc();

  boolean existsBySlugIgnoreCase(String slug);

  boolean existsBySlugIgnoreCaseAndIdNot(String slug, Long id);
}
