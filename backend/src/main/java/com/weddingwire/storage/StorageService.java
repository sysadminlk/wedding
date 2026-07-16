package com.weddingwire.storage;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${app.s3.bucket}")
    private String bucket;

    public PresignedUrlResponse generatePresignedPutUrl(UUID tenantId, String fileName, String contentType,
                                                         String category) {
        String s3Key = tenantId + "/" + category + "/" + UUID.randomUUID() + "-" + fileName;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(s3Key)
                .contentType(contentType)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .putObjectRequest(putObjectRequest)
                .build();

        var presignedRequest = s3Presigner.presignPutObject(presignRequest);

        PresignedUrlResponse response = new PresignedUrlResponse();
        response.setUploadUrl(presignedRequest.url().toString());
        response.setS3Key(s3Key);
        response.setPresignedGetUrl(null);
        response.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        return response;
    }

    public String generatePresignedGetUrl(String s3Key) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucket)
                .key(s3Key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .getObjectRequest(getObjectRequest)
                .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    public byte[] generateThumbnail(byte[] imageBytes, String fileName) {
        String extension = "";
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = fileName.substring(dotIndex + 1).toLowerCase();
        }

        if (!isValidImageExtension(extension)) {
            return null;
        }

        try {
            ByteArrayInputStream inputStream = new ByteArrayInputStream(imageBytes);
            BufferedImage originalImage = ImageIO.read(inputStream);
            if (originalImage == null) {
                return null;
            }

            int targetWidth = 200;
            int targetHeight = 200;

            double ratioX = (double) targetWidth / originalImage.getWidth();
            double ratioY = (double) targetHeight / originalImage.getHeight();
            double ratio = Math.min(ratioX, ratioY);

            int scaledWidth = (int) (originalImage.getWidth() * ratio);
            int scaledHeight = (int) (originalImage.getHeight() * ratio);

            BufferedImage thumbnail = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
            var graphics2D = thumbnail.createGraphics();
            graphics2D.setRenderingHint(java.awt.RenderingHints.KEY_INTERPOLATION,
                    java.awt.RenderingHints.VALUE_INTERPOLATION_BILINEAR);

            int offsetX = (targetWidth - scaledWidth) / 2;
            int offsetY = (targetHeight - scaledHeight) / 2;

            graphics2D.fillRect(0, 0, targetWidth, targetHeight);
            graphics2D.drawImage(originalImage, offsetX, offsetY, scaledWidth, scaledHeight, null);
            graphics2D.dispose();

            java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream();
            ImageIO.write(thumbnail, extension, outputStream);
            return outputStream.toByteArray();
        } catch (IOException e) {
            return null;
        }
    }

    public void uploadBytes(String s3Key, byte[] data, String contentType) {
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(s3Key)
                .contentType(contentType)
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(data));
    }

    public void deleteFile(String s3Key) {
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(s3Key)
                .build();

        s3Client.deleteObject(deleteObjectRequest);
    }

    public byte[] getObjectBytes(String s3Key) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucket)
                .key(s3Key)
                .build();

        try (InputStream inputStream = s3Client.getObject(getObjectRequest)) {
            return inputStream.readAllBytes();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read object from S3: " + s3Key, e);
        }
    }

    private boolean isValidImageExtension(String extension) {
        return "jpg".equals(extension) || "jpeg".equals(extension)
                || "png".equals(extension) || "gif".equals(extension)
                || "bmp".equals(extension) || "webp".equals(extension);
    }
}
