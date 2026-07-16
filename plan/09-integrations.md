# Integrations — External Services

## Email (Resend / SMTP)

### Providers

| Provider | Use Case        | Notes                              |
|----------|-----------------|------------------------------------|
| Resend   | Primary         | Simple API, good deliverability    |
| SMTP     | Fallback        | Any SMTP server (Gmail, SendGrid)  |

### Configuration

```yaml
app:
  email:
    provider: resend  # or smtp
    resend:
      api-key: re_xxxxx
      from-name: weddingWire
      from-email: noreply@yourdomain.com
    smtp:
      host: smtp.gmail.com
      port: 587
      username: your@gmail.com
      password: your-app-password
      from: noreply@yourdomain.com
```

### Email Types

| Type              | Trigger                        | Template               |
|-------------------|--------------------------------|------------------------|
| Verification      | Registration                   | 6-digit code           |
| Password Reset    | Reset request                  | 6-digit code           |
| Save-the-Date     | Manual send (RSVP section)     | Customizable           |
| Invitation        | Manual send (RSVP section)     | Customizable           |
| RSVP Confirmation | Guest submits RSVP             | Auto-generated         |
| Collaborator Invite| Partner sends invite          | Invite link            |
| Export Ready      | Large export completes         | Download link          |

### Email Templates (Admin Customizable)

Stored in DB (`email_templates` table). Editable via Email Templates section.

```sql
email_template (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    type VARCHAR(50),        -- save_the_date, invitation, etc.
    subject VARCHAR(500),
    body_html TEXT,
    is_default BOOLEAN,      -- true = system default
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Template Rendering

- Thymeleaf templates in backend
- Variables: `{{partner1}}`, `{{partner2}}`, `{{date}}`, `{{venue}}`, `{{rsvp_link}}`
- Live preview in web UI (side-by-side: editor + preview)

### Implementation

```java
@Service
public class EmailService {
    private final EmailProvider provider;  // ResendProvider or SmtpProvider

    @Async
    public void sendVerification(String email, String code) {
        EmailTemplate template = templateRepository.findDefault("verification");
        String body = render(template, Map.of("code", code));
        provider.send(email, "Verify your weddingWire account", body);
    }

    @Async
    public void sendBulkEmails(List<String> emails, String tenantId, String type) {
        EmailTemplate template = templateRepository.findByTenantAndType(tenantId, type);
        for (String email : emails) {
            String body = render(template, Map.of("rsvp_link", buildRsvpLink(tenantId)));
            provider.send(email, template.getSubject(), body);
        }
    }
}
```

## SMS & WhatsApp (Twilio)

### Configuration

```yaml
app:
  twilio:
    account-sid: AC_xxxxx
    auth-token: xxxxx
    from-number: +1234567890
    whatsapp-from: "whatsapp:+1234567890"
```

### State

**Config-gated** — module is inert until Twilio credentials are added. No error, no behavior.

### SMS/WhatsApp Types

| Type              | Trigger                        | Channel            |
|-------------------|--------------------------------|--------------------|
| Save-the-Date     | Bulk send (RSVP section)       | SMS or WhatsApp    |
| Invitation        | Bulk send (RSVP section)       | SMS or WhatsApp    |
| Reminder          | Manual or scheduled            | SMS or WhatsApp    |
| RSVP Link         | Per-guest share                | SMS or WhatsApp    |

### Implementation

```java
@Service
public class SmsService {
    @Autowired(required = false)  // inert without config
    private TwilioRestClient twilioClient;

    public boolean isConfigured() {
        return twilioClient != null;
    }

    public void sendSms(String to, String body) {
        if (!isConfigured()) return;
        Message.creator(
            new PhoneNumber(to),
            new PhoneNumber(fromNumber),
            body
        ).create();
    }

    public void sendWhatsApp(String to, String body) {
        if (!isConfigured()) return;
        Message.creator(
            new PhoneNumber("whatsapp:" + to),
            new PhoneNumber("whatsapp:" + fromNumber),
            body
        ).create();
    }

