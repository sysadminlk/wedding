package com.weddingwire.i18n;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LanguageConfigRepository extends JpaRepository<LanguageConfig, String> {

    List<LanguageConfig> findByEnabledTrue();

    LanguageConfig findByIsDefaultTrue();
}
