package com.lumier.backend.repository;

import com.lumier.backend.domain.UserProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
  Optional<UserProfile> findByGoogleId(String googleId);

  Optional<UserProfile> findByEmail(String email);
}