    // Bulk send with queuing
    @Async
    public void sendBulk(List<String> numbers, String message, String channel) {
        for (String number : numbers) {
            if ("whatsapp".equals(channel)) {
                sendWhatsApp(number, message);
            } else {
                sendSms(number, message);
            }
            Thread.sleep(100);  // Rate limiting
        }
    }
}
```

### Per-Guest WhatsApp/SMS Links

```typescript
// Generate pre-filled WhatsApp message link
function generateWhatsAppLink(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
```

## File Storage (S3 / MinIO)

See `04-infrastructure.md` for Docker Compose and bucket config.

### Client Upload Flow

```typescript
// Web: src/lib/s3.ts
export async function uploadToS3(file: File, tenantId: string, folder: string): Promise<string> {
  // 1. Get presigned URL from backend
  const { url, key } = await api.post(`/${tenantId}/upload/presigned`, {
    filename: file.name,
    contentType: file.type,
    folder,
  });

  // 2. Upload directly to S3
  await fetch(url, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  // 3. Confirm upload with backend
  await api.post(`/${tenantId}/upload/confirm`, { key });

  return key;
}
```

### Content Types

| Content       | Folder        | Accepted Types                    |
|---------------|---------------|-----------------------------------|
| Photos        | photos/       | jpg, jpeg, png, webp              |
| Menu pages    | menu/         | jpg, jpeg, png, pdf               |
| Memories      | memories/     | webm, mp4, weba, mp3, ogg         |
| Inspiration   | inspiration/  | jpg, jpeg, png, webp              |
| QR codes      | share/        | png                               |

### File Size Limits

| Content       | Max Size      |
|---------------|---------------|
| Photos        | 10 MB         |
| Menu pages    | 20 MB         |
| Memories      | 50 MB         |
| Inspiration   | 5 MB          |

### Thumbnail Generation

- Backend generates thumbnails for photos (200x200, 400x400)
- Stored in same S3 bucket under `thumbs/` prefix
- Generated async after upload (Spring `@Async`)

## MediaRecorder (Guest Video/Voice)

### Browser-Native Recording

No plugins, no app — uses Web MediaRecorder API.

```typescript
// Web: src/components/share/MemoryRecorder.tsx
export function MemoryRecorder({ tenantId, slug }: Props) {
  const [recording, setRecording] = useState(false);
  const [mediaType, setMediaType] = useState<'video' | 'audio'>('video');

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: mediaType === 'video',
      audio: true,
    });

    const recorder = new MediaRecorder(stream, {
      mimeType: mediaType === 'video' ? 'video/webm' : 'audio/webm',
    });

    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType });
      uploadMemory(blob, tenantId, slug, mediaType);
    };

    recorder.start();
    setRecording(true);

    // Auto-stop after 60 seconds
    setTimeout(() => recorder.stop(), 60000);
  }

  function stopRecording() {
    recorder.stop();
    setRecording(false);
  }

  return (
    <div>
      <select value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
        <option value="video">Video</option>
        <option value="audio">Audio only</option>
      </select>
      {recording ? (
        <button onClick={stopRecording}>Stop ({timeRemaining}s)</button>
      ) : (
        <button onClick={startRecording}>Record</button>
      )}
    </div>
  );
}
```

### Upload Flow

```
1. Browser records via MediaRecorder
2. User stops recording (or auto-stop at 60s)
3. Blob uploaded to S3 via presigned URL
4. Backend saves memory metadata to DB
5. Couple sees it in their Memories section
```

### Mobile (Flutter)

- Flutter app does NOT record guest memories (that's web-only)
- Flutter app can VIEW memories (plays S3-hosted video/audio)
- Uses `video_player` or `chewie` package for playback

## Billing Gateways

See `06-billing.md` for full integration details.

## QR Code Generation

### Backend

```java
@Service
public class QrService {
    public byte[] generateQr(String content, int size) {
        // Use ZXing library
        BitMatrix matrix = new QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, size, size);
        return MatrixToImageWriter.toBufferedImage(matrix).toByteArray();
    }

    public String generateShareQr(String slug) {
        String url = "https://yourdomain.com/share/" + slug;
        byte[] qr = generateQr(url, 400);
        // Upload to S3, return URL
        return s3Service.upload("share/qr-" + slug + ".png", qr);
    }
}
```

### Usage

- Generated on tenant creation
- Displayable on RSVP page
- Printable on seating chart place cards
- Downloadable by couple

## Future Integrations (Not Now)

- Google Calendar sync
- Weather API for outdoor weddings
- Translation API for multi-language
- Analytics (Plausible, Umami)
