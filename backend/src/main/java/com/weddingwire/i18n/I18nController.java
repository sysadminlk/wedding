package com.weddingwire.i18n;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/i18n")
@RequiredArgsConstructor
public class I18nController {

    private final I18nService i18nService;

    @GetMapping("/languages")
    public ResponseEntity<List<LanguageConfig>> getLanguages() {
        return ResponseEntity.ok(i18nService.getEnabledLanguages());
    }

    @GetMapping("/translations/{lang}")
    public ResponseEntity<List<Translation>> getTranslations(@PathVariable String lang) {
        return ResponseEntity.ok(i18nService.getTranslations(lang));
    }

    @GetMapping("/translations/{lang}/{section}")
    public ResponseEntity<List<Translation>> getTranslationsBySection(
            @PathVariable String lang, @PathVariable String section) {
        return ResponseEntity.ok(i18nService.getTranslationsBySection(lang, section));
    }

    @PutMapping("/translations/{lang}")
    public ResponseEntity<Void> updateTranslations(
            @PathVariable String lang, @RequestBody Map<String, String> translations) {
        i18nService.setTranslations(lang, translations);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/translations/{lang}/{key}")
    public ResponseEntity<Void> deleteTranslation(
            @PathVariable String lang, @PathVariable String key) {
        i18nService.deleteTranslation(lang, key);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/languages")
    public ResponseEntity<LanguageConfig> addLanguage(@RequestBody Map<String, String> body) {
        LanguageConfig config = i18nService.addLanguage(body.get("code"), body.get("name"));
        return ResponseEntity.ok(config);
    }
}
