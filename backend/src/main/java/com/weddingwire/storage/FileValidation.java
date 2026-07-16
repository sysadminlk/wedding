package com.weddingwire.storage;

import com.weddingwire.common.BusinessException;

public class FileValidation {

    private static final long IMAGE_MAX_SIZE = 10 * 1024 * 1024;
    private static final long VIDEO_MAX_SIZE = 100 * 1024 * 1024;
    private static final long AUDIO_MAX_SIZE = 25 * 1024 * 1024;
    private static final long PDF_MAX_SIZE = 10 * 1024 * 1024;
    private static final long OTHER_MAX_SIZE = 5 * 1024 * 1024;

    private FileValidation() {
    }

    public static void validateFileSize(long size, String contentType) {
        long maxSize = getMaxSize(contentType);
        if (size > maxSize) {
            throw new BusinessException(
                    "File size exceeds the limit of " + (maxSize / (1024 * 1024)) + "MB for " + contentType);
        }
    }

    public static String getCategory(String contentType) {
        if (contentType == null) return "photos";
        if (contentType.startsWith("image/")) return "photos";
        if (contentType.startsWith("video/") || contentType.startsWith("audio/")) return "memories";
        if ("application/pdf".equals(contentType)) return "menu";
        return "inspiration";
    }

    private static long getMaxSize(String contentType) {
        if (contentType == null) return OTHER_MAX_SIZE;
        if (contentType.startsWith("image/")) return IMAGE_MAX_SIZE;
        if (contentType.startsWith("video/")) return VIDEO_MAX_SIZE;
        if (contentType.startsWith("audio/")) return AUDIO_MAX_SIZE;
        if ("application/pdf".equals(contentType)) return PDF_MAX_SIZE;
        return OTHER_MAX_SIZE;
    }
}
