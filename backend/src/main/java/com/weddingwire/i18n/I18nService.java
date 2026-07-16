package com.weddingwire.i18n;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class I18nService {

    private final TranslationRepository translationRepository;
    private final LanguageConfigRepository languageConfigRepository;

    public List<Translation> getTranslations(String languageCode) {
        return translationRepository.findByLanguageCode(languageCode);
    }

    public List<Translation> getTranslationsBySection(String languageCode, String section) {
        return translationRepository.findByLanguageCodeAndSection(languageCode, section);
    }

    @Transactional
    public void setTranslation(String languageCode, String key, String value) {
        Translation translation = translationRepository.findByLanguageCodeAndKey(languageCode, key)
                .orElse(Translation.builder()
                        .languageCode(languageCode)
                        .key(key)
                        .section(key.contains(".") ? key.substring(0, key.indexOf('.')) : "general")
                        .build());
        translation.setValue(value);
        translationRepository.save(translation);
    }

    @Transactional
    public void setTranslations(String languageCode, Map<String, String> translations) {
        translations.forEach((key, value) -> setTranslation(languageCode, key, value));
    }

    public List<LanguageConfig> getEnabledLanguages() {
        return languageConfigRepository.findByEnabledTrue();
    }

    @Transactional
    public LanguageConfig addLanguage(String code, String name) {
        LanguageConfig config = LanguageConfig.builder()
                .languageCode(code)
                .languageName(name)
                .enabled(true)
                .isDefault(false)
                .build();
        return languageConfigRepository.save(config);
    }

    @Transactional
    public void deleteTranslation(String languageCode, String key) {
        translationRepository.findByLanguageCodeAndKey(languageCode, key)
                .ifPresent(translationRepository::delete);
    }
}
