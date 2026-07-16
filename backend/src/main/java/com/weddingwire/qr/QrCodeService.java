package com.weddingwire.qr;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.weddingwire.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class QrCodeService {

    private final StorageService storageService;

    public byte[] generateQrCodePng(String url, int size) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(url, BarcodeFormat.QR_CODE, size, size);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate QR code for URL {}: {}", url, e.getMessage());
            throw new RuntimeException("QR code generation failed", e);
        }
    }

    public String generateAndUploadQrCode(UUID tenantId, String url) {
        byte[] qrPng = generateQrCodePng(url, 400);
        String key = tenantId + "/qr/qr-code.png";
        storageService.uploadBytes(key, qrPng, "image/png");
        return key;
    }

    public String getQrCodeUrl(UUID tenantId) {
        String key = tenantId + "/qr/qr-code.png";
        return storageService.generatePresignedGetUrl(key);
    }
}
