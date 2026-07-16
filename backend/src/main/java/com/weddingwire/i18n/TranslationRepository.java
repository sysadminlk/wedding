package com.weddingwire.i18n;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TranslationRepository extends JpaRepository<Translation, Long> {

    List<Translation> findByLanguageCode(String languageCode);

    List<Translation> findByLanguageCodeAndSection(String languageCode, String section);

    Optional<Translation> findByLanguageCodeAndKey(String languageCode, String key);
}
