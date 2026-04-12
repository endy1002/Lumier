package com.lumier.backend.repository;

import com.lumier.backend.domain.AudiobookAccessCode;
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
}
