package com.weddingwire.auth;

import com.weddingwire.common.JwtUtil;
import com.weddingwire.user.User;
import com.weddingwire.user.UserRepository;
import com.weddingwire.user.UserTenant;
import com.weddingwire.user.UserTenantRepository;
import com.weddingwire.email.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserTenantRepository userTenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

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

    private String generate6DigitCode() {
        int code = (int) (Math.random() * 900000) + 100000;
        return String.valueOf(code);
    }
}
