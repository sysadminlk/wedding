'use client';

import { useEffect, useRef, useState } from 'react';
import { Video, Mic, Circle, Square, Play, Upload, Clock } from 'lucide-react';
import api from '@/lib/api';
import type { GuestMemory } from '@/types';

interface PresignedResponse {
  uploadUrl: string;
  s3Key: string;
}

type Mode = 'video' | 'audio';
const MAX_SECONDS = 60;

export default function MemoryRecorder({ slug }: { slug: string }) {
  const [mode, setMode] = useState<Mode>('video');
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [memories, setMemories] = useState<GuestMemory[]>([]);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    api<GuestMemory[]>(`/api/public/share/${slug}/memories`)
      .then(setMemories)
      .catch(() => {});
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [slug]);

  const startRecording = async () => {
    setBlob(null);
    setPreviewUrl(null);
    setUploaded(false);
    setElapsed(0);
    chunksRef.current = [];

    const constraints: MediaStreamConstraints =
      mode === 'video'
        ? { video: true, audio: true }
        : { audio: true };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    streamRef.current = stream;

    const mr = new MediaRecorder(stream, {
      mimeType: mode === 'video' ? 'video/webm' : 'audio/webm',
    });
    mediaRef.current = mr;

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mr.onstop = () => {
      const b = new Blob(chunksRef.current, { type: mr.mimeType });
      setBlob(b);
      setPreviewUrl(URL.createObjectURL(b));
      stream.getTracks().forEach((t) => t.stop());
    };

    mr.start();
    setRecording(true);

    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= MAX_SECONDS) {
          stopRecording();
          return MAX_SECONDS;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecording(false);
  };

  const handleUpload = async () => {
    if (!blob) return;
    setUploading(true);
    try {
      const ext = mode === 'video' ? 'webm' : 'webm';
      const contentType = mode === 'video' ? 'video/webm' : 'audio/webm';
      const fileName = `memory-${Date.now()}.${ext}`;

      const presigned = await api<PresignedResponse>(`/api/public/share/${slug}/memories/upload`, {
        method: 'POST',
        body: JSON.stringify({ fileName, contentType }),
      });

      await fetch(presigned.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: blob,
      });

      await api(`/api/public/share/${slug}/memories/confirm`, {
        method: 'POST',
        body: JSON.stringify({ s3Key: presigned.s3Key, type: mode }),
      });

      setUploaded(true);
      setBlob(null);
      setPreviewUrl(null);
      setElapsed(0);

      const updated = await api<GuestMemory[]>(`/api/public/share/${slug}/memories`);
      setMemories(updated);
    } catch {
      // silent
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setBlob(null);
    setPreviewUrl(null);
    setUploaded(false);
    setElapsed(0);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const remaining = MAX_SECONDS - elapsed;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Video className="w-10 h-10 mx-auto mb-3" style={{ color: '#d4af37' }} />
        <h2 className="text-2xl font-heading font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Guest Memory Book
        </h2>
        <p className="font-body text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Record a video or audio message for the couple
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {(['video', 'audio'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { if (!recording) { setMode(m); reset(); } }}
            disabled={recording}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-label text-xs font-semibold transition-all duration-200 disabled:opacity-50"
            style={{
              background: mode === m && !recording
                ? 'linear-gradient(135deg, #d4af37 0%, #e9c349 50%, #d4af37 100%)'
                : '#f0eded',
              color: mode === m && !recording ? '#1c1b1b' : '#7f7663',
            }}
          >
            {m === 'video' ? <Video className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {m === 'video' ? 'Video' : 'Audio'}
          </button>
        ))}
      </div>

      <div
        className="rounded-2xl p-6 flex flex-col items-center gap-4"
        style={{ backgroundColor: '#ffffff', border: '1px solid #e5e2e1' }}
      >
        {mode === 'video' && !previewUrl && (
          <div
            className="w-full aspect-video rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#1c1b1b' }}
          >
            {recording ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#ba1a1a' }} />
                <p className="font-label text-xs text-white/70">Recording</p>
              </div>
            ) : (
              <Video className="w-12 h-12 text-white/20" />
            )}
          </div>
        )}

        {mode === 'audio' && !previewUrl && (
          <div
            className="w-full h-32 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#f6f3f2' }}
          >
            {recording ? (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#ba1a1a' }} />
                <div className="flex gap-0.5">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full animate-pulse"
                      style={{
                        height: `${8 + Math.random() * 24}px`,
                        backgroundColor: '#d4af37',
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Mic className="w-10 h-10" style={{ color: '#d0c5af' }} />
            )}
          </div>
        )}

        {previewUrl && (
          <div className="w-full">
            {mode === 'video' ? (
              <video src={previewUrl} className="w-full rounded-xl" controls />
            ) : (
              <audio src={previewUrl} className="w-full" controls />
            )}
          </div>
        )}

        {recording && (
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" style={{ color: '#ba1a1a' }} />
            <span className="font-label text-sm font-semibold tabular-nums" style={{ color: '#ba1a1a' }}>
              {formatTime(remaining)}
            </span>
          </div>
        )}

        <div className="flex gap-3">
          {!recording && !previewUrl && (
            <button
              onClick={startRecording}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #e9c349 50%, #d4af37 100%)',
              }}
            >
              <Circle className="w-6 h-6" style={{ color: '#1c1b1b' }} fill="#1c1b1b" />
            </button>
          )}

          {recording && (
            <button
              onClick={stopRecording}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 animate-pulse"
              style={{ backgroundColor: '#ba1a1a' }}
            >
              <Square className="w-5 h-5 text-white" fill="white" />
            </button>
          )}

          {previewUrl && !uploaded && (
            <>
              <button
                onClick={reset}
                className="px-5 py-3 rounded-xl font-label font-semibold text-xs transition-all duration-200"
                style={{ border: '1px solid #d0c5af', color: 'var(--color-text-primary)' }}
              >
                Retake
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-label font-semibold text-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #166d43 0%, #1e8a55 100%)',
                  color: '#ffffff',
                }}
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Send to Couple'}
              </button>
            </>
          )}
        </div>

        {uploaded && (
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ backgroundColor: '#166d1310', border: '1px solid #166d1330' }}
          >
            <Play className="w-4 h-4" style={{ color: '#166d13' }} />
            <p className="font-body text-sm" style={{ color: '#166d13' }}>
              Memory sent! Thank you.
            </p>
          </div>
        )}
      </div>

      {memories.length > 0 && (
        <div>
          <p className="font-label text-xs uppercase tracking-wider mb-4" style={{ color: '#7f7663' }}>
            Guest Memories ({memories.length})
          </p>
          <div className="space-y-3">
            {memories.map((mem) => (
              <div
                key={mem.id}
                className="rounded-xl p-4"
                style={{ backgroundColor: '#ffffff', border: '1px solid #e5e2e1' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  {mem.type === 'video' ? (
                    <Video className="w-4 h-4" style={{ color: '#d4af37' }} />
                  ) : (
                    <Mic className="w-4 h-4" style={{ color: '#d4af37' }} />
                  )}
                  <span className="font-label text-xs font-semibold" style={{ color: '#7f7663' }}>
                    {mem.guestName || 'Anonymous'}
                  </span>
                  <span className="font-label text-xs" style={{ color: '#d0c5af' }}>
                    {new Date(mem.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {mem.type === 'video' ? (
                  <video src={mem.fileUrl} className="w-full rounded-lg max-h-48" controls />
                ) : (
                  <audio src={mem.fileUrl} className="w-full" controls />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
