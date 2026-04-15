package com.lumier.backend.repository;

import com.lumier.backend.domain.CustomerOrder;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
	List<CustomerOrder> findByCustomerGoogleIdOrderByCreatedAtDesc(String customerGoogleId);

	Optional<CustomerOrder> findByIdAndCustomerGoogleId(Long id, String customerGoogleId);

  List<CustomerOrder> findAllByOrderByCreatedAtDesc();
}
