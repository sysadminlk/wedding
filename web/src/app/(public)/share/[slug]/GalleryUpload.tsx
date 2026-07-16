'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Upload, X, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

interface Photo {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  createdAt: string;
}

interface PresignedResponse {
  uploadUrl: string;
  s3Key: string;
}

export default function GalleryUpload({ slug }: { slug: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<Photo[]>(`/api/public/share/${slug}/photos`)
      .then(setPhotos)
      .catch(() => {});
  }, [slug]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setSuccess(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const presigned = await api<PresignedResponse>(`/api/public/share/${slug}/gallery/upload`, {
        method: 'POST',
        body: JSON.stringify({ fileName: selectedFile.name, contentType: selectedFile.type }),
      });

      await fetch(presigned.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': selectedFile.type },
        body: selectedFile,
      });

      await api(`/api/public/share/${slug}/gallery/confirm`, {
        method: 'POST',
        body: JSON.stringify({ s3Key: presigned.s3Key }),
      });

      setSuccess(true);
      setSelectedFile(null);
      setPreview(null);
      if (inputRef.current) inputRef.current.value = '';

      const updated = await api<Photo[]>(`/api/public/share/${slug}/photos`);
      setPhotos(updated);
    } catch {
      // silent
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setSuccess(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Camera className="w-10 h-10 mx-auto mb-3" style={{ color: '#d4af37' }} />
        <h2 className="text-2xl font-heading font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Photo & Video Gallery
        </h2>
        <p className="font-body text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Share your favourite moments from the celebration
        </p>
      </div>

      <div
        className="rounded-2xl p-6 text-center transition-all duration-200"
        style={{ backgroundColor: '#ffffff', border: '2px dashed #d0c5af' }}
      >
        {preview ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              {selectedFile?.type.startsWith('video/') ? (
                <video src={preview} className="max-h-48 rounded-xl mx-auto" controls />
              ) : (
                <img src={preview} alt="Preview" className="max-h-48 rounded-xl mx-auto object-cover" />
              )}
              <button
                onClick={clearSelection}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#ba1a1a', color: '#ffffff' }}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-label font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #e9c349 50%, #d4af37 100%)',
                color: '#1c1b1b',
              }}
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        ) : (
          <label className="cursor-pointer block">
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Camera className="w-10 h-10 mx-auto mb-3" style={{ color: '#d0c5af' }} />
            <p className="font-label text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Tap to select a photo or video
            </p>
            <p className="font-body text-xs mt-1" style={{ color: '#7f7663' }}>
              JPG, PNG, MOV, or MP4
            </p>
          </label>
        )}
      </div>

      {success && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{ backgroundColor: '#166d1310', border: '1px solid #166d1330' }}
        >
          <CheckCircle className="w-5 h-5 shrink-0" style={{ color: '#166d13' }} />
          <p className="font-body text-sm" style={{ color: '#166d13' }}>
            Your photo has been uploaded successfully!
          </p>
        </div>
      )}

      {photos.length > 0 && (
        <div>
          <p className="font-label text-xs uppercase tracking-wider mb-4" style={{ color: '#7f7663' }}>
            Guest Photos ({photos.length})
          </p>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <div key={photo.id} className="aspect-square rounded-xl overflow-hidden" style={{ border: '1px solid #e5e2e1' }}>
                <img
                  src={photo.thumbnailUrl || photo.imageUrl}
                  alt={photo.caption || ''}
                  className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
