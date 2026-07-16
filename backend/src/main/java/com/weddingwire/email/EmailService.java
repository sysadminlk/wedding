package com.weddingwire.email;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final RestTemplate restTemplate;

    @Value("${app.email.provider:smtp}")
    private String provider;

    @Value("${app.email.resend.api-key:}")
    private String resendApiKey;

    @Value("${app.email.resend.from-name:}")
    private String resendFromName;

    @Value("${app.email.resend.from-email:}")
    private String resendFromEmail;

    @Value("${app.email.smtp.from:}")
    private String smtpFrom;

    public void sendVerificationEmail(String to, String name, String code) {
        String subject = "Verify your email address";
        String html = "<p>Hi " + name + ",</p>"
                + "<p>Your verification code is: <strong>" + code + "</strong></p>"
                + "<p>This code will expire in 15 minutes.</p>";
        sendEmail(to, subject, html);
    }

    public void sendResetPasswordEmail(String to, String name, String code) {
        String subject = "Reset your password";
        String html = "<p>Hi " + name + ",</p>"
                + "<p>Your password reset code is: <strong>" + code + "</strong></p>"
                + "<p>This code will expire in 15 minutes.</p>";
        sendEmail(to, subject, html);
    }

    public void sendInvitationEmail(String to, String inviterName, String tenantName, String inviteLink) {
        String subject = "You've been invited to " + tenantName;
        String html = "<p>Hi,</p>"
                + "<p>" + inviterName + " has invited you to join <strong>" + tenantName + "</strong> on WeddingWire.</p>"
                + "<p><a href=\"" + inviteLink + "\">Accept Invitation</a></p>";
        sendEmail(to, subject, html);
    }

    public void sendCustomEmail(String to, String subject, String bodyHtml) {
        sendEmail(to, subject, bodyHtml);
    }

    private void sendEmail(String to, String subject, String html) {
        if ("resend".equals(provider)) {
            sendViaResend(to, subject, html);
        } else {
            sendViaSmtp(to, subject, html);
        }
    }

    private void sendViaResend(String to, String subject, String html) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            log.warn("Resend API key not configured — skipping email to {}", to);
            return;
        }

        Map<String, Object> request = Map.of(
                "from", resendFromName + " <" + resendFromEmail + ">",
                "to", new String[]{to},
                "subject", subject,
                "html", html
        );

        try {
            var headers = new org.springframework.http.HttpHeaders();
            headers.setBearerAuth(resendApiKey);
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            var entity = new org.springframework.http.HttpEntity<>(request, headers);
            restTemplate.postForEntity("https://api.resend.com/emails", entity, String.class);
            log.info("Email sent via Resend to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email via Resend to {}: {}", to, e.getMessage());
        }
    }

    private void sendViaSmtp(String to, String subject, String html) {
        if (smtpFrom == null || smtpFrom.isBlank()) {
            log.warn("SMTP from address not configured — skipping email to {}", to);
            return;
        }

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(smtpFrom);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            javaMailSender.send(message);
            log.info("Email sent via SMTP to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email via SMTP to {}: {}", to, e.getMessage());
        }
    }
}
