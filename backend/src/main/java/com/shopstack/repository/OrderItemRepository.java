package com.shopstack.repository;

import com.shopstack.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByVendorIdOrderByOrderCreatedAtDesc(Long vendorId);
}
