package com.weddingwire.auth;

import com.weddingwire.common.JwtUtil;
import com.weddingwire.user.User;
import com.weddingwire.user.UserRepository;
import com.weddingwire.user.UserTenant;
import com.weddingwire.user.UserTenantRepository;
import com.weddingwire.email.EmailService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserTenantRepository userTenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        String verificationCode = generate6DigitCode();
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .verificationCode(verificationCode)
                .verificationExpiresAt(LocalDateTime.now().plusMinutes(15))
                .build();

        userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), user.getName(), verificationCode);

        return AuthResponse.builder()
                .message("Registration successful. Please verify your email.")
                .build();
    }

    public AuthResponse verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }

        if (user.getVerificationExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification code expired");
        }

        if (!user.getVerificationCode().equals(request.getCode())) {
            throw new RuntimeException("Invalid verification code");
        }

        user.setEmailVerified(true);
        user.setVerificationCode(null);
        user.setVerificationExpiresAt(null);
        userRepository.save(user);

        return AuthResponse.builder()
                .message("Email verified successfully")
                .build();
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.getEmailVerified()) {
            throw new RuntimeException("Please verify your email first");
        }

        UUID tenantId = userTenantRepository.findByUserId(user.getId())
                .stream()
                .findFirst()
                .map(UserTenant::getTenantId)
                .orElse(null);

        String accessToken = jwtUtil.generateAccessToken(user.getId(), tenantId);
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .tenantId(tenantId)
                .build();
    }

    public AuthResponse resendVerification(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return AuthResponse.builder()
                    .message("If the email exists, a new code has been sent.")
                    .build();
        }

        if (user.getEmailVerified()) {
            return AuthResponse.builder()
                    .message("Email already verified.")
                    .build();
        }

        String verificationCode = generate6DigitCode();
        user.setVerificationCode(verificationCode);
        user.setVerificationExpiresAt(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), user.getName(), verificationCode);

        return AuthResponse.builder()
                .message("If the email exists, a new code has been sent.")
                .build();
    }

    public AuthResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            // Don't reveal whether email exists
            return AuthResponse.builder()
                    .message("If the email exists, a reset code has been sent.")
                    .build();
        }

        String resetCode = generate6DigitCode();
        user.setResetCode(resetCode);
        user.setResetExpiresAt(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        emailService.sendResetPasswordEmail(user.getEmail(), user.getName(), resetCode);

        return AuthResponse.builder()
                .message("If the email exists, a reset code has been sent.")
                .build();
    }

    public AuthResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getResetExpiresAt() == null || user.getResetExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset code expired");
        }

        if (!user.getResetCode().equals(request.getCode())) {
            throw new RuntimeException("Invalid reset code");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetCode(null);
        user.setResetExpiresAt(null);
        userRepository.save(user);

        return AuthResponse.builder()
                .message("Password reset successful")
                .build();
    }

    public LoginResponse googleLogin(GoogleLoginRequest request) {
        try {
            String tokenInfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + request.getIdToken();
            String googleResponse = restTemplate.getForObject(tokenInfoUrl, String.class);

            JsonNode googleUser = objectMapper.readTree(googleResponse);

            String email = googleUser.get("email").asText();
            String name = googleUser.get("name").asText();
            String picture = googleUser.has("picture") ? googleUser.get("picture").asText() : null;
            boolean emailVerified = googleUser.has("email_verified") && googleUser.get("email_verified").asBoolean();

            if (!emailVerified) {
                throw new RuntimeException("Google email not verified");
            }

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                String randomPassword = UUID.randomUUID().toString();
                User newUser = User.builder()
                        .name(name)
                        .email(email)
                        .passwordHash(passwordEncoder.encode(randomPassword))
                        .emailVerified(true)
                        .build();
                return userRepository.save(newUser);
            });

            UUID tenantId = userTenantRepository.findByUserId(user.getId())
                    .stream()
                    .findFirst()
                    .map(UserTenant::getTenantId)
                    .orElse(null);

            String accessToken = jwtUtil.generateAccessToken(user.getId(), tenantId);
            String refreshToken = jwtUtil.generateRefreshToken(user.getId());

            log.info("Google OAuth login for email={}", email);

            return LoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .userId(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .tenantId(tenantId)
                    .build();
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google OAuth verification failed: {}", e.getMessage());
            throw new RuntimeException("Invalid Google token");
        }
    }

    private String generate6DigitCode() {
        int code = (int) (Math.random() * 900000) + 100000;
        return String.valueOf(code);
    }
}
