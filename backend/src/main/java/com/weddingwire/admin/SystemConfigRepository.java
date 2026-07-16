package com.weddingwire.admin;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, String> {

    List<SystemConfig> findByCategory(String category);

    List<SystemConfig> findByKeyIn(List<String> keys);
}
