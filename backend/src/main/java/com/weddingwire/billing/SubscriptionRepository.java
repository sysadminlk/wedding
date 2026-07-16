package com.weddingwire.billing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    Optional<Subscription> findByTenantIdAndActiveTrue(UUID tenantId);

    List<Subscription> findByTenantIdOrderBySubscribedAtDesc(UUID tenantId);
}
